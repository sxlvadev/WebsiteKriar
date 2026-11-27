import assert from "node:assert/strict";
import { test } from "node:test";
import { classify, classifyPage } from "../dist/analisador/js/page-classifier.js";
import { classifyDocument } from "../dist/analisador/js/document-classifier.js";
import { calculateBookPricing } from "../dist/analisador/js/price-calculator.js";
import { measurePixels } from "../dist/analisador/js/pixel-analyzer.js";

const settings = { printer: "canon", paper: "A4", mode: "simplex", copies: 1 };

test("enquadramento preserva os limites inclusivos", () => {
  for (const [value, expected] of [[0, 5], [5, 5], [5.01, 20], [20, 20], [20.01, 50], [50, 50], [50.01, 100], [100, 100]]) {
    assert.equal(classify(value), expected);
  }
});

test("índice visual da página é arredondado antes do enquadramento", () => {
  assert.deepEqual(classifyPage(5.4492), { visualIndex: 5, category: 5 });
  assert.deepEqual(classifyPage(5.5), { visualIndex: 6, category: 20 });
  assert.deepEqual(classifyPage(20.49), { visualIndex: 20, category: 20 });
  assert.deepEqual(classifyPage(50.5), { visualIndex: 51, category: 100 });
});

test("média usa categorias de todas as páginas", () => {
  assert.equal(classifyDocument([{ category: 5 }, { category: 5 }, { category: 20 }]).automaticCategory, 20);
  const pages = [...Array(9).fill(5), 100].map((category) => ({ category }));
  assert.deepEqual(classifyDocument(pages), {
    average: 14.5,
    automaticCategory: 20,
    distribution: { 5: 9, 20: 0, 50: 0, 100: 1 },
  });
});

test("uma página A4 frente em 20% usa o preço integral da tabela escolhida", () => {
  assert.equal(calculateBookPricing(1, 20, settings).saleTotalCents, 264);
  assert.equal(calculateBookPricing(1, 20, { ...settings, printer: "epson" }).saleTotalCents, 104);
});

test("cinco páginas F/V usam a tarifa frente na página isolada de cada livro", () => {
  assert.deepEqual(calculateBookPricing(5, 20, { ...settings, printer: "epson", mode: "duplex", copies: 50 }), {
    tier: "ate99", marginPercent: 80,
    duplexSheets: 2, simplexSheets: 1, sheetsPerCopy: 3, salePerCopyCents: 362, saleTotalCents: 18100,
  });
  assert.equal(calculateBookPricing(40, 20, { ...settings, printer: "epson", mode: "duplex" }).saleTotalCents, 2580);
});

test("Canon A3 F/V muda de tabela entre 99 e 100 livros", () => {
  const book = { ...settings, paper: "A3", mode: "duplex" };
  const at99 = calculateBookPricing(40, 50, { ...book, copies: 99 });
  const at100 = calculateBookPricing(40, 50, { ...book, copies: 100 });
  assert.equal(at99.marginPercent, 80);
  assert.equal(at99.salePerCopyCents, 34640);
  assert.equal(at99.saleTotalCents, 3429360);
  assert.equal(at100.marginPercent, 50);
  assert.equal(at100.salePerCopyCents, 13860);
  assert.equal(at100.saleTotalCents, 1386000);
});

test("a faixa inicial aceita 2 a 9 livros e a faixa de 50% segue acima de 1.000", () => {
  for (const copies of [2, 9]) {
    assert.equal(calculateBookPricing(1, 20, { ...settings, copies }).saleTotalCents, 264 * copies);
  }
  for (const [copies, total] of [[1000, 2820000], [1001, 2822820]]) {
    const result = calculateBookPricing(10, 100, { ...settings, copies });
    assert.equal(result.marginPercent, 50);
    assert.equal(result.salePerCopyCents, 2820);
    assert.equal(result.saleTotalCents, total);
  }
});

test("precificação rejeita tiragem inválida e total fora da precisão em centavos", () => {
  for (const copies of [NaN, 0, -1, 1.5, Number.MAX_SAFE_INTEGER]) {
    assert.throws(() => calculateBookPricing(5, 20, { ...settings, copies }), RangeError);
  }
});

test("branco tolerado conta na área total com escurecimento zero", () => {
  const pixels = (...colors) => Uint8ClampedArray.from(colors.flatMap((rgb) => [...rgb, 255]));
  assert.deepEqual(measurePixels(pixels([255, 255, 255], [247, 247, 247]), 8), {
    area: 0, intensity: null, visualIndex: 0,
  });
  assert.deepEqual(measurePixels(pixels([255, 255, 255], [0, 0, 0]), 8), {
    area: 50, intensity: 100, visualIndex: 50,
  });
  assert.deepEqual(measurePixels(pixels([0, 0, 0]), 8), {
    area: 100, intensity: 100, visualIndex: 100,
  });
  assert.ok(measurePixels(pixels([255, 255, 0]), 8).visualIndex < 8);
  assert.ok(measurePixels(pixels([235, 235, 235]), 8).visualIndex > 5);
});
