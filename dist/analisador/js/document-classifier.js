import { categories, classify } from "./page-classifier.js";

export function classifyDocument(pages) {
  if (!pages.length) throw new Error("Nenhuma página analisada.");
  const distribution = Object.fromEntries(categories.map((category) => [category, 0]));
  let sum = 0;
  for (const { category } of pages) {
    distribution[category]++;
    sum += category;
  }
  const average = sum / pages.length;
  return { distribution, average, automaticCategory: classify(average) };
}
