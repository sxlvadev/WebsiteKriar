export const categoryLimits = Object.freeze({ 5: 5, 20: 20, 50: 50, 100: 100 });
export const categories = Object.freeze(Object.keys(categoryLimits).map(Number));

export function classify(percent) {
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new RangeError("Percentual fora do intervalo de análise.");
  }
  return categories.find((category) => percent <= categoryLimits[category]);
}

export function classifyPage(visualIndex) {
  const roundedIndex = Math.round(visualIndex);
  return { visualIndex: roundedIndex, category: classify(roundedIndex) };
}
