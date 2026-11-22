from pathlib import Path
from html import escape as e
from urllib.parse import quote
import json,re
root=Path(__file__).resolve().parents[1]
source=json.loads((root/'src/catalog-sections.json').read_text(encoding='utf-8'))
p=root/'dist/catalogo.html';html=p.read_text(encoding='utf-8')
def table(caption,headers,rows):
 return '<div class="catalog-table-scroll"><table class="catalog-price-table"><caption class="sr-only">'+e(caption)+'</caption><thead><tr>'+''.join('<th scope="col">'+e(h)+'</th>' for h in headers)+'</tr></thead><tbody>'+''.join('<tr><th scope="row">'+e(r[0])+'</th>'+''.join('<td>'+e(x)+'</td>' for x in r[1:])+'</tr>' for r in rows)+'</tbody></table></div>'
for category in source['categories']:
 commercial=category['name']=='Papelaria comercial'
 for item in category['products']:
  title=item['title'];content=''
  if item.get('production_groups'):
   for group in item['production_groups']:
    if commercial:
     deadline,_,specification=group['description'].partition(' · ')
     content+='<div class="catalog-production-group"><h4 class="catalog-price-subheading">'+e(specification or group['title'])+'</h4><p class="catalog-production-deadline">'+e(group['title'])+' · '+e(deadline)+'</p>'
    else:
     content+='<div class="catalog-production-group"><h4 class="catalog-price-subheading">'+e(group['title'])+' - '+e(group['description'])+'</h4>'
    paired=len(group['tables'])>1
    if paired:content+='<div class="catalog-paired-tables">'
    for t in group['tables']:
     content+='<div class="catalog-size-table"><h5>'+e(t['title'])+'</h5>'+table(group['title']+' · '+t['title'],t['headers'],t['rows'])+'</div>'
    if paired:content+='</div>'
    content+='</div>'
  elif (category['name']=='Identificação' or title in ['Receituários Personalizados','Blocos e Talões']) and item.get('extra_tables'):
   variants=[dict(caption=item['description'],headers=item['headers'],rows=item['rows'])]+item['extra_tables']
   layout=' catalog-three-tables' if len(variants)==3 else ''
   content+='<div class="catalog-paired-tables catalog-variant-tables'+layout+'">'
   for variant in variants:
    content+='<div class="catalog-size-table"><h4 class="catalog-price-subheading">'+e(variant['caption'])+'</h4>'+table(variant['caption'],variant['headers'],variant['rows'])+'</div>'
   content+='</div>'
  else:
   specification=item.get('description') or ('Opções por quantidade' if commercial else title)
   content+='<h4 class="catalog-price-subheading">'+e(specification)+'</h4>'
   if item.get('pending'):content+='<p class="catalog-pending-price">Valores sob consulta. Solicite o orçamento com a quantidade e as características do produto.</p>'
   else:
    headers=list(item['headers'])
    if commercial and title=='Livretos e Cartilhas':headers[0]='Páginas'
    content+=table('Preços de '+title,headers,item['rows'])
    for t in item.get('extra_tables',[]):
     specification=t['caption']+(' — '+t['description'] if t.get('description') else '')
     content+='<h4 class="catalog-price-subheading">'+e(specification)+'</h4>'
     content+=table(t['caption'],t['headers'],t['rows'])
  if item.get('notes'):content+='<ul class="catalog-price-notes">'+''.join('<li>'+e(n)+'</li>' for n in item['notes'])+'</ul>'
  content+=f'<a class="dark-button finishing-order" href="index.html?produto={quote(title)}#orcamento" aria-label="Pedir orçamento de {e(title)}">Pedir orçamento</a>'
  pattern=r'(<h3>'+re.escape(title)+r'</h3>.*?</summary><div class="catalog-price-panel">).*?(</div></details>)'
  html,n=re.subn(pattern,lambda m:m[1]+content+m[2],html,count=1,flags=re.S);assert n==1,title
# Scope the commercial stationery refinements to this category.
category_heading=html.index('<h2>Papelaria comercial</h2>')
category_start=html.rfind('<details ',0,category_heading)
category_end=html.index('>',category_start)
if 'data-catalog-commercial' not in html[category_start:category_end]:
 html=html[:category_end]+' data-catalog-commercial'+html[category_end:]
# The first five services are maintained directly in the page.
html=re.sub(r'(<div class="catalog-price-panel">)<p class="catalog-price-description">(.*?)</p>',r'\1<h4 class="catalog-price-subheading">\2</h4>',html,flags=re.S)
p.write_text(html,encoding='utf-8')
print('Rendered catalog panels with consistent specification headings.')
