import { analysisConfig as defaultConfig, getAnalysisConfig, contactUrl } from "./config.js";
import { analyzePdf, AnalysisError, pdfjsVersion } from "./pdf-renderer.js";
import { classifyDocument } from "./document-classifier.js";
import { categoryLimits } from "./page-classifier.js";
import { calculateBookPricing, getBookTier } from "./price-calculator.js";
import { appendPage, showResults } from "./results-view.js";
import { exportCsv, exportJson } from "./export-results.js";

const byId = (id) => document.getElementById(id);
const fileInput = byId("file");
const dropzone = byId("dropzone");
const progress = byId("progress");
const override = byId("override");
let analysisConfig;
try {
  analysisConfig = getAnalysisConfig(window.location);
} catch (error) {
  byId("choose").disabled = true;
  showStatus(error.message, { error: true });
}
const sizeFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const mib = (bytes) => sizeFormat.format(bytes / (1024 * 1024));
const fileSize = (bytes) => {
  if (bytes >= 1024 * 1024) return `${mib(bytes)} MiB`;
  if (bytes >= 1024) return `${sizeFormat.format(bytes / 1024)} KiB`;
  return `${bytes} B`;
};
if (analysisConfig) byId("file-detail").textContent = fileLimits();
if (analysisConfig && analysisConfig !== defaultConfig) {
  const calibration = byId("calibration");
  calibration.textContent = `Calibra��o local � ${analysisConfig.longEdgePixels} px no lado maior � toler�ncia ao branco de ${analysisConfig.whiteTolerance}`;
  calibration.hidden = false;
}

let file;
let controller;
let pages = [];
let totalPages = 0;
let errors = 0;
let summary;
let pricing;

function fileLimits() {
  return `At� ${mib(analysisConfig.maxFileBytes)} MiB e ${analysisConfig.maxPages} p�ginas`;
}

function settings() {
  return {
    printer: byId("printer").value,
    paper: byId("paper").value,
    mode: byId("mode").value,
    copies: byId("copies").valueAsNumber,
  };
}

function manualCategory() {
  return override.value ? Number(override.value) : null;
}

function updateResults() {
  let pricingError = "";
  pricing = null;
  const manual = manualCategory();
  const currentSettings = settings();
  const copies = byId("copies");
  const quantityNote = byId("quantity-note");
  try {
    const tier = getBookTier(currentSettings.copies);
    copies.setCustomValidity("");
    quantityNote.textContent = summary
      ? `Faixa de pre�o � ${tier.label}`
      : `Faixa de pre�o � ${tier.label}. Analise o PDF para calcular o pre�o.`;
  } catch (error) {
    copies.setCustomValidity(error.message);
    quantityNote.textContent = error.message;
  }
  if (summary && copies.validity.valid) {
    try {
      pricing = calculateBookPricing(totalPages, manual ?? summary.automaticCategory, currentSettings);
    } catch (error) {
      pricingError = error.message;
    }
  }
  showResults({ totalPages, analyzed: pages.length, errors, summary, manual, pricing, pricingError });
}

function resetResults() {
  pages = [];
  totalPages = 0;
  errors = 0;
  summary = null;
  override.value = "";
  byId("rows").replaceChildren();
  updateResults();
}

function showStatus(message, { busy = false, error = false, contact = false } = {}) {
  byId("status-panel").hidden = !message;
  byId("status-panel").toggleAttribute("data-error", error);
  byId("status").textContent = message;
  byId("contact").hidden = !contact;
  progress.hidden = !busy;
}

function updateControls() {
  byId("analyze").disabled = !file;
  byId("analyze").hidden = Boolean(controller);
  byId("analyze").textContent = summary ? "Simular novamente" : "Simular impress�o";
  byId("cancel").hidden = !controller;
  byId("remove").hidden = !file;
  byId("choose").textContent = file ? "Trocar PDF" : "Selecionar PDF";
}

function selectFile(next) {
  if (!analysisConfig) return;
  controller?.abort();
  controller = null;
  file = null;
  resetResults();
  showStatus("");
  if (next && !/\.pdf$/i.test(next.name) && next.type !== "application/pdf") {
    showStatus("Selecione um arquivo PDF.", { error: true });
  } else if (next?.size > analysisConfig.maxFileBytes) {
    showStatus(`O arquivo tem ${mib(next.size)} MiB. ${fileLimits()}.`, { error: true });
  } else {
    file = next;
  }
  byId("file-name").textContent = file?.name ?? "Arraste seu PDF aqui";
  byId("file-detail").textContent = file ? fileSize(file.size) : fileLimits();
  updateControls();
}

async function runAnalysis(event) {
  event.preventDefault();
  if (!file || controller) return;
  resetResults();
  const run = new AbortController();
  controller = run;
  updateControls();
  progress.removeAttribute("value");
  showStatus("Abrindo PDF.", { busy: true });
  try {
    await analyzePdf(file, analysisConfig, run.signal, (total, page) => {
      totalPages = total;
      if (page) {
        pages.push(page);
        appendPage(page);
      }
      progress.max = total;
      progress.value = pages.length;
      showStatus(`${pages.length} de ${total} p�ginas analisadas`, { busy: true });
    });
    if (controller !== run) return;
    summary = classifyDocument(pages);
    updateResults();
    showStatus("");
  } catch (error) {
    if (controller !== run) return;
    if (run.signal.aborted) {
      resetResults();
      showStatus("An�lise cancelada.");
    } else {
      errors = error.pageNumber ? 1 : 0;
      updateResults();
      const message = error instanceof AnalysisError ? error.message : "N�o foi poss�vel ler este PDF. Confira o arquivo e tente novamente.";
      showStatus(message, { error: true, contact: true });
    }
  } finally {
    if (controller === run) {
      controller = null;
      updateControls();
    }
  }
}

byId("choose").addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  if (fileInput.files.length) selectFile(fileInput.files[0]);
  fileInput.value = "";
});
byId("remove").addEventListener("click", () => selectFile());
dropzone.addEventListener("dragover", (event) => {
  if (!event.dataTransfer.types.includes("Files")) return;
  event.preventDefault();
  dropzone.setAttribute("data-dragging", "");
});
dropzone.addEventListener("dragleave", (event) => {
  if (!dropzone.contains(event.relatedTarget)) dropzone.removeAttribute("data-dragging");
});
dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropzone.removeAttribute("data-dragging");
  if (event.dataTransfer.files.length) selectFile(event.dataTransfer.files[0]);
});
byId("settings").addEventListener("submit", runAnalysis);
byId("settings").addEventListener("input", updateResults);
byId("cancel").addEventListener("click", () => controller?.abort());
override.addEventListener("change", updateResults);
byId("restore").addEventListener("click", () => {
  override.value = "";
  updateResults();
  override.focus();
});
byId("contact").addEventListener("click", () => {
  if (contactUrl) {
    window.open(contactUrl, "_blank", "noopener,noreferrer");
    return;
  }
  byId("contact-detail").textContent = "Pe�a uma confer�ncia pelo canal habitual da Gr�fica Kriar e anexe o PDF na conversa.";
  byId("contact-dialog").showModal();
});
byId("csv").addEventListener("click", () => { if (summary) exportCsv(pages); });
byId("json").addEventListener("click", () => {
  if (summary && pricing) exportJson({
    file, pages, settings: settings(), summary, manual: manualCategory(), pricing,
    analysis: { ...analysisConfig, pdfjsVersion, categoryLimits, visualIndexDecimalPlaces: 0 },
  });
});
updateResults();
