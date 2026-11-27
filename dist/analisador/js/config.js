export const analysisConfig = Object.freeze({
  version: "visual-rgb-0.1.0",
  basis: "pagina-pdf-inteira",
  longEdgePixels: 1200,
  whiteTolerance: 8,
  maxFileBytes: 100 * 1024 * 1024,
  maxPages: 500,
});

export function getAnalysisConfig({ hostname, search }) {
  if (!["localhost", "127.0.0.1", "[::1]"].includes(hostname)) return analysisConfig;
  const params = new URLSearchParams(search);
  if (!params.has("resolucao") && !params.has("tolerancia")) return analysisConfig;

  const resolution = params.get("resolucao") ?? String(analysisConfig.longEdgePixels);
  const tolerance = params.get("tolerancia") ?? String(analysisConfig.whiteTolerance);
  if (!/^\d+$/.test(resolution) || Number(resolution) < 300 || Number(resolution) > 2400 ||
      !/^\d+$/.test(tolerance) || Number(tolerance) > 32) {
    throw new RangeError("Use resolução inteira de 300 a 2400 px e tolerância inteira de 0 a 32.");
  }
  return Object.freeze({
    ...analysisConfig,
    longEdgePixels: Number(resolution),
    whiteTolerance: Number(tolerance),
  });
}

const whatsapp = String(globalThis.KRIAR_CONTACTS?.whatsapp ?? "").replace(/\D/g, "");
export const contactUrl = /^55\d{10,11}$/.test(whatsapp) ? `https://wa.me/${whatsapp}` : "";
