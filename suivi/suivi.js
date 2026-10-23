/*
 * Suivi des cours – liaison entre une page de cours et l'application de suivi de Pierrick Briand (version 3.5).
 * À appeler en tête de page (avant le code du cours) :
 *   <script src="https://pierrickbriand.github.io/outils-ia-pedagogie/suivi/suivi.js"></script>
 * Ce que fait ce script, sans rien changer au cours lui-même :
 *  – à la première ouverture, il demande « Qui êtes-vous ? » et propose la liste de la classe (« Camille D. ») ;
 *    l'étudiant reçoit un code personnel (affiché, et envoyé par e-mail s'il donne son adresse), régénérable par e-mail ;
 *  – il ajoute ce code et la promotion à chaque envoi vers COURS.envoi_url, avec le titre et l'adresse du cours ;
 *  – il demande les dates des séances de la promotion de l'étudiant ;
 *  – il propose les noms de la classe dans les champs « NOM Prénom » du groupe ;
 *  – il affiche « Mes notes » (avec « Nouvelle note ») quand l'étudiant est identifié ;
 *  – version 3 : pour un étudiant identifié, il envoie au plus une fois par minute un signal de progression
 *    (séance, diapositive, avancement affiché par la page, onglet visible ou non). Jamais le contenu des réponses.
 *    L'étudiant en est informé (fenêtre « Qui êtes-vous ? », puis un message unique pour ceux déjà identifiés) ;
 *  – version 3.1 : à l'ouverture, les fenêtres du cours et du suivi s'affichent l'une après l'autre ;
 *  – version 3.2 : faute de frappe probable dans l'e-mail (outloook.fr, gmial.com…) : correction proposée avant l'envoi ;
 *  – version 3.3 : envoi réessayé tout seul quand l'Atelier est occupé (fin de séance) ; « Mes notes » limité au cours ; ancien code valable jusqu'à l'usage du nouveau.
 *  – version 3.4 : sur téléphone, le bouton « Mes notes » passe en bas à gauche (il ne cache plus le haut de la page).
 *  – version 3.5 : « C’est mon nom » (l’enseignant est prévenu) ; « Ce n’est pas moi » dans « Mes notes » ; durée de conservation annoncée.
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
      // Version 3.3 : quand l'Atelier répond « occupé » (toute la classe envoie en même temps), on réessaie tout seul, 4 fois au plus.
      var envoi = E() && typeof url === 'string' && url.indexOf(E()) === 0 && opt && String(opt.method).toUpperCase() === 'POST';
      if (!envoi) return f0.call(window, url, opt);
      var essai = function (n) {
        return f0.call(window, url, opt).then(function (r) {
          return r.clone().json().then(function (j) {
            if (j && j.retry && n < 4) return new Promise(function (ok) { setTimeout(ok, 2000 + Math.random() * 6000); }).then(function () { return essai(n + 1); });
            return r;
          }, function () { return r; });
        });
      };
      return essai(1);
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
      '#suivi-info{position:fixed;left:16px;right:16px;bottom:96px;z-index:9000;max-width:380px;background:#fff;color:#1B2740;border:1px solid #D8DCE6;border-radius:12px;padding:12px 14px;font:14px/1.45 Inter,system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.18)}' +
      '#suivi-info p{margin:0 0 8px}#suivi-info button{font:inherit;font-weight:600;border:1px solid #1F3D66;background:#1F3D66;color:#fff;border-radius:8px;padding:6px 14px;cursor:pointer}' +
      '@media (max-width:600px){#suivi-notes{top:auto;right:auto;left:12px;bottom:calc(72px + env(safe-area-inset-bottom,0px));padding:7px 12px}}' +
      '@media print{#suivi-notes,.suivi-voile,#suivi-info{display:none!important}}';
    document.head.appendChild(st);
  }
  function fenetre(html) {
    style();
    var v = document.querySelector('.suivi-voile');
    if (!v) { v = document.createElement('div'); v.className = 'suivi-voile'; document.body.appendChild(v); }
    v.innerHTML = '<div class="suivi-fen" role="dialog" aria-modal="true">' + html + '</div>';
    return v;
  }
  // Version 3.1 : une seule fenêtre à la fois à l'ouverture de la page.
  // Ordre : « Qui êtes-vous ? », puis « Bon retour » ou « Vous reprenez… » (moteur du cours), puis « Quoi de neuf », puis l'information sur le suivi.
  // Les cartes du moteur restent dans la page, seulement masquées tant qu'une fenêtre passe avant elles : rien n'est perdu.
  function file() {
    if (document.getElementById('suivi-file')) return;
    var st = document.createElement('style'); st.id = 'suivi-file';
    st.textContent = 'body:has(.suivi-voile) #where,body:has(.suivi-voile) #news,body:has(#where) #news{display:none!important}' +
      'body:has(.suivi-voile) #suivi-info,body:has(#where) #suivi-info,body:has(#news) #suivi-info{display:none!important}';
    document.head.appendChild(st);
  }
  function fermer() { var v = document.querySelector('.suivi-voile'); if (v) v.remove(); }
  function msg(t) { var m = document.querySelector('.suivi-fen .m'); if (m) m.textContent = t; }
  var DOMAINES = ['gmail.com', 'outlook.fr', 'outlook.com', 'hotmail.fr', 'hotmail.com', 'live.fr', 'live.com', 'yahoo.fr', 'yahoo.com', 'icloud.com', 'orange.fr', 'free.fr', 'sfr.fr', 'laposte.net', 'wanadoo.fr', 'msn.com', 'gmx.fr', 'proton.me', 'protonmail.com'];
  function distance(a, b) {
    var d = []; for (var i = 0; i <= a.length; i++) { d[i] = [i]; for (var k = 1; k <= b.length; k++) d[i][k] = i ? Math.min(d[i - 1][k] + 1, d[i][k - 1] + 1, d[i - 1][k - 1] + (a[i - 1] === b[k - 1] ? 0 : 1)) : k; }
    return d[a.length][b.length];
  }
  function suggestionEmail(e) {
    var m = /^([^@\s]+)@([^@\s]+)$/.exec(String(e || '').trim().toLowerCase()); if (!m) return '';
    var dom = m[2]; if (DOMAINES.indexOf(dom) >= 0) return '';
    if (dom === 'gmail.fr') return m[1] + '@gmail.com';
    var mieux = '', md = 3;
    for (var i = 0; i < DOMAINES.length; i++) { var k = distance(dom, DOMAINES[i]); if (k < md) { md = k; mieux = DOMAINES[i]; } }
    return mieux ? m[1] + '@' + mieux : '';
  }

  /* ---------- « Qui êtes-vous ? » ---------- */
  var LISTE = null;
  function accueil() {
    var nw = document.getElementById('news'); if (nw) nw.remove(); // un nouvel étudiant n'a pas besoin des nouveautés
    var opts = LISTE.map(function (x) { return '<option value="' + esc(x.id) + '">' + esc(x.label) + (x.pris ? ' (déjà choisi)' : '') + '</option>'; }).join('');
    var v = fenetre('<h2>Qui êtes-vous ?</h2><p class="p">Choisissez votre nom une seule fois. Il identifie votre travail auprès de votre enseignant, qui voit aussi votre avancement dans le cours (séance, diapositive, temps passé), jamais le contenu de vos réponses. Ces informations sont effacées à la fin de l’année scolaire.</p>' +
      '<label for="s-nom">Votre nom</label><select id="s-nom"><option value="">choisir…</option>' + opts + '</select>' +
      '<label for="s-mail">Votre e-mail (conseillé)</label><input id="s-mail" type="email" autocomplete="email" placeholder="prenom.nom@exemple.fr">' +
      '<p class="p">Il sert uniquement à vous envoyer votre code personnel et vos notes. Il est effacé en fin d’année. Sans e-mail, vous ne pourrez pas récupérer un code perdu.</p>' +
      '<button class="b" type="button" data-a="moi">C’est moi</button>' +
      '<br><button class="l" type="button" data-a="code">J’ai déjà un code</button><button class="l" type="button" data-a="absent">Mon nom n’est pas dans la liste</button><div class="m" aria-live="polite"></div>');
    v.onclick = function (e) {
      var a = e.target.getAttribute && e.target.getAttribute('data-a'); if (!a) return;
      if (a === 'absent') { var L = lire(); L.absent = Date.now(); ecrire(L); fermer(); return; }
      if (a === 'code') return saisirCode('');
      if (a === 'corr') { v.querySelector('#s-mail').value = e.target.getAttribute('data-v'); v._mailVu = ''; return msg('Adresse corrigée. Cliquez sur « C’est moi ».'); }
      var id = v.querySelector('#s-nom').value, mail = v.querySelector('#s-mail').value.trim();
      if (!id) return msg('Choisissez votre nom dans la liste.');
      // Version 3.2 : faute de frappe probable. Un second clic sur « C’est moi » garde l’adresse telle quelle.
      var sg = suggestionEmail(mail);
      if (sg && v._mailVu !== mail) {
        v._mailVu = mail;
        var m = v.querySelector('.m');
        if (m) m.innerHTML = 'Vouliez-vous dire <b>' + esc(sg) + '</b>\u00a0? <button class="l" type="button" data-a="corr" data-v="' + esc(sg) + '">Oui, corriger</button><br>Sinon, cliquez de nouveau sur « C’est moi ».';
        return;
      }
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
    var L = lire(); L.c = r.code; L.label = r.label; if (r.promo) L.p = r.promo; L.infoPg = 1; delete L.absent; ecrire(L);
    var v = fenetre('<h2>Bienvenue, ' + esc(String(r.label).split(' ')[0]) + '</h2><p>Votre code personnel :</p><div class="code">' + esc(r.code) + '</div>' +
      '<p class="p">' + (avecMail ? 'Il vient de vous être envoyé par e-mail. ' : 'Notez-le : il vous sera demandé sur un autre appareil. ') + 'Ce navigateur s’en souviendra. Il protège vos notes : ne le partagez pas.</p>' +
      '<button class="b" type="button">Continuer</button>');
    v.querySelector('.b').onclick = function () { location.reload(); };
  }
  function saisirCode(id) {
    var v = fenetre('<h2>Votre code personnel</h2>' + (id ? '<p class="p">Ce nom a déjà été choisi. Si c’est bien le vôtre, saisissez votre code.</p>' : '<p class="p">Saisissez le code reçu à votre première connexion.</p>') +
      '<label for="s-code">Code</label><input id="s-code" autocomplete="off" maxlength="12" style="text-transform:uppercase;letter-spacing:.15em">' +
      '<button class="b" type="button" data-a="ok">Valider</button><button class="b s" type="button" data-a="retour">Retour</button>' +
      (id ? '<br><button class="l" type="button" data-a="oubli">Code oublié ?</button><br><button class="l" type="button" data-a="signaler">C’est mon nom, mais je ne l’ai jamais choisi</button>' : '') + '<div class="m" aria-live="polite"></div>');
    v.onclick = function (e) {
      var a = e.target.getAttribute && e.target.getAttribute('data-a'); if (!a) return;
      if (a === 'retour') return accueil();
      // Version 3.5 : quelqu'un a choisi ce nom à la place de l'étudiant ; l'enseignant est prévenu et libérera le nom.
      if (a === 'signaler') {
        msg('Un instant…');
        return poster({ action: 'signaler', app: C().app_id, id: id }).then(function (r) {
          if (r && r.ok && r.libre) msg('Ce nom est de nouveau libre. Cliquez sur « Retour » et choisissez-le.');
          else if (r && r.ok) msg('Votre enseignant est prévenu. Il libérera votre nom\u00a0; vous pourrez alors le choisir de nouveau. En attendant, travaillez normalement\u00a0: rien n’est perdu.');
          else msg('Impossible pour l’instant. Prévenez directement votre enseignant.');
        }).catch(function () { msg('Impossible pour l’instant. Prévenez directement votre enseignant.'); });
      }
      if (a === 'oubli') {
        msg('Un instant…');
        return poster({ action: 'oubli', app: C().app_id, id: id }).then(function (r) {
          if (r && r.ok) msg('Un nouveau code vient d’être envoyé à ' + r.masque + '. Votre ancien code reste valable jusqu’à ce que vous utilisiez le nouveau.');
          else if (r && r.err === 'sans e-mail') msg('Aucun e-mail n’est enregistré pour ce nom. Demandez à votre enseignant de libérer votre nom, puis choisissez-le de nouveau.');
          else if (r && r.err === 'patienter') msg('Un code vient déjà d’être envoyé, ou trop de demandes ont été faites aujourd’hui. Vérifiez vos e-mails, y compris les indésirables, ou réessayez plus tard.');
          else msg('Impossible pour l’instant. Réessayez plus tard.');
        }).catch(function () { msg('Impossible pour l’instant. Vérifiez votre connexion.'); });
      }
      var code = v.querySelector('#s-code').value.trim().toUpperCase();
      if (code.length < 6) return msg('Le code compte au moins six caractères.');
      verifierCode(code, true);
    };
  }
  function verifierCode(code, interactif) {
    return poster({ action: 'code', app: C().app_id, code: code }).then(function (r) {
      if (r && r.ok) { var L = lire(); L.c = code; L.label = r.label; if (r.promo) L.p = r.promo; delete L.cNeuf; delete L.absent; ecrire(L); location.reload(); return; }
      if (interactif) msg(r && r.err === 'patienter' ? 'Trop d’essais en peu de temps. Réessayez dans une demi-heure.' : 'Ce code n’est pas reconnu pour ce cours.');
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
        '<p class="p">Connecté en tant que ' + esc(String(L.label || r.prenom || '').replace(/\.$/, '')) + '. <button class="l" type="button" data-a="pasmoi">Ce n’est pas moi</button></p><div class="m" aria-live="polite"></div><button class="b s" type="button">Fermer</button>');
      v.querySelector('.b').onclick = fermer;
      // Version 3.5 : mauvais nom choisi (ou ordinateur partagé) : le nom est libéré s'il a été choisi depuis peu, sinon l'enseignant est prévenu.
      v.querySelector('[data-a="pasmoi"]').onclick = function () {
        if (!window.confirm('Vous déconnecter de ce nom\u00a0? Si vous l’avez choisi par erreur ces derniers jours, il sera libéré pour son vrai titulaire.')) return;
        var code = lire().c;
        var sortir = function (t) { var M3 = lire(); delete M3.c; delete M3.label; delete M3.e; delete M3.vu; ecrire(M3); msg(t); setTimeout(function () { location.reload(); }, 2500); };
        if (!code) return sortir('Vous êtes déconnecté.');
        poster({ action: 'liberer', app: C().app_id, code: code }).then(function (r) {
          sortir(r && r.ok && r.libere ? 'Nom libéré. Choisissez maintenant votre vrai nom.' : r && r.ok ? 'Vous êtes déconnecté. Votre enseignant est prévenu et vérifiera.' : 'Vous êtes déconnecté. Prévenez votre enseignant si vous aviez choisi un mauvais nom.');
        }).catch(function () { sortir('Vous êtes déconnecté. Prévenez votre enseignant si vous aviez choisi un mauvais nom.'); });
      };
      v.onclick = function (e) { if (e.target === v) fermer(); };
    };
    document.body.appendChild(b);
  }

  /* ---------- Version 3 : progression ---------- */
  var PG = { dernier: 0, sig: '' };
  function etatPage() {
    var sl = document.querySelectorAll('.slide'); if (!sl.length) return null;
    var i = -1; for (var k = 0; k < sl.length; k++) if (sl[k].classList.contains('on')) { i = k; break; }
    if (i < 0) return null;
    var cnt = (document.getElementById('cnt') || {}).textContent || '';
    var s = (/^[^\d·]+?(\d+)\s*·/.exec(cnt) || [])[1]; // « Séance 2 · … », « Partie 2 · … »
    var sc = [], pcs = document.querySelectorAll('[data-pc]');
    for (k = 0; k < pcs.length; k++) { var n = +pcs[k].getAttribute('data-pc'), v = parseInt(pcs[k].textContent, 10); if (n > 0 && n <= 20 && !isNaN(v)) sc[n - 1] = v; }
    for (k = 0; k < sc.length; k++) if (sc[k] == null) sc[k] = 0;
    var mm = /(\d+)\s*%/.exec((document.getElementById('bProg') || {}).textContent || '');
    return { s: s ? +s : null, i: i + 1, n: sl.length, ti: String(sl[i].getAttribute('data-title') || '').slice(0, 80), sc: sc, m: mm ? +mm[1] : null };
  }
  function signal(fin) {
    try {
      var L = lire(), c = C();
      if ((!L.c && !L.e) || !E() || !c.app_id || c.dash || c.code_enseignant) return;
      var e = etatPage(); if (!e) return;
      var cache = document.visibilityState === 'hidden', sig = JSON.stringify(e) + cache, now = Date.now();
      if (cache && !fin) { if (!PG.hd) PG.hd = now; if (now - PG.hd > 20 * 60000) return; } else PG.hd = 0; // onglet caché plus de 20 min : silence
      if (fin) { if (!PG.dernier) return; }
      else if (now - PG.dernier < 55000 || (sig === PG.sig && now - PG.dernier < 3 * 60000)) return; // rien de neuf : un signal de présence toutes les 3 min
      var corps = { action: 'trace', app: c.app_id, s: e.s, i: e.i, n: e.n, ti: e.ti, sc: e.sc, m: e.m };
      if (L.c) corps.code = L.c; else corps.etu = L.e;
      if (L.p) corps.promo = L.p;
      if (cache) corps.h = 1;
      if (fin) corps.fin = 1;
      PG.sig = sig; PG.dernier = now;
      var txt = JSON.stringify(corps);
      if (fin && navigator.sendBeacon) { navigator.sendBeacon(E(), new Blob([txt], { type: 'text/plain;charset=utf-8' })); return; }
      f0.call(window, E(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: txt, keepalive: true }).catch(function () {});
    } catch (x) { /* le suivi ne doit jamais gêner le cours */ }
  }
  function infoProgression() {
    var L = lire(); if (!(L.c || L.e) || L.infoPg || document.getElementById('suivi-info')) return;
    style();
    var d = document.createElement('div'); d.id = 'suivi-info'; d.setAttribute('role', 'status');
    d.innerHTML = '<p>Votre enseignant voit votre avancement dans ce cours\u00a0: la séance, la diapositive où vous êtes et le temps passé. Jamais le contenu de vos réponses.</p><button type="button">Compris</button>';
    document.body.appendChild(d);
    d.querySelector('button').onclick = function () { var L2 = lire(); L2.infoPg = 1; ecrire(L2); d.remove(); };
  }

  function demarrer() {
    file();
    if (!E() || typeof f0 !== 'function') return;
    setInterval(function () { signal(false); }, 15000);
    setTimeout(function () { signal(false); }, 5000);
    window.addEventListener('pagehide', function () { signal(true); });
    var L = lire();
    if ((L.c || L.e) && !L.infoPg) setTimeout(infoProgression, 2500);
    if (L.cNeuf && L.cNeuf !== L.c) { verifierCode(L.cNeuf, false); }
    var secret = L.c || L.e;
    if (secret) {
      lireGet('retour=' + encodeURIComponent(secret) + '&app=' + encodeURIComponent(C().app_id || '')).then(function (r) { if (r && r.ok) bouton(r, L); }).catch(function () {});
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
