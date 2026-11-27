# Gráfica Kriar

Site da Gráfica Kriar, em São Luís (MA). O cliente pode conhecer os serviços, consultar produtos e preços, simular a impressão de um PDF e montar um pedido para atendimento pelo WhatsApp.

[Acessar o site](https://www.graficakriar.com.br/)

## Páginas do site

| Página | O que o cliente encontra |
| --- | --- |
| [Início](https://www.graficakriar.com.br/) | Carrossel de produtos, serviços, chamada para o catálogo, etapas de atendimento, perguntas frequentes e formulário de orçamento. |
| [Catálogo](https://www.graficakriar.com.br/catalogo.html) | Categorias e produtos expansíveis, especificações, tabelas de preços, condições por produto e atalhos para pedir orçamento ou abrir o simulador. |
| [Simulador de impressões](https://www.graficakriar.com.br/analisador.html) | Análise de PDF no navegador e estimativa do preço por exemplar e da tiragem. |
| [Quem somos](https://www.graficakriar.com.br/sobre.html) | Apresentação da gráfica, localização em São Luís com Google Maps e atendimento a empresas, escolas, eventos e famílias. |
| [Política de privacidade](https://www.graficakriar.com.br/privacidade.html) | Responsável pelo tratamento, dados do orçamento, finalidades, serviços externos, conservação e direitos do titular. |

## Serviços e orçamento

A página inicial apresenta **impressos e xerox**, **brindes personalizados**, **livros e revistas** e **impressão 3D**. A seção *Como funciona* explica como escolher o produto, acertar os detalhes e aprovar a arte e o orçamento. As perguntas frequentes abordam arte pronta, envio de arquivos, pagamento, entrega e retirada.

Ao pedir orçamento pelo catálogo, o formulário recebe o produto e o serviço correspondente. O cliente informa nome, quantidade, prazo, medidas, situação da arte, forma de recebimento e detalhes do pedido. O site organiza essas informações em uma mensagem para WhatsApp. Também é possível copiar ou baixar o pedido.

## Produtos do catálogo

| Categoria | Produtos |
| --- | --- |
| Impressão e acabamento | Impressão em papel comum e em papéis especiais, impressão de fotos, encadernação espiral e plastificação. |
| Papelaria comercial | Cartões de visita, tags, panfletos e flyers, pastas com orelha, receituários, livretos e cartilhas, carteiras de vacinação e cartões de agradecimento. |
| Blocos e talões | Blocos e talões, blocos de rifas. |
| Identificação | Crachás personalizados e credenciais. |
| Brindes personalizados | Bottons e broches, canecas, marca-páginas e ímãs de geladeira. |
| Cardápios | Cardápios plastificados e em PVC. |
| Papelaria personalizada | Cadernos de capa dura, agendas, blocos e cadernetas, etiquetas escolares. |
| Calendários | De parede, de parede grandes, de destaque, de mesa triangulares, de mesa Wire-O e ímãs com calendário. |

## Simulador de impressões

1. Selecione ou arraste um PDF de até 100 MiB e 500 páginas.
2. Escolha a impressora (Canon ou Epson), o papel (A4 ou A3), os lados da impressão e a quantidade de exemplares.
3. Clique em **Simular impressão**. A página rola até a barra de progresso e permite cancelar a análise.
4. Consulte a quantidade de páginas em cada categoria de índice visual (5%, 20%, 50% e 100%), as folhas por exemplar, o preço unitário e o total estimado. O cálculo usa a classificação automática do documento.
5. Se necessário, exporte os resultados em CSV ou JSON.

O PDF.js processa o arquivo no navegador. Capa, acabamento, preparação e taxas de venda são calculados à parte.

## Identidade visual e navegação

O site usa fundo escuro, as cores ciano, magenta e amarelo da marca, componentes sem bordas e indicadores de foco para navegação por teclado. O cabeçalho oferece acesso ao catálogo, serviços, etapas do pedido, apresentação da gráfica e orçamento. Os atalhos de contato incluem WhatsApp, Instagram e Google Maps.

## Executar no Windows

Com Node.js e npm instalados, abra a pasta que contém `package.json` no VS Code. No terminal PowerShell, execute:

```powershell
npm.cmd ci
npm.cmd run preview
```

O preview compila o projeto e serve a pasta `dist/`. Abra [a página inicial local](http://127.0.0.1:4173/). Para encerrar o servidor, pressione **Ctrl + C**.

| Comando | Função |
| --- | --- |
| `npm.cmd test` | Executa os testes do simulador. |
| `npm.cmd run watch:css` | Recompila o CSS conforme o arquivo de estilos é editado. |
| `npm.cmd run build` | Gera o CSS minificado e copia PDF.js e seus recursos para o diretório publicado. |

## Onde editar

| Arquivos | Conteúdo |
| --- | --- |
| `dist/index.html`, `dist/app.js`, `dist/faq.js` | Página inicial, interações, orçamento e perguntas frequentes. |
| `dist/catalogo.html`, `dist/catalogo.js` | Página do catálogo e comportamento dos painéis expansíveis. |
| `src/catalog-sections.json`, `scripts/render-catalog.py` | Dados e geração dos painéis de produtos. Após editar o JSON, rode `py scripts/render-catalog.py` na raiz e confira as mudanças em `dist/catalogo.html`. Os cinco serviços de impressão e acabamento são mantidos diretamente no HTML. |
| `dist/analisador.html`, `dist/analisador/` | Interface, estilos e módulos do simulador. As tabelas de preços ficam em `js/pricing-tables.js` dentro dessa pasta. |
| `dist/sobre.html`, `dist/privacidade.html` | Conteúdo institucional, localização e política de privacidade. |
| `dist/contacts.js`, `dist/site-info.js` | Contatos e informações compartilhadas do site. |
| `dist/assets/` | Logotipo, símbolos, fotos de produtos e imagens do carrossel e dos serviços. |
| `src/input.css` | Estilos globais e entrada do Tailwind CSS. O build gera `dist/style.css`. |
| `test/analisador.test.js` | Testes de classificação e cálculo de preços. |

## Publicação

A Vercel usa a configuração de `vercel.json`: instala as dependências com `npm ci`, executa `npm run build` e publica `dist/`. O build inclui o PDF.js em `dist/analisador/vendor/pdfjs/` para que a biblioteca e o worker sejam servidos pelo domínio da gráfica.
