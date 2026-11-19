# suivi.js 4.6.4 : sur téléphone, « ← Mes cours » et « Mes notes » se posent juste au-dessus de la barre du bas du cours, à sa hauteur réelle.
# Une fausse barre « .nav » (fixe, en bas) remplace celle du moteur ; sa hauteur change comme celle de la pastille d'état sur deux lignes.
# Lancer depuis la racine du dépôt : python3 -I suivi/tests/suivi_464_test.py  (Playwright installé). L'Atelier est simulé (aucun réseau).
import asyncio, json, os, time
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
SUIVI = open(os.path.join(HERE, '..', 'suivi.js'), encoding='utf-8').read()
APP, CLE, ENVOI, BASE = 'demo-2026', 'demo', 'https://envoi.test/exec', 'https://cours.test/index.html'
PAGE = ('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Démo</title></head><body style="margin:0;min-height:2000px">'
        '<div class="nav" id="nav" style="position:fixed;left:0;right:0;bottom:0;height:69px;background:#1B2740;color:#fff">barre du bas</div>'
        '<script>window.COURS={app_id:"%s",cle:"%s",envoi_url:"%s",etiquette:"Démo cours"};</script>'
        '<script src="https://pierrickbriand.github.io/outils-ia-pedagogie/suivi/suivi.js"></script></body></html>') % (APP, CLE, ENVOI)
fails = []
def ok(c, m):
    print(('  ok   ' if c else '  ÉCHEC ') + m)
    if not c: fails.append(m)

async def ouvrir(b, W, H):
    ctx = await b.new_context(viewport={'width': W, 'height': H})
    await ctx.add_init_script("if(!sessionStorage.getItem('i')){sessionStorage.setItem('i','1');localStorage.clear();localStorage.setItem('suivi-compte',%s);}" % json.dumps(json.dumps({'c': 'KM4P7XQ2', 't': int(time.time() * 1000)})))
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    async def reseau(r):
        u = r.request.url
        if u.split('?')[0].split('#')[0] == BASE: return await r.fulfill(status=200, content_type='text/html; charset=utf-8', body=PAGE)
        if 'outils-ia-pedagogie/suivi/suivi.js' in u: return await r.fulfill(status=200, content_type='application/javascript', body=SUIVI)
        if u.startswith(ENVOI):
            if r.request.method == 'POST':
                d = json.loads(r.request.post_data or '{}')
                rep = {'ok': True, 'label': 'Pierrick B.'} if d.get('action') == 'code' else {'ok': True}
                return await r.fulfill(status=200, content_type='application/json', body=json.dumps(rep))
            return await r.fulfill(status=200, content_type='application/json', body='{"ok":true}')
        return await r.abort()
    await pg.route(lambda u: True, reseau)
    await pg.goto(BASE); await pg.wait_for_timeout(3500)
    return ctx, pg, errs

RECT = "()=>{const q=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {t:r.top,b:r.bottom}};return {z:q('#suivi-btns'),n:q('#nav'),vh:innerHeight,bas:document.getElementById('suivi-btns')&&document.getElementById('suivi-btns').style.bottom}}"
async def haut(pg, h): await pg.evaluate("(h)=>{const n=document.getElementById('nav');n.style.display='block';n.style.height=h+'px'}", h); await pg.wait_for_timeout(1500)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for W, H in ((390, 844), (360, 640)):
            print('[téléphone %d × %d]' % (W, H))
            ctx, pg, errs = await ouvrir(b, W, H)
            r = await pg.evaluate(RECT)
            ok(r['z'] is not None, 'la pastille « ← Mes cours » est présente')
            ok(r['z']['b'] <= r['n']['t'] - 4 and r['z']['b'] >= r['n']['t'] - 12, 'barre de 69 px : la pastille se pose juste au-dessus (écart %.0f px)' % (r['n']['t'] - r['z']['b']))
            await haut(pg, 110); r = await pg.evaluate(RECT)
            ok(r['z']['b'] <= r['n']['t'] - 4, 'barre de 110 px (deux lignes) : aucun chevauchement (écart %.0f px)' % (r['n']['t'] - r['z']['b']))
            await haut(pg, 69); r = await pg.evaluate(RECT)
            ok(r['z']['b'] <= r['n']['t'] - 4 and r['z']['b'] >= r['n']['t'] - 12, 'barre revenue à 69 px : la pastille redescend')
            await pg.evaluate("()=>{document.getElementById('nav').style.display='none'}"); await pg.wait_for_timeout(1500); r = await pg.evaluate(RECT)
            ok(r['vh'] - r['z']['b'] >= 14 and r['vh'] - r['z']['b'] <= 40, 'sans barre (écran de départ) : la pastille se pose près du bord (%.0f px)' % (r['vh'] - r['z']['b']))
            ok(not errs, 'aucune erreur de page : ' + str(errs))
            await ctx.close()
        print('[grand écran 1280 × 720 : inchangé, en haut à droite]')
        ctx, pg, errs = await ouvrir(b, 1280, 720)
        r = await pg.evaluate(RECT)
        ok(r['bas'] == '' and abs(r['z']['t'] - 12) <= 1, 'aucun décalage ajouté, la pastille reste en haut (top %.0f px)' % r['z']['t'])
        ok(not errs, 'aucune erreur de page : ' + str(errs))
        await ctx.close()
        await b.close()
    print('\nTout est vert.' if not fails else '\n%d échec(s).' % len(fails))
    raise SystemExit(1 if fails else 0)
asyncio.run(main())
