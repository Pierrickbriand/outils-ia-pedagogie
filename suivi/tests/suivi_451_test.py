# suivi.js 4.5.1 : le code d'un lien ?c=… est retiré de la barre d'adresse après la réponse de l'Atelier.
# Lancer depuis la racine du dépôt : python3 -I suivi/tests/suivi_451_test.py  (Playwright installé)
# Le serveur de l'Atelier est simulé (aucun réseau) ; suivi.js est lu depuis suivi/suivi.js.
import asyncio, json, os
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

async def ouvrir(b, chemin, code_valide=True, lien=None):
    ctx = await b.new_context()
    s = "if(!sessionStorage.getItem('i')){sessionStorage.setItem('i','1');localStorage.clear();"
    if lien: s += "localStorage.setItem('suivi-lien-%s',%s);" % (APP, json.dumps(json.dumps(lien)))
    await ctx.add_init_script(s + "}")
    pg = await ctx.new_page(); codes = []
    async def reseau(r):
        u = r.request.url
        if u.split('?')[0].split('#')[0] == BASE: return await r.fulfill(status=200, content_type='text/html; charset=utf-8', body=PAGE)
        if 'outils-ia-pedagogie/suivi/suivi.js' in u: return await r.fulfill(status=200, content_type='application/javascript', body=SUIVI)
        if u.startswith(ENVOI):
            if r.request.method == 'POST':
                c = json.loads(r.request.post_data or '{}')
                if c.get('action') == 'code':
                    codes.append(c.get('code'))
                    rep = {'ok': True, 'label': 'Alice T.'} if code_valide else {'ok': False}
                else: rep = {'ok': True}
                return await r.fulfill(status=200, content_type='application/json', body=json.dumps(rep))
            return await r.fulfill(status=200, content_type='application/json', body=json.dumps({'ok': True, 'etudiants': []}))
        return await r.abort()
    await pg.route(lambda u: True, reseau)
    await pg.goto(BASE + chemin); await pg.wait_for_timeout(2500)
    return ctx, pg, codes

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('[lien ?c= valide : identifié, code retiré de l’adresse, autres paramètres gardés]')
        ctx, pg, codes = await ouvrir(b, '?p=B1&c=ABCD2345#s3')
        ok(codes == ['ABCD2345'], f'code vérifié une fois auprès de l’Atelier {codes}')
        ok(pg.url == BASE + '?p=B1#s3', f'adresse sans le code : {pg.url}')
        L = json.loads(await pg.evaluate("(k)=>localStorage.getItem(k)", 'suivi-lien-' + APP) or '{}')
        ok(L.get('c') == 'ABCD2345' and 'cNeuf' not in L, f'étudiant identifié {L}')
        await pg.go_back(); await pg.wait_for_timeout(300)
        ok('ABCD2345' not in pg.url, f'retour arrière : le code ne revient pas dans l’adresse ({pg.url})')
        await ctx.close()
        print('[lien ?c= seul : adresse nue]')
        ctx, pg, codes = await ouvrir(b, '?c=ABCD2345')
        ok(pg.url == BASE, f'adresse sans « ? » résiduel : {pg.url}'); await ctx.close()
        print('[code non reconnu : retiré quand même, pas d’identification]')
        ctx, pg, codes = await ouvrir(b, '?c=ZZZZ9999', code_valide=False)
        ok('ZZZZ9999' not in pg.url, f'adresse sans le code refusé : {pg.url}')
        L = json.loads(await pg.evaluate("(k)=>localStorage.getItem(k)", 'suivi-lien-' + APP) or '{}')
        ok(not L.get('c'), 'aucune identification avec un code refusé'); await ctx.close()
        print('[code déjà enregistré sur cet appareil : pas de nouvel appel, adresse nettoyée]')
        ctx, pg, codes = await ouvrir(b, '?c=ABCD2345', lien={'c': 'ABCD2345', 'label': 'Alice T.'})
        ok(codes == [] and pg.url == BASE, f'aucun appel {codes}, adresse {pg.url}'); await ctx.close()
        await b.close()
    print('suivi 4.5.1 : ' + ('tout est vert' if not fails else '%d échec(s)' % len(fails)))
    raise SystemExit(1 if fails else 0)
asyncio.run(main())
