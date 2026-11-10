# suivi.js 4.5 : reprise de la copie sur appareil vide, rev de l'Atelier, écran du code (Copier, Télécharger).
# Lancer depuis la racine du dépôt : python3 -I suivi/tests/suivi_45_test.py  (Playwright installé)
# Le serveur de l'Atelier est simulé par la page (aucun réseau) ; suivi.js est lu depuis suivi/suivi.js.
import asyncio, json, os, sys, tempfile
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
SUIVI = open(os.path.join(HERE, '..', 'suivi.js'), encoding='utf-8').read()
APP, CLE = 'demo-2026', 'demo'
ENVOI = 'https://envoi.test/exec'
PAGE_URL = 'https://cours.test/index.html'
GROUPE = json.dumps({'membres': ['Alice T.'], 'marque': 'lsf', 'date': '2026-11-09T10:00:00Z'})
COPIE_D = {CLE + '-s1-atelier-v1': json.dumps({'x': 1}), CLE + '-groupe-v1': GROUPE}
fails = []
def ok(c, msg):
    print(('  ok   ' if c else '  ÉCHEC ') + msg)
    if not c: fails.append(msg)

def page_html(cours_extra=''):
    return ('<!doctype html><html><head><meta charset="utf-8"><title>Démo</title></head><body>'
            '<script>window.COURS={app_id:"%s",cle:"%s",envoi_url:"%s",etiquette:"Démo cours"%s};</script>'
            '<script src="https://pierrickbriand.github.io/outils-ia-pedagogie/suivi/suivi.js"></script>'
            '</body></html>') % (APP, CLE, ENVOI, cours_extra)

def init_script(lien=None, local=None, kit_reprise=True, copie_rev=7):
    s = "if(!sessionStorage.getItem('kit-init')){sessionStorage.setItem('kit-init','1');localStorage.clear();"
    if lien is not None: s += "localStorage.setItem('suivi-lien-%s',%s);" % (APP, json.dumps(json.dumps(lien)))
    if local: s += "localStorage.setItem('%s-s1-atelier-v1',%s);" % (CLE, json.dumps(json.dumps(local)))
    s += "}"
    if kit_reprise: s += "window.KIT_REPRISE=true;"
    return s

async def run_page(b, lien=None, local=None, kit_reprise=True, copie=True, rev_copie=7, rev_envoi=8, code=None, extra_init=''):
    ctx = await b.new_context(accept_downloads=True, viewport={'width': 1280, 'height': 800})
    await ctx.add_init_script(init_script(lien, local, kit_reprise) + extra_init)
    pg = await ctx.new_page()
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    appels = []
    async def reseau(r):
        u = r.request.url
        if u == PAGE_URL: return await r.fulfill(status=200, content_type='text/html; charset=utf-8', body=page_html())
        if 'pierrickbriand.github.io/outils-ia-pedagogie/suivi/suivi.js' in u:
            return await r.fulfill(status=200, content_type='application/javascript', body=SUIVI)
        if u.startswith(ENVOI):
            if r.request.method == 'POST':
                corps = json.loads(r.request.post_data or '{}')
                action = corps.get('action', 'envoi' if 'd' not in corps else 'copie')
                appels.append(action)
                if action == 'copie_lire':
                    rep = {'ok': True, 'date': '2026-11-09T09:00:00.000Z', 'rev': rev_copie, 'd': COPIE_D} if copie else {'ok': True, 'vide': True}
                elif action == 'copie':
                    rep = {'ok': True, 'rev': rev_envoi, 'le': '2026-11-10T09:00:00.000Z'}
                elif action == 'identifier':
                    rep = {'ok': True, 'code': code or 'WXYZ2345', 'label': 'Alice T.'}
                else:
                    rep = {'ok': True}
                return await r.fulfill(status=200, content_type='application/json', body=json.dumps(rep))
            if 'liste=1' in u:
                return await r.fulfill(status=200, content_type='application/json', body=json.dumps({'ok': True, 'etudiants': [{'id': 'a1', 'label': 'Alice T.', 'pris': False}]}))
            return await r.fulfill(status=200, content_type='application/json', body=json.dumps({'ok': False}))
        return await r.abort()
    await pg.route(lambda u: True, reseau)
    await pg.goto(PAGE_URL)
    return ctx, pg, erreurs, appels

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()

        print('[appareil vide, identifié : copie reprise sans fenêtre ni rechargement]')
        ctx, pg, err, appels = await run_page(b, lien={'c': 'ABCD2345', 'label': 'Alice T.'}, kit_reprise=True)
        await pg.wait_for_timeout(3500)
        g = await pg.evaluate("(k)=>localStorage.getItem(k)", CLE + '-groupe-v1')
        ok(g == GROUPE, 'groupe de la copie écrit dans le navigateur')
        ok(await pg.evaluate("()=>performance.getEntriesByType('navigation')[0].type")=='navigate', 'pas de rechargement avec le moteur 105 (KIT_REPRISE)')
        ok(not await pg.evaluate("()=>!!document.querySelector('.suivi-fen')"), 'aucune fenêtre « Retrouver votre travail ? »')
        e = await pg.evaluate("()=>SUIVI.etat().copie")
        ok(e['verifiee'] is True and e['rev'] == 7, f'etat().copie : verifiee et rev 7 {e}')
        c = await pg.evaluate("()=>SUIVI.copie()")
        ok(c and c['rev'] == 7 and c['d'] and c['date'].startswith('2026-11-09'), 'SUIVI.copie() donne la copie reçue')
        ok(not err, f'aucune erreur JavaScript {err[:2]}')
        await ctx.close()

        print('[appareil vide, moteur sans KIT_REPRISE : rechargement comme avant]')
        ctx, pg, err, appels = await run_page(b, lien={'c': 'ABCD2345', 'label': 'Alice T.'}, kit_reprise=False)
        await pg.wait_for_timeout(4000)
        ok(await pg.evaluate("()=>performance.getEntriesByType('navigation')[0].type")=='reload', 'la page est rechargée une fois')
        g = await pg.evaluate("(k)=>localStorage.getItem(k)", CLE + '-groupe-v1')
        ok(g == GROUPE, 'groupe restauré après rechargement')
        await ctx.close()

        print('[appareil avec du travail : fenêtre de décision, rien d’écrasé]')
        ctx, pg, err, appels = await run_page(b, lien={'c': 'ABCD2345', 'label': 'Alice T.'}, local={'a': 'b'})
        await pg.wait_for_timeout(3500)
        ok(await pg.evaluate("()=>!!document.querySelector('.suivi-fen') && /Retrouver votre travail/.test(document.querySelector('.suivi-fen').textContent)"), 'fenêtre « Retrouver votre travail ? »')
        ok(await pg.evaluate("(k)=>localStorage.getItem(k)", CLE + '-groupe-v1') is None, 'le groupe n’est pas écrit sans accord')
        ok(not err, f'aucune erreur JavaScript {err[:2]}')
        await ctx.close()

        print('[copie : le rev de l’Atelier est gardé et rendu au moteur]')
        ctx, pg, err, appels = await run_page(b, lien={'c': 'ABCD2345', 'label': 'Alice T.'}, local={'x': 'dejà là'}, copie=False)
        await pg.wait_for_timeout(1500)
        await pg.evaluate("(k)=>localStorage.setItem(k, JSON.stringify({'x':'modifié'}))", CLE + '-s1-atelier-v1')
        await pg.wait_for_timeout(11500)
        ok('copie' in appels, 'copie envoyée à l’Atelier')
        rv = await pg.evaluate("()=>SUIVI.etat().copie.rev")
        ok(rv == 8, f'rev 8 reçu de l’Atelier et rendu au moteur {rv}')
        ok(not err, f'aucune erreur JavaScript {err[:2]}')
        await ctx.close()

        print('[écran du code : Copier et Télécharger]')
        ctx, pg, err, appels = await run_page(b)
        await pg.wait_for_selector('#s-nom', timeout=8000)
        await pg.select_option('#s-nom', 'a1')
        await pg.click('[data-a=moi]')
        await pg.wait_for_selector('.code', timeout=6000)
        ok(await pg.evaluate("()=>document.querySelector('.code').textContent")=='WXYZ2345', 'le code s’affiche')
        boutons = await pg.evaluate("()=>[...document.querySelectorAll('.suivi-fen button')].map(x=>x.textContent.trim())")
        ok('Copier' in boutons and 'Télécharger' in boutons, f'boutons « Copier » et « Télécharger » {boutons}')
        async with pg.expect_download() as d:
            await pg.click('[data-a=telecharger]')
        dl = await d.value
        ok(dl.suggested_filename == 'mon-code-%s.txt' % APP, f'fichier proposé {dl.suggested_filename}')
        contenu = open(await dl.path(), encoding='utf-8').read()
        ok('WXYZ2345' in contenu and 'Démo cours' in contenu, 'le fichier contient le code et le nom du cours')
        ok(not err, f'aucune erreur JavaScript {err[:2]}')
        await ctx.close()

        await b.close()
    print('suivi 4.5 : %d échec(s)' % len(fails))
    sys.exit(1 if fails else 0)

asyncio.run(main())
