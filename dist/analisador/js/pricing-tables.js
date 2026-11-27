// Preços em centavos por folha física da tabela 80/50 da Gráfica Kriar.
// Colunas: A4 frente, A4 frente e verso, A3 frente, A3 frente e verso.
export const prices = {
  epson: {
    ate99: {
      5: [87, 96, 125, 142],
      20: [104, 129, 158, 208],
      50: [137, 195, 224, 340],
      100: [195, 310, 340, 571],
    },
    aPartir100: {
      5: [35, 39, 50, 57],
      20: [42, 52, 64, 83],
      50: [55, 78, 90, 136],
      100: [78, 124, 136, 229],
    },
  },
  canon: {
    ate99: {
      5: [144, 184, 214, 294],
      20: [264, 424, 453, 773],
      50: [504, 903, 933, 1732],
      100: [703, 1303, 1333, 2531],
    },
    aPartir100: {
      5: [58, 74, 86, 118],
      20: [106, 170, 182, 310],
      50: [202, 362, 373, 693],
      100: [282, 521, 533, 1013],
    },
  },
};

export const bookTiers = {
  ate99: { id: "ate99", label: "1 a 99 livros", marginPercent: 80 },
  aPartir100: { id: "aPartir100", label: "100 livros ou mais", marginPercent: 50 },
};
