function download(name, type, content) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportCsv(pages) {
  const header = "pagina;area_pct;intensidade_pct;indice_visual_pct;categoria_pct";
  const rows = pages.map(({ number, area, intensity, visualIndex, category }) =>
    [number, area, intensity, visualIndex, category]
      .map((value) => value == null ? "" : String(value).replace(".", ","))
      .join(";"));
  download("kriar-paginas.csv", "text/csv;charset=utf-8", "\uFEFF" + [header, ...rows].join("\r\n"));
}

export function exportJson({ file, pages, analysis, settings, summary, manual, pricing }) {
  const report = {
    arquivo: { nome: file.name, tamanhoBytes: file.size },
    analise: analysis,
    configuracoes: settings,
    resumo: {
      paginasTotais: pages.length,
      paginasAnalisadas: pages.length,
      paginasComErro: 0,
      distribuicao: summary.distribution,
      mediaDasCategorias: summary.average,
      categoriaAutomatica: summary.automaticCategory,
      categoriaAplicada: manual ?? summary.automaticCategory,
      ajusteManual: manual !== null,
    },
    precificacao: pricing,
    paginas: pages.map(({ thumbnail, ...metrics }) => metrics),
  };
  download("kriar-relatorio.json", "application/json;charset=utf-8", JSON.stringify(report, null, 2));
}
