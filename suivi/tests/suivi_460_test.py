# suivi.js 4.6.0 : cours à compte par e-mail. Le code personnel gardé par la page « Mon compte » identifie l'étudiant sans fenêtre « Qui êtes-vous ? ».
# Un seul essai par cours et par navigateur ; sans compte (ou compte périmé), rien ne change.
# Lancer depuis la racine du dépôt : python3 -I suivi/tests/suivi_460_test.py  (Playwright installé). L'Atelier est simulé (aucun réseau).
import asyncio, json, os, time
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
SUIVI = open(os.path.join(HERE, '..', 'suivi.js'), encoding='utf-8').read()
APP, CLE, ENVOI, BASE = 'demo-2026', 'demo', 'https://envoi.test/exec', 'https://cours.test/index.html'
PAGE = ('<!doctype html><html><head><meta charset="utf-8"><title>Démo</title></head><body>'
        '<script>window.COURS={app_id:"%s",cle:"%s",envoi_url:"%s",etiquette:"Démo cours"};</script>'
        '<script src="https://pierrickbriand.github.io/outils-ia-pedagogie/suivi/suivi.js"></script></body></html>') % (APP, CLE, ENVOI)
fails = []
def ok(c, m):
    print(('  ok   ' if c else '  ÉCHEC ') + m)
    if not c: fails.append(m)

async def ouvrir(b, compte, reconnu):
    ctx = await b.new_context()
    init = "if(!sessionStorage.getItem('i')){sessionStorage.setItem('i','1');localStorage.clear();"
    if compte: init += "localStorage.setItem('suivi-compte',%s);" % json.dumps(json.dumps(compte))
    await ctx.add_init_script(init + "}")
    pg = await ctx.new_page(); errs = []; codes = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    async def reseau(r):
        u = r.request.url
        if u.split('?')[0].split('#')[0] == BASE: return await r.fulfill(status=200, content_type='text/html; charset=utf-8', body=PAGE)
        if 'outils-ia-pedagogie/suivi/suivi.js' in u: return await r.fulfill(status=200, content_type='application/javascript', body=SUIVI)
        if u.startswith(ENVOI):
            if r.request.method == 'POST':
                d = json.loads(r.request.post_data or '{}'); a = d.get('action')
                if a == 'code':
                    codes.append(d.get('code'))
                    rep = {'ok': True, 'label': 'Pierrick B.'} if reconnu else {'ok': False, 'err': 'code inconnu'}
                elif a == 'copie_lire': rep = {'ok': False, 'err': 'inconnu'}
                else: rep = {'ok': True}
                return await r.fulfill(status=200, content_type='application/json', body=json.dumps(rep))
            if 'retour=' in u: return await r.fulfill(status=200, content_type='application/json', body=json.dumps({'ok': True, 'label': 'Pierrick B.'}))
            if 'liste=1' in u:
                return await r.fulfill(status=200, content_type='application/json', body=json.dumps({'ok': True, 'etudiants': [{'id': 'a1', 'label': 'Alice T.', 'pris': False}]}))
            return await r.fulfill(status=200, content_type='application/json', body='{"ok":true}')
        return await r.abort()
    await pg.route(lambda u: True, reseau)
    await pg.goto(BASE); await pg.wait_for_timeout(3500)
    return ctx, pg, errs, codes

async def fenetre_qui(pg): return await pg.evaluate("()=>/Qui êtes-vous/.test(document.body.innerText)")
async def lien(pg): return json.loads(await pg.evaluate("(k)=>localStorage.getItem(k)", 'suivi-lien-' + APP) or '{}')

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        now = int(time.time() * 1000)
        print('[compte présent, code reconnu : identifié sans fenêtre]')
        ctx, pg, errs, codes = await ouvrir(b, {'c': 'KM4P7XQ2', 't': now}, True)
        L = await lien(pg)
        ok(not await fenetre_qui(pg), 'aucune fenêtre « Qui êtes-vous ? »')
        ok(L.get('c') == 'KM4P7XQ2' and L.get('label') == 'Pierrick B.', 'code et nom gardés pour ce cours')
        ok(codes == ['KM4P7XQ2'], 'un seul essai envoyé à l\'Atelier')
        ok(await pg.evaluate("()=>{var a=document.getElementById('suivi-cours');return !!a&&a.getAttribute('href')==='/compte'&&a.textContent==='Mes cours'}"), '4.6.1 : lien « Mes cours » vers /compte')
        ok(not errs, 'aucune erreur de page : ' + str(errs))
        await ctx.close()

        print('[compte présent, code non reconnu : fenêtre habituelle, un seul essai]')
        ctx, pg, errs, codes = await ouvrir(b, {'c': 'KM4P7XQ2', 't': now}, False)
        ok(await fenetre_qui(pg), 'la fenêtre « Qui êtes-vous ? » s\'ouvre')
        await pg.reload(); await pg.wait_for_timeout(3000)
        ok(codes == ['KM4P7XQ2'], 'pas de second essai au rechargement')
        ok(not errs, 'aucune erreur de page : ' + str(errs))
        await ctx.close()

        print('[aucun compte dans le navigateur : comportement inchangé]')
        ctx, pg, errs, codes = await ouvrir(b, None, True)
        ok(await fenetre_qui(pg), 'la fenêtre s\'ouvre comme avant')
        ok(codes == [], 'aucun essai de code')
        ok(await pg.evaluate("()=>!document.getElementById('suivi-cours')"), '4.6.1 : pas de lien « Mes cours » sans compte')
        await ctx.close()

        print('[compte périmé (plus de 30 jours) ou code mal formé : ignoré]')
        for c in ({'c': 'KM4P7XQ2', 't': now - 31 * 86400000}, {'c': 'a b', 't': now}):
            ctx, pg, errs, codes = await ouvrir(b, c, True)
            ok(await fenetre_qui(pg) and codes == [], 'ignoré : %s' % json.dumps(c))
            await ctx.close()
        await b.close()
    print('\nÉCHECS : %d' % len(fails) if fails else '\nTout est vert.')
    raise SystemExit(1 if fails else 0)
asyncio.run(main())
