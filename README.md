# Gráfica Kriar

Site estático com Tailwind CSS.

## Analisador de PDFs

O botão **Simular preço da impressão**, na seção **Impressão de livros** do catálogo, abre `/analisador.html`. A página usa o cabeçalho, as cores e os contatos do site. O código do analisador fica em `dist/analisador/js/` e o PDF é processado no navegador.

Para testar no Windows:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run preview
```

O build copia a versão fixada do PDF.js e os recursos do worker para `dist/analisador/vendor/pdfjs/`, servidos pelo mesmo domínio.
