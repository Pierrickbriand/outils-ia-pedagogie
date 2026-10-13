# Assemble index.html depuis les sources de ce dossier : python3 src/build.py (depuis tnbim-esct/)
import pathlib, sys
here = pathlib.Path(__file__).parent
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else here.parent / 'index.html'
css = (here/'style.css').read_text(encoding='utf-8')
fichiers = ['01-donnees.js','02-moteur.js','04-consignes.js','05-chapitres.js','05b-projets.js','06-dossier.js','07-interface.js']
js = '\n'.join((here/f).read_text(encoding='utf-8') for f in fichiers)
js = "(function () {\n'use strict';\n" + js + "\n})();"
(here/'bundle.js').write_text(js, encoding='utf-8')
html = (here/'shell.html').read_text(encoding='utf-8').replace('/*__CSS__*/', css).replace('/*__JS__*/', js)
assert '</script>' not in js
for bad in ['—', '―']:
    assert bad not in html, 'tiret cadratin présent'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(html, encoding='utf-8')
print('écrit', out, len(html.encode('utf-8')), 'octets')
