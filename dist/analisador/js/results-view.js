const byId = (id) => document.getElementById(id);
const percentFormat = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const moneyFormat = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const percent = (value) => `${percentFormat.format(value)}%`;

export function showResults({ totalPages, analyzed, errors, summary, pricing, pricingError }) {
  byId("results").hidden = !summary && !analyzed && !errors;
  byId("complete-summary").hidden = !summary;
  byId("counts").textContent = `${summary ? "" : "Resultado parcial · "}${totalPages} no total · ${analyzed} analisadas · ${errors} com erro`;
  byId("csv").hidden = !summary;
  byId("json").hidden = !summary;
  byId("json").disabled = !pricing;
  if (!summary) return;

  const { distribution } = summary;
  byId("distribution").replaceChildren(...Object.entries(distribution).map(([category, count]) => {
    const item = document.createElement("li");
    item.textContent = `${percent(category)} · ${count} ${count === 1 ? "página" : "páginas"}`;
    return item;
  }));
  byId("sheets").textContent = pricing?.sheetsPerCopy ?? "—";
  byId("sheet-detail").textContent = pricing ? `${pricing.simplexSheets} frente · ${pricing.duplexSheets} F/V` : "";
  byId("sale-per-copy").textContent = pricing ? moneyFormat.format(pricing.salePerCopyCents / 100) : "—";
  byId("sale-total").textContent = pricing ? moneyFormat.format(pricing.saleTotalCents / 100) : "—";
  byId("pricing-error").hidden = !pricingError;
  byId("pricing-error").textContent = pricingError;
}
