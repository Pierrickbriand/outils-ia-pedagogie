# suivi.js 4.6.5 : dans les deux dernières minutes de l'appel, le bandeau de l'étudiant non signalé passe à l'orange avec un compte à rebours.
# Lancer depuis la racine du dépôt : python3 -I suivi/tests/suivi_465_test.py  (Playwright installé). L'Atelier est simulé (aucun réseau).
import asyncio, json, os, time
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
SUIVI = open(os.path.join(HERE, '..', 'suivi.js'), encoding='utf-8').read()
APP, CLE, ENVOI, BASE = 'demo-2026', 'demo', 'https://envoi.test/exec', 'https://cours.test/index.html'
PAGE = ('<!doctype html><html><head><meta charset="utf-8"><title>Démo</title></head><body style="margin:0;min-height:900px">'
        '<script>window.COURS={app_id:"%s",cle:"%s",envoi_url:"%s",etiquette:"Démo cours"};</script>'
        '<script src="https://pierrickbriand.github.io/outils-ia-pedagogie/suivi/suivi.js"></script></body></html>') % (APP, CLE, ENVOI)
fails = []
def ok(c, m):
    print(('  ok   ' if c else '  ÉCHEC ') + m)
    if not c: fails.append(m)
ETAT = {'appel': {'jour': '2026-11-24', 'demi': 'matin', 'promo': '', 'reste': 500, 'alerte': 120}, 'present': 0}

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1200, 'height': 800})
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
                    if d.get('action') == 'present': ETAT['present'] += 1
                    rep = {'ok': True, 'label': 'Pierrick B.'} if d.get('action') == 'code' else {'ok': True}
                    return await r.fulfill(status=200, content_type='application/json', body=json.dumps(rep))
                if 'pilote=' in u:
                    rep = {'ok': True, 'p': ''}
                    if ETAT['appel']: rep['appel'] = ETAT['appel']
                    return await r.fulfill(status=200, content_type='application/json', body=json.dumps(rep))
                return await r.fulfill(status=200, content_type='application/json', body='{"ok":true}')
            return await r.abort()
        await pg.route(lambda u: True, reseau)
        await pg.goto(BASE)
        LIRE = "()=>{const d=document.getElementById('suivi-appel');return d?{c:d.className,t:d.textContent,bg:getComputedStyle(d).backgroundColor,b:!!d.querySelector('button')}:null}"
        v = None
        for _ in range(40):
            await pg.wait_for_timeout(1000); v = await pg.evaluate(LIRE)
            if v: break
        ok(bool(v) and v['b'], 'bandeau d’appel affiché avec son bouton : %s' % (v,))
        ok(bool(v) and v['c'] == '' and 'Appel en cours' in v['t'], 'plus de deux minutes : bandeau vert, texte inchangé')
        ETAT['appel'] = dict(ETAT['appel'], reste=100)
        for _ in range(25):
            await pg.wait_for_timeout(1000); v = await pg.evaluate(LIRE)
            if v and v['c'] == 'alerte': break
        ok(bool(v) and v['c'] == 'alerte', 'moins de deux minutes : classe « alerte » posée')
        ok(bool(v) and v['bg'] == 'rgb(180, 83, 9)', 'fond orange : %s' % (v and v['bg'],))
        ok(bool(v) and 'ferme dans 1 min' in v['t'] and 'Signalez votre présence' in v['t'], 'compte à rebours affiché : %s' % (v and v['t'],))
        t1 = v['t'] if v else ''
        await pg.wait_for_timeout(3000); v = await pg.evaluate(LIRE)
        ok(bool(v) and v['t'] != t1, 'le décompte avance : %s' % (v and v['t'],))
        await pg.click('#suivi-appel button'); await pg.wait_for_timeout(1500); v = await pg.evaluate(LIRE)
        ok(ETAT['present'] == 1, 'la présence part vers l’Atelier')
        ok(bool(v) and v['c'] == '' and 'Présence enregistrée' in v['t'], 'après « Je suis là » : bandeau vert, décompte arrêté : %s' % (v,))
        ok(not errs, 'aucune erreur de page : %s' % errs)
        await b.close()
asyncio.run(main())
print('\nRÉSULTAT : ' + ('TOUT EST BON' if not fails else '%d échec(s)' % len(fails)))
raise SystemExit(1 if fails else 0)
