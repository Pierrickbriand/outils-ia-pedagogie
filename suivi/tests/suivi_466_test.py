# suivi.js 4.6.6 : un étudiant connecté par son compte ne voit plus la liste des noms à sa place.
# Constat du 25 novembre 2026 (Vatel) : l'Atelier, occupé par les inscriptions, répondait « occupé » ; l'unique essai échouait et « Qui êtes-vous ? » s'ouvrait.
# Lancer depuis la racine du dépôt : python3 -I suivi/tests/suivi_466_test.py  (Playwright installé). L'Atelier est simulé (aucun réseau).
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

# reponses : liste des réponses de l'Atelier à l'action « code », dans l'ordre ; la dernière sert pour tous les appels suivants. « reseau » coupe la connexion.
async def ouvrir(b, compte, reponses, cours_compte=True, lien=None, attente=3500, liste=None):
    ctx = await b.new_context()
    init = "if(!sessionStorage.getItem('i')){sessionStorage.setItem('i','1');localStorage.clear();"
    if compte: init += "localStorage.setItem('suivi-compte',%s);" % json.dumps(json.dumps(compte))
    if lien: init += "localStorage.setItem('suivi-lien-%s',%s);" % (APP, json.dumps(json.dumps(lien)))
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
                    rep = reponses[min(len(codes), len(reponses) - 1)]; codes.append(d.get('code'))
                    if rep == 'reseau': return await r.abort()
                elif a == 'copie_lire': rep = {'ok': False, 'err': 'inconnu'}
                else: rep = {'ok': True}
                return await r.fulfill(status=200, content_type='application/json', body=json.dumps(rep))
            if 'retour=' in u: return await r.fulfill(status=200, content_type='application/json', body=json.dumps({'ok': True, 'label': 'Léa M.'}))
            if 'liste=1' in u:
                rep = {'ok': True, 'etudiants': liste if liste is not None else [{'id': 'a1', 'label': 'Léa M.', 'pris': True}]}
                if cours_compte: rep['compte'] = True
                return await r.fulfill(status=200, content_type='application/json', body=json.dumps(rep))
            return await r.fulfill(status=200, content_type='application/json', body='{"ok":true}')
        return await r.abort()
    await pg.route(lambda u: True, reseau)
    await pg.goto(BASE); await pg.wait_for_timeout(attente)
    return ctx, pg, errs, codes

async def texte(pg): return await pg.evaluate("()=>{var f=document.querySelector('.suivi-fen');return f?f.innerText:''}")
async def lien(pg): return json.loads(await pg.evaluate("(k)=>localStorage.getItem(k)", 'suivi-lien-' + APP) or '{}')
OCCUPE, BON, FAUX = {'ok': False, 'err': 'occupé', 'retry': True}, {'ok': True, 'label': 'Léa M.'}, {'ok': False, 'err': 'code inconnu'}

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); now = int(time.time() * 1000); C = {'c': 'KM4P7XQ2', 't': now}

        print('[25 novembre rejoué : l’Atelier répond deux fois « occupé », puis reconnaît l’étudiant]')
        ctx, pg, errs, codes = await ouvrir(b, C, [OCCUPE, OCCUPE, BON], attente=2500)
        ok(await texte(pg) == '', 'pendant l’attente : aucune fenêtre (' + str(len(codes)) + ' essai)')
        await pg.wait_for_timeout(7000); L = await lien(pg)
        ok(len(codes) == 3, 'trois essais en tout : ' + str(len(codes)))
        ok(L.get('c') == 'KM4P7XQ2' and L.get('label') == 'Léa M.', 'étudiant reconnu, nom gardé')
        ok(await texte(pg) == '', 'aucune fenêtre après la reconnaissance')
        ok(not errs, 'aucune erreur de page : ' + str(errs)); await ctx.close()

        print('[coupure de réseau puis reconnaissance]')
        ctx, pg, errs, codes = await ouvrir(b, C, ['reseau', BON], attente=5000); L = await lien(pg)
        ok(L.get('c') == 'KM4P7XQ2' and await texte(pg) == '', 'reconnu au deuxième essai, sans fenêtre'); await ctx.close()

        print('[Atelier occupé longtemps, cours à compte : jamais la liste]')
        ctx, pg, errs, codes = await ouvrir(b, C, [OCCUPE], attente=16000)
        ok(await texte(pg) == '' and len(codes) >= 4, 'toujours aucune fenêtre après %d essais' % len(codes))
        ok('autoEssai' not in await lien(pg), 'l’essai n’est pas « brûlé » : il reprendra à la prochaine ouverture'); await ctx.close()

        print('[étudiant bloqué le 25 novembre (autoEssai = 1) : reconnu à la réouverture]')
        ctx, pg, errs, codes = await ouvrir(b, C, [BON], lien={'autoEssai': 1}); L = await lien(pg)
        ok(L.get('c') == 'KM4P7XQ2' and 'autoEssai' not in L and await texte(pg) == '', 'reconnu, marque effacée'); await ctx.close()

        print('[cours à compte, code refusé : renvoi vers « Mes cours », pas la liste]')
        ctx, pg, errs, codes = await ouvrir(b, C, [FAUX]); t = await texte(pg)
        ok('pas encore dans votre compte' in t and 'Qui êtes-vous' not in t, 'fenêtre de renvoi : ' + t.split('\n')[0])
        ok(await pg.evaluate("()=>!document.querySelector('.suivi-fen select')"), 'aucune liste de noms à l’écran')
        await pg.reload(); await pg.wait_for_timeout(3000)
        ok(len(codes) == 1 and 'pas encore dans votre compte' in await texte(pg), 'au rechargement : pas de nouvel essai, même fenêtre')
        await pg.evaluate("()=>localStorage.setItem('suivi-compte',JSON.stringify({c:'KM4P7XQ2',t:Date.now()+1000}))") # cours ajouté sur « Mon compte »
        await pg.reload(); await pg.wait_for_timeout(3000)
        ok(len(codes) == 2, 'après un passage par « Mon compte » : nouvel essai')
        await pg.click('.suivi-fen [data-a="liste"]'); 
        ok('Qui êtes-vous' in await texte(pg), 'second choix : la liste reste accessible')
        ok(not errs, 'aucune erreur de page : ' + str(errs)); await ctx.close()

        print('[cours à compte, aucun compte dans le navigateur : « Ouvrez votre compte »]')
        ctx, pg, errs, codes = await ouvrir(b, None, [BON], liste=[]); t = await texte(pg)
        ok('Ouvrez votre compte' in t and codes == [], 'fenêtre de renvoi, liste vide comprise : ' + t.split('\n')[0])
        ok(await pg.evaluate("()=>!document.querySelector('.suivi-fen [data-a=liste]')"), 'pas de second choix quand la liste est vide')
        async with pg.expect_request(lambda q: '/compte' in q.url): await pg.click('.suivi-fen [data-a="compte"]')
        ok(True, 'le bouton ouvre https://pierrickbriand.fr/compte (page hors du site)'); await ctx.close()

        print('[cours sans compte (liste classique) : comportement d’avant]')
        ctx, pg, errs, codes = await ouvrir(b, None, [BON], cours_compte=False)
        ok('Qui êtes-vous' in await texte(pg) and codes == [], 'sans compte : la liste s’ouvre'); await ctx.close()
        ctx, pg, errs, codes = await ouvrir(b, C, [FAUX], cours_compte=False)
        ok('Qui êtes-vous' in await texte(pg) and len(codes) == 1, 'compte d’un autre cours, code refusé : la liste s’ouvre'); await ctx.close()
        ctx, pg, errs, codes = await ouvrir(b, C, [OCCUPE], cours_compte=False, attente=12000)
        ok('Qui êtes-vous' in await texte(pg) and len(codes) == 3, 'Atelier occupé : trois essais, puis la liste (%d)' % len(codes)); await ctx.close()

        print('[étudiant déjà identifié : rien ne change]')
        ctx, pg, errs, codes = await ouvrir(b, C, [BON], lien={'c': 'KM4P7XQ2', 'label': 'Léa M.'})
        ok(await texte(pg) == '' and codes == [], 'aucune fenêtre, aucun essai'); ok(not errs, 'aucune erreur de page : ' + str(errs)); await ctx.close()
        await b.close()
    print('\nÉCHECS : %d' % len(fails) if fails else '\nTout est vert.')
    raise SystemExit(1 if fails else 0)
asyncio.run(main())
