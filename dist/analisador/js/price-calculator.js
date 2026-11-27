import { bookTiers, prices } from "./pricing-tables.js";

export function getBookTier(copies) {
  if (!Number.isSafeInteger(copies) || copies < 1) {
    throw new RangeError("Informe uma quantidade inteira e positiva de livros.");
  }
  return copies < 100 ? bookTiers.ate99 : bookTiers.aPartir100;
}

export function calculateBookPricing(pageCount, category, { printer, paper, mode, copies }) {
  const tier = getBookTier(copies);
  const rates = prices[printer][tier.id][category];
  const column = paper === "A3" ? 2 : 0;
  const duplexSheets = mode === "duplex" ? Math.floor(pageCount / 2) : 0;
  const simplexSheets = pageCount - 2 * duplexSheets;
  const salePerCopyCents = duplexSheets * rates[column + 1] + simplexSheets * rates[column];
  const saleTotalCents = salePerCopyCents * copies;
  if (!Number.isSafeInteger(saleTotalCents)) throw new RangeError("O preço excede o limite de cálculo.");
  return {
    tier: tier.id,
    marginPercent: tier.marginPercent,
    duplexSheets,
    simplexSheets,
    sheetsPerCopy: duplexSheets + simplexSheets,
    salePerCopyCents,
    saleTotalCents,
  };
}
