# suivi.js 4.5.2 : l'Atelier répond « lien inconnu » à retour= : l'appareil oublie son identité (jamais le travail) et rouvre « Qui êtes-vous ? ».
# « patienter », panne réseau et réponse vide ne déconnectent personne.
# Lancer depuis la racine du dépôt : python3 -I suivi/tests/suivi_452_test.py  (Playwright installé). L'Atelier est simulé (aucun réseau).
import asyncio, json, os
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
SUIVI = open(os.path.join(HERE, '..', 'suivi.js'), encoding='utf-8').read()
APP, CLE, ENVOI, BASE = 'demo-2026', 'demo', 'https://envoi.test/exec', 'https://cours.test/index.html'
TRAVAIL = 'demo-s1-atelier-v1'
PAGE = ('<!doctype html><html><head><meta charset="utf-8"><title>Démo</title></head><body>'
        '<script>window.COURS={app_id:"%s",cle:"%s",envoi_url:"%s",etiquette:"Démo cours"};</script>'
        '<script src="https://pierrickbriand.github.io/outils-ia-pedagogie/suivi/suivi.js"></script></body></html>') % (APP, CLE, ENVOI)
fails = []
def ok(c, m):
    print(('  ok   ' if c else '  ÉCHEC ') + m)
    if not c: fails.append(m)

async def ouvrir(b, retour):
    ctx = await b.new_context()
    await ctx.add_init_script("if(!sessionStorage.getItem('i')){sessionStorage.setItem('i','1');localStorage.clear();localStorage.setItem('suivi-lien-%s',%s);localStorage.setItem('%s','{\"champ\":\"travail du matin\"}');}"
                              % (APP, json.dumps(json.dumps({'c': 'ABCD2345', 'label': 'Alice T.', 'copieOk': 111})), TRAVAIL))
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    async def reseau(r):
        u = r.request.url
        if u.split('?')[0].split('#')[0] == BASE: return await r.fulfill(status=200, content_type='text/html; charset=utf-8', body=PAGE)
        if 'outils-ia-pedagogie/suivi/suivi.js' in u: return await r.fulfill(status=200, content_type='application/javascript', body=SUIVI)
        if u.startswith(ENVOI):
            if r.request.method == 'POST':
                a = json.loads(r.request.post_data or '{}').get('action')
                rep = {'ok': False, 'err': 'inconnu'} if a == 'copie_lire' else {'ok': True}
                return await r.fulfill(status=200, content_type='application/json', body=json.dumps(rep))
            if 'retour=' in u:
                if retour == 'reseau': return await r.abort()
                return await r.fulfill(status=200, content_type='application/json', body=json.dumps(retour))
            if 'liste=1' in u:
                return await r.fulfill(status=200, content_type='application/json', body=json.dumps({'ok': True, 'etudiants': [{'id': 'a1', 'label': 'Alice T.', 'pris': False}]}))
            return await r.fulfill(status=200, content_type='application/json', body='{"ok":true}')
        return await r.abort()
    await pg.route(lambda u: True, reseau)
    await pg.goto(BASE); await pg.wait_for_timeout(3000)
    return ctx, pg, errs

async def lien(pg): return json.loads(await pg.evaluate("(k)=>localStorage.getItem(k)", 'suivi-lien-' + APP) or '{}')

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('[lien inconnu : déconnexion, travail gardé, choix du nom]')
        ctx, pg, errs = await ouvrir(b, {'ok': False, 'err': 'lien inconnu'})
        L = await lien(pg)
        ok('c' not in L and 'label' not in L, f'identité oubliée {L}')
        ok(await pg.evaluate("(k)=>localStorage.getItem(k)", TRAVAIL) == '{"champ":"travail du matin"}', 'travail du cours gardé')
        ok(await pg.locator('.suivi-fen h2', has_text='Choisissez de nouveau votre nom').count() == 1, 'fenêtre « Choisissez de nouveau votre nom »')
        et = await pg.evaluate("()=>window.SUIVI.etat()")
        ok(et['identifie'] is False and et['atelier'] is True, f"non identifié, Atelier joignable ({et['identifie']}, {et['atelier']})")
        await pg.locator('.suivi-fen button', has_text='Choisir mon nom').click(); await pg.wait_for_timeout(1200)
        ok(await pg.locator('.suivi-fen h2', has_text='Qui êtes-vous').count() == 1, '« Choisir mon nom » rouvre « Qui êtes-vous ? »')
        ok(not errs, f'aucune erreur JavaScript {errs[:2]}'); await ctx.close()
        for nom, rep in (('patienter', {'ok': False, 'err': 'patienter'}), ('panne réseau', 'reseau'), ('réponse vide', {})):
            print('[' + nom + ' : personne n’est déconnecté]')
            ctx, pg, errs = await ouvrir(b, rep)
            ok((await lien(pg)).get('c') == 'ABCD2345', 'code gardé')
            ok(await pg.locator('.suivi-fen h2', has_text='Choisissez de nouveau').count() == 0, 'pas de fenêtre de déconnexion')
            ok(not errs, f'aucune erreur JavaScript {errs[:2]}'); await ctx.close()
        print('[retour normal]')
        ctx, pg, errs = await ouvrir(b, {'ok': True, 'prenom': 'Alice', 'notes': []})
        ok((await lien(pg)).get('c') == 'ABCD2345' and await pg.locator('#suivi-notes').count() == 1, 'code gardé, « Mes notes » présent')
        ok(not errs, f'aucune erreur JavaScript {errs[:2]}'); await ctx.close()
        await b.close()
    print('suivi 4.5.2 : ' + ('tout est vert' if not fails else '%d échec(s)' % len(fails)))
    raise SystemExit(1 if fails else 0)
asyncio.run(main())
