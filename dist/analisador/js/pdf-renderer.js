import { getDocument, GlobalWorkerOptions, PDFWorker, version } from "../vendor/pdfjs/legacy/build/pdf.mjs";
import { measurePixels } from "./pixel-analyzer.js";
import { classifyPage } from "./page-classifier.js";

const pdfjs = new URL("../vendor/pdfjs/", import.meta.url);
GlobalWorkerOptions.workerSrc = new URL("legacy/build/pdf.worker.min.mjs", pdfjs).href;
export const pdfjsVersion = version;

export class AnalysisError extends Error {}

export async function analyzePdf(file, config, signal, onProgress) {
  const data = new Uint8Array(await file.arrayBuffer());
  signal.throwIfAborted();
  const worker = new PDFWorker();
  const loadingTask = getDocument({
    data,
    worker,
    stopAtErrors: true,
    isEvalSupported: false,
    cMapUrl: new URL("cmaps/", pdfjs).href,
    standardFontDataUrl: new URL("standard_fonts/", pdfjs).href,
    wasmUrl: new URL("wasm/", pdfjs).href,
    iccUrl: new URL("iccs/", pdfjs).href,
  });
  let renderTask;
  let finishOperatorStream;
  const captureOperatorStreamEnd = ({ data: message }) => {
    // PDF.js 5.7.284 pode finalizar o canvas com uma lista parcial mesmo após
    // um erro no stream de operadores. Este é o único stream lido do worker.
    if (message.stream === 3) finishOperatorStream?.();
    if (message.stream === 5) finishOperatorStream?.(message.reason);
  };
  let disposal;
  const dispose = () => {
    if (!disposal) disposal = loadingTask.destroy().finally(() => {
      worker.port?.removeEventListener("message", captureOperatorStreamEnd);
      worker.destroy();
    });
    return disposal;
  };
  const cancel = () => {
    renderTask?.cancel();
    finishOperatorStream?.();
    // A rejeição também é observada no finally.
    void dispose().catch(() => {});
  };
  signal.addEventListener("abort", cancel, { once: true });
  let document;
  try {
    document = await loadingTask.promise;
    worker.port.addEventListener("message", captureOperatorStreamEnd);
    const { info } = await document.getMetadata();
    if (info.EncryptFilterName || (await document.getPermissions()) !== null) {
      throw new AnalysisError("PDF protegido. Selecione um arquivo sem proteção ou fale com a gráfica.");
    }
    if (document.numPages > config.maxPages) {
      throw new AnalysisError(`O PDF tem ${document.numPages} páginas. O limite desta versão é ${config.maxPages}.`);
    }
    if (!document.numPages) throw new AnalysisError("O PDF está sem páginas.");
    onProgress(document.numPages);

    for (let number = 1; number <= document.numPages; number++) {
      signal.throwIfAborted();
      const canvas = window.document.createElement("canvas");
      let page;
      try {
        page = await document.getPage(number);
        signal.throwIfAborted();
        const original = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: config.longEdgePixels / Math.max(original.width, original.height) });
        if (!(viewport.width > 0 && viewport.height > 0)) throw new Error("Dimensões inválidas.");
        canvas.width = Math.max(1, Math.round(viewport.width));
        canvas.height = Math.max(1, Math.round(viewport.height));
        const context = canvas.getContext("2d", { willReadFrequently: true });
        const operatorStream = new Promise((resolve) => { finishOperatorStream = resolve; });
        renderTask = page.render({
          canvas,
          canvasContext: context,
          viewport,
          transform: [canvas.width / viewport.width, 0, 0, canvas.height / viewport.height, 0, 0],
          intent: "print",
          background: "#ffffff",
        });
        const [, streamFailure] = await Promise.all([renderTask.promise, operatorStream]);
        signal.throwIfAborted();
        if (streamFailure) throw new Error(streamFailure.message);
        const metrics = measurePixels(context.getImageData(0, 0, canvas.width, canvas.height).data, config.whiteTolerance);
        const thumbnail = window.document.createElement("canvas");
        const thumbnailScale = 110 / Math.max(canvas.width, canvas.height);
        thumbnail.width = Math.max(1, Math.round(canvas.width * thumbnailScale));
        thumbnail.height = Math.max(1, Math.round(canvas.height * thumbnailScale));
        thumbnail.getContext("2d").drawImage(canvas, 0, 0, thumbnail.width, thumbnail.height);
        onProgress(document.numPages, {
          number, ...metrics, ...classifyPage(metrics.visualIndex), thumbnail: thumbnail.toDataURL("image/webp"),
        });
      } catch (error) {
        signal.throwIfAborted();
        const failure = new AnalysisError(`Falha ao analisar a página ${number}. O preço completo está indisponível.`, { cause: error });
        failure.pageNumber = number;
        throw failure;
      } finally {
        renderTask = undefined;
        finishOperatorStream = undefined;
        page?.cleanup();
        canvas.width = canvas.height = 0;
      }
      // Dá ao navegador uma oportunidade de atualizar o progresso e receber o cancelamento.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    signal.throwIfAborted();
  } catch (error) {
    signal.throwIfAborted();
    if (error.name === "PasswordException") {
      throw new AnalysisError("PDF protegido. Selecione um arquivo sem proteção ou fale com a gráfica.", { cause: error });
    }
    throw error;
  } finally {
    signal.removeEventListener("abort", cancel);
    await dispose().catch(() => {});
  }
}
