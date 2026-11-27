# Gráfica Kriar

Site estático com Tailwind CSS.

## Simulador de impressões

Acesse o simulador pelo [catálogo](dist/catalogo.html) ou pela rota `/analisador.html`. O cliente seleciona um PDF, escolhe a impressora, o formato do papel, a impressão simples ou frente e verso e a quantidade de exemplares.

O PDF é analisado no navegador. Ao iniciar a simulação, a página rola até a barra de progresso. O resultado mostra quantas páginas ficaram em cada categoria de índice visual (5%, 20%, 50% e 100%). A categoria automática do documento é usada para estimar o preço por exemplar e o total da tiragem.

O código do simulador fica em `dist/analisador/js/`.

## Executar no Windows

Na pasta do repositório, execute os comandos no PowerShell.

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd test
npm.cmd run preview
```

O build copia a versão fixada do PDF.js e os recursos do worker para `dist/analisador/vendor/pdfjs/`, servidos pelo mesmo domínio.
