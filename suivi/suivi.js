/*
 * Suivi des cours – liaison entre une page de cours et l'application de suivi de Pierrick Briand (version 2).
 * À appeler en tête de page (avant le code du cours) :
 *   <script src="https://pierrickbriand.github.io/outils-ia-pedagogie/suivi/suivi.js"></script>
 * Ce que fait ce script, sans rien changer au cours lui-même :
 *  – à la première ouverture, il demande « Qui êtes-vous ? » et propose la liste de la classe (« Camille D. ») ;
 *    l'étudiant reçoit un code personnel (affiché, et envoyé par e-mail s'il donne son adresse), régénérable par e-mail ;
 *  – il ajoute ce code et la promotion à chaque envoi vers COURS.envoi_url, avec le titre et l'adresse du cours ;
 *  – il demande les dates des séances de la promotion de l'étudiant ;
 *  – il propose les noms de la classe dans les champs « NOM Prénom » du groupe ;
 *  – il affiche « Mes notes » (avec « Nouvelle note ») quand l'étudiant est identifié.
 * Les anciens liens personnels (?e=…) et ?p=… restent reconnus. Si ce script ne se charge pas, le cours fonctionne comme avant.
 */
(function () {
  'use strict';
  var q = {};
  try { new URLSearchParams(location.search).forEach(function (v, k) { q[k] = v; }); } catch (e) {}
  var C = function () { return window.COURS || {}; };
  var cle = function () { return 'suivi-lien-' + (C().app_id || C().cle || location.pathname); };
  var f0 = window.fetch;

  function lire() {
    var o = {};
    try { o = JSON.parse(localStorage.getItem(cle()) || '{}') || {}; } catch (e) { o = {}; }
    if (q.e && /^[a-z0-9]{6,20}$/i.test(q.e)) o.e = q.e;
    if (q.p) o.p = String(q.p).slice(0, 40);
    if (q.c && /^[a-z0-9]{6,12}$/i.test(q.c)) o.cNeuf = String(q.c).toUpperCase();
    return o;
  }
  function ecrire(o) { try { localStorage.setItem(cle(), JSON.stringify(o)); } catch (e) {} }
  function E() { return C().envoi_url || ''; }
  function poster(corps) {
    return f0.call(window, E(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(corps), redirect: 'follow' })
      .then(function (r) { return r.json(); });
  }
  function lireGet(params) { return f0.call(window, E() + (E().indexOf('?') < 0 ? '?' : '&') + params).then(function (r) { return r.json(); }); }

  // Complète les envois et la lecture des séances, seulement vers l'adresse d'envoi du cours.
  if (typeof f0 === 'function') {
    window.fetch = function (url, opt) {
      try {
        var u = typeof url === 'string' ? url : '';
        if (E() && u && u.indexOf(E()) === 0) {
          var L = lire();
          if (opt && String(opt.method).toUpperCase() === 'POST' && typeof opt.body === 'string') {
            var b = JSON.parse(opt.body);
            if (!b.action) {
              if (L.c) b.code = L.c;
              if (L.e) b.etu = L.e;
              if (L.p) b.promo = L.p;
              b.titre = b.titre || C().etiquette || C().titre || document.title;
              b.ecole = b.ecole || C().ecole || '';
              b.page = location.origin + location.pathname;
              var o2 = {}; for (var k in opt) o2[k] = opt[k];
              o2.body = JSON.stringify(b); opt = o2;
            }
          } else if (/[?&]seances=1/.test(u) && !/[?&]app=/.test(u)) {
            url = u + '&app=' + encodeURIComponent(C().app_id || '') + (L.p ? '&p=' + encodeURIComponent(L.p) : '');
          }
        }
      } catch (e) { /* en cas de doute, l'envoi part tel quel */ }
      return f0.call(window, url, opt);
    };
  }

  /* ---------- Présentation ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function nombre(n) { return String(Math.round((+n || 0) * 100) / 100).replace('.', ','); }
  var styleFait = false;
  function style() {
    if (styleFait) return; styleFait = true;
    var st = document.createElement('style');
    st.textContent =
      '#suivi-notes{position:fixed;right:16px;top:12px;z-index:9000;font:600 13px/1.2 Inter,system-ui,sans-serif;background:var(--accent,#1F3D66);color:#fff;border:1px solid rgba(255,255,255,.5);border-radius:20px;padding:8px 14px;box-shadow:0 4px 16px rgba(0,0,0,.18);cursor:pointer}' +
      '#suivi-notes b{display:inline-block;margin-left:6px;background:#fff;color:var(--accent,#1F3D66);border-radius:10px;padding:1px 7px;font-size:12px}' +
      '#suivi-notes.neuf{background:#A8425A}' +
      '.suivi-voile{position:fixed;inset:0;background:rgba(20,30,50,.55);z-index:9500;display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;overflow:auto}' +
      '.suivi-fen{background:#fff;color:#1B2740;border-radius:14px;max-width:520px;width:100%;padding:24px;font:15px/1.5 Inter,system-ui,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.3)}' +
      '.suivi-fen h2{margin:0 0 8px;font-size:21px}.suivi-fen p{margin:8px 0}.suivi-fen .p{color:#56627A;font-size:13px}' +
      '.suivi-fen label{display:block;font-weight:600;font-size:13px;margin:14px 0 4px}' +
      '.suivi-fen select,.suivi-fen input{font:inherit;width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid #C9CFDC;border-radius:8px;background:#fff;color:#1B2740}' +
      '.suivi-fen .b{font:inherit;font-weight:600;margin:16px 8px 0 0;border:1px solid #1F3D66;background:#1F3D66;color:#fff;border-radius:8px;padding:9px 16px;cursor:pointer}' +
      '.suivi-fen .b.s{background:#fff;color:#1F3D66}.suivi-fen .l{background:none;border:0;padding:0;margin:12px 14px 0 0;font:inherit;font-size:13px;color:#1D6F69;text-decoration:underline;cursor:pointer}' +
      '.suivi-fen .code{font:700 30px/1 ui-monospace,Menlo,monospace;letter-spacing:.18em;background:#F3F3F6;border-radius:10px;padding:14px;text-align:center;margin:12px 0}' +
      '.suivi-fen .m{min-height:1.2em;color:#A8425A;font-size:13px;margin-top:10px}.suivi-fen .n{border-top:1px solid #D8DCE6;padding:12px 0}.suivi-fen .v{font-size:18px;font-weight:700}' +
      '@media print{#suivi-notes,.suivi-voile{display:none!important}}';
    document.head.appendChild(st);
  }
  function fenetre(html) {
    style();
    var v = document.querySelector('.suivi-voile');
    if (!v) { v = document.createElement('div'); v.className = 'suivi-voile'; document.body.appendChild(v); }
    v.innerHTML = '<div class="suivi-fen" role="dialog" aria-modal="true">' + html + '</div>';
    return v;
  }
  function fermer() { var v = document.querySelector('.suivi-voile'); if (v) v.remove(); }
  function msg(t) { var m = document.querySelector('.suivi-fen .m'); if (m) m.textContent = t; }

  /* ---------- « Qui êtes-vous ? » ---------- */
  var LISTE = null;
  function accueil() {
    var opts = LISTE.map(function (x) { return '<option value="' + esc(x.id) + '">' + esc(x.label) + (x.pris ? ' (déjà choisi)' : '') + '</option>'; }).join('');
    var v = fenetre('<h2>Qui êtes-vous ?</h2><p class="p">Choisissez votre nom une seule fois. Il identifie votre travail auprès de votre enseignant.</p>' +
      '<label for="s-nom">Votre nom</label><select id="s-nom"><option value="">choisir…</option>' + opts + '</select>' +
      '<label for="s-mail">Votre e-mail (conseillé)</label><input id="s-mail" type="email" autocomplete="email" placeholder="prenom.nom@exemple.fr">' +
      '<p class="p">Il sert uniquement à vous envoyer votre code personnel et vos notes. Il est effacé en fin d’année. Sans e-mail, vous ne pourrez pas récupérer un code perdu.</p>' +
      '<button class="b" type="button" data-a="moi">C’est moi</button>' +
      '<br><button class="l" type="button" data-a="code">J’ai déjà un code</button><button class="l" type="button" data-a="absent">Mon nom n’est pas dans la liste</button><div class="m" aria-live="polite"></div>');
    v.onclick = function (e) {
      var a = e.target.getAttribute && e.target.getAttribute('data-a'); if (!a) return;
      if (a === 'absent') { var L = lire(); L.absent = Date.now(); ecrire(L); fermer(); return; }
      if (a === 'code') return saisirCode('');
      var id = v.querySelector('#s-nom').value, mail = v.querySelector('#s-mail').value.trim();
      if (!id) return msg('Choisissez votre nom dans la liste.');
      var x = LISTE.filter(function (y) { return y.id === id; })[0];
      if (x && x.pris) return saisirCode(id);
      e.target.disabled = true; msg('Un instant…');
      poster({ action: 'identifier', app: C().app_id, id: id, email: mail }).then(function (r) {
        e.target.disabled = false;
        if (r && r.ok) return montrerCode(r, !!mail);
        if (r && r.err === 'pris') return saisirCode(id);
        msg(r && r.err === 'e-mail invalide' ? 'Cette adresse e-mail ne semble pas valide.' : 'Impossible pour l’instant. Vérifiez votre connexion et réessayez.');
      }).catch(function () { e.target.disabled = false; msg('Impossible pour l’instant. Vérifiez votre connexion et réessayez.'); });
    };
  }
  function montrerCode(r, avecMail) {
    var L = lire(); L.c = r.code; L.label = r.label; if (r.promo) L.p = r.promo; delete L.absent; ecrire(L);
    var v = fenetre('<h2>Bienvenue, ' + esc(String(r.label).split(' ')[0]) + '</h2><p>Votre code personnel :</p><div class="code">' + esc(r.code) + '</div>' +
      '<p class="p">' + (avecMail ? 'Il vient de vous être envoyé par e-mail. ' : 'Notez-le : il vous sera demandé sur un autre appareil. ') + 'Ce navigateur s’en souviendra. Il protège vos notes : ne le partagez pas.</p>' +
      '<button class="b" type="button">Continuer</button>');
    v.querySelector('.b').onclick = function () { location.reload(); };
  }
  function saisirCode(id) {
    var v = fenetre('<h2>Votre code personnel</h2>' + (id ? '<p class="p">Ce nom a déjà été choisi. Si c’est bien le vôtre, saisissez votre code.</p>' : '<p class="p">Saisissez le code reçu à votre première connexion.</p>') +
      '<label for="s-code">Code</label><input id="s-code" autocomplete="off" maxlength="12" style="text-transform:uppercase;letter-spacing:.15em">' +
      '<button class="b" type="button" data-a="ok">Valider</button><button class="b s" type="button" data-a="retour">Retour</button>' +
      (id ? '<br><button class="l" type="button" data-a="oubli">Code oublié ?</button>' : '') + '<div class="m" aria-live="polite"></div>');
    v.onclick = function (e) {
      var a = e.target.getAttribute && e.target.getAttribute('data-a'); if (!a) return;
      if (a === 'retour') return accueil();
      if (a === 'oubli') {
        msg('Un instant…');
        return poster({ action: 'oubli', app: C().app_id, id: id }).then(function (r) {
          if (r && r.ok) msg('Un nouveau code vient d’être envoyé à ' + r.masque + '. L’ancien ne fonctionne plus.');
          else if (r && r.err === 'sans e-mail') msg('Aucun e-mail n’est enregistré pour ce nom. Demandez à votre enseignant de libérer votre nom, puis choisissez-le de nouveau.');
          else if (r && r.err === 'patienter') msg('Un code vient déjà d’être envoyé. Vérifiez vos e-mails, y compris les indésirables, ou réessayez dans dix minutes.');
          else msg('Impossible pour l’instant. Réessayez plus tard.');
        }).catch(function () { msg('Impossible pour l’instant. Vérifiez votre connexion.'); });
      }
      var code = v.querySelector('#s-code').value.trim().toUpperCase();
      if (code.length < 6) return msg('Le code compte six caractères.');
      verifierCode(code, true);
    };
  }
  function verifierCode(code, interactif) {
    return poster({ action: 'code', app: C().app_id, code: code }).then(function (r) {
      if (r && r.ok) { var L = lire(); L.c = code; L.label = r.label; if (r.promo) L.p = r.promo; delete L.cNeuf; delete L.absent; ecrire(L); location.reload(); return; }
      if (interactif) msg('Ce code n’est pas reconnu pour ce cours.');
    }).catch(function () { if (interactif) msg('Impossible pour l’instant. Vérifiez votre connexion.'); });
  }

  /* ---------- Noms proposés dans les champs du groupe ---------- */
  function suggestions() {
    if (!LISTE || !LISTE.length || !document.getElementById('bt-m0')) return;
    if (!document.getElementById('suivi-classe')) {
      var dl = document.createElement('datalist'); dl.id = 'suivi-classe';
      dl.innerHTML = LISTE.map(function (x) { return '<option value="' + esc(x.label) + '">'; }).join('');
      document.body.appendChild(dl);
    }
    for (var i = 0; i < 8; i++) { var f = document.getElementById('bt-m' + i); if (f) f.setAttribute('list', 'suivi-classe'); }
    var L = lire(), m0 = document.getElementById('bt-m0');
    if (L.label && m0 && !m0.value) m0.value = L.label;
  }

  /* ---------- « Mes notes » ---------- */
  function bouton(r, L) {
    style();
    var app = C().app_id || '';
    var notes = (r.notes || []).filter(function (n) { return !app || n.cours === app; });
    var dernier = notes.map(function (n) { return String(n.date || ''); }).sort().pop() || '';
    var neuf = dernier && dernier > String(L.vu || '');
    var b = document.createElement('button');
    b.id = 'suivi-notes'; b.type = 'button'; if (neuf) b.className = 'neuf';
    b.innerHTML = (neuf ? 'Nouvelle note' : 'Mes notes') + (notes.length ? '<b>' + notes.length + '</b>' : '');
    b.title = L.label ? 'Connecté en tant que ' + L.label : '';
    b.onclick = function () {
      var M = lire(); M.vu = dernier; ecrire(M); b.className = ''; b.innerHTML = 'Mes notes' + (notes.length ? '<b>' + notes.length + '</b>' : '');
      var v = fenetre('<h2>' + (r.prenom ? esc(r.prenom) + ', vos notes' : 'Vos notes') + '</h2>' +
        (notes.length ? notes.map(function (n) {
          return '<div class="n"><div>' + esc(n.livrable) + '</div><div class="v">' + nombre(n.note) + ' / ' + nombre(n.sur) + '</div>' +
            (n.commentaire ? '<div style="white-space:pre-wrap;margin-top:4px">' + esc(String(n.commentaire).replace(/^'/, '')) + '</div>' : '') + '</div>';
        }).join('') : '<p>Aucune note publiée pour l’instant. Elles apparaîtront ici dès que votre enseignant les aura publiées.</p>') +
        '<p class="p">Connecté en tant que ' + esc(L.label || r.prenom || '') + '.</p><button class="b s" type="button">Fermer</button>');
      v.querySelector('.b').onclick = fermer;
      v.onclick = function (e) { if (e.target === v) fermer(); };
    };
    document.body.appendChild(b);
  }

  function demarrer() {
    if (!E() || typeof f0 !== 'function') return;
    var L = lire();
    if (L.cNeuf && L.cNeuf !== L.c) { verifierCode(L.cNeuf, false); }
    var secret = L.c || L.e;
    if (secret) {
      lireGet('retour=' + encodeURIComponent(secret)).then(function (r) { if (r && r.ok) bouton(r, L); }).catch(function () {});
    }
    var besoinListe = !secret || document.getElementById('bt-m0');
    if (!besoinListe) return;
    lireGet('liste=1&app=' + encodeURIComponent(C().app_id || '')).then(function (r) {
      LISTE = (r && r.ok && r.etudiants) || [];
      suggestions(); setTimeout(suggestions, 1500);
      if (!secret && LISTE.length && !L.absent) accueil();
    }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
