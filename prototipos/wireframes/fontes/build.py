from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]
src = root / 'fontes'
model = (src / 'modelo.js').read_text()
model = model.replace("t(String(s.qty),17,600,{},{fixed:true})", "t(String(s.qty),17,600,'ink',{fixed:true})")
(src / 'modelo.js').write_text(model)
css = (src / 'estilos.css').read_text()
js = (src / 'preview.js').read_text()
html = '''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#DDEDFA"><title>PetZona · Prévia dos wireframes</title><style>__CSS__</style></head>
<body><main class="workspace">
<aside class="sidebar"><div class="brand"><span>Pet<em>Zona</em></span></div><div class="eyebrow">Estudo acadêmico · UX/UI</div><h1>Cuidado que aproxima.</h1><p>Explore as telas e os percursos do PetZona na paleta azul bebê, ameixa e lilás.</p><nav class="screen-links" id="screen-links" aria-label="Índice das telas"></nav><label for="screen-select" class="mobile-picker" style="padding:0;border:0;background:none">Navegar pelas telas</label><select id="screen-select" class="mobile-picker" aria-label="Navegar pelas telas"></select><div class="swatches"><span style="background:#65416F"></span><span style="background:#596D9E"></span><span style="background:#DFD2EC"></span><span style="background:#BED7ED"></span><span style="background:#26364F"></span></div><p class="project-note">Workshop da Fábrica de Software 2026.1<br>Exercício para a equipe de UX/UI do Adm4All.<br><br>Dados, valores e interações demonstrativos. Nenhuma compra ou reserva é enviada.</p></aside>
<section class="stage" aria-label="Prévia do aplicativo"><div class="toolbar"><label for="device-width">Visualização<select id="device-width"><option value="430">iPhone 16 Plus · 430</option><option value="390">Celular · 390</option><option value="360">Celular compacto · 360</option><option value="768">Tablet · 768</option></select></label><button id="reset">Reiniciar prévia</button></div><div class="device" id="device"><div class="status" aria-hidden="true"><span>9:41</span><span class="island"></span><span class="signal">••• ▰</span></div><header class="app-header" id="app-header"></header><div class="body"><div class="content" id="content"></div></div><div class="app-footer" id="app-footer"></div><nav class="app-nav" id="app-nav" aria-label="Navegação principal"></nav><div class="home-indicator" aria-hidden="true"></div></div><p class="caption"><span id="screen-caption"></span><br><span id="size-caption">430 × 932 · iPhone 16 Plus</span></p></section>
</main><div class="toast" id="toast" role="status" aria-live="polite"></div><script>__MODEL__</script><script>__JS__</script></body></html>'''
html = html.replace('__CSS__',css).replace('__MODEL__',model).replace('__JS__',js)
(root / 'Petzona-preview.html').write_text(html)
(root / 'plugin' / 'code.js').write_text(model+'\n'+(src / 'figma-repair.js').read_text()+'\n'+(src / 'figma-renderer.js').read_text())
print(json.dumps({'html':str(root/'Petzona-preview.html'),'plugin':str(root/'plugin'/'code.js')}))
