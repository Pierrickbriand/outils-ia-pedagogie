/*
 * Suivi des cours – liaison entre une page de cours et l'application de suivi de Pierrick Briand.
 * À appeler en tête de page (avant le code du cours) :
 *   <script src="https://pierrickbriand.github.io/outils-ia-pedagogie/suivi/suivi.js"></script>
 * Ce que fait ce script, sans rien changer au cours lui-même :
 *  – il retient le lien personnel (?e=JETON) et la promotion (?p=Angers) de l'étudiant sur son appareil ;
 *  – il les ajoute à chaque envoi vers l'adresse réglée dans COURS.envoi_url, avec le titre et l'adresse du cours ;
 *  – il demande les dates des séances de la bonne promotion ;
 *  – il affiche un bouton « Mes notes » quand l'étudiant a ouvert la page avec son lien personnel.
 * Si ce script ne se charge pas, le cours fonctionne exactement comme avant.
 */
(function () {
  'use strict';
  var NB = ' ';
  var q = {};
  try { new URLSearchParams(location.search).forEach(function (v, k) { q[k] = v; }); } catch (e) {}
  var C = function () { return window.COURS || {}; };
  var cle = function () { return 'suivi-lien-' + (C().app_id || C().cle || location.pathname); };

  function lire() {
    var o = {};
    try { o = JSON.parse(localStorage.getItem(cle()) || '{}') || {}; } catch (e) { o = {}; }
    if (q.e && /^[a-z0-9]{6,20}$/i.test(q.e)) o.e = q.e;
    if (q.p) o.p = String(q.p).slice(0, 40);
    return o;
  }
  function retenir() {
    if (!q.e && !q.p) return;
    try { localStorage.setItem(cle(), JSON.stringify(lire())); } catch (e) {}
  }

  // Complète les envois et la lecture des séances, seulement vers l'adresse d'envoi du cours.
  var f0 = window.fetch;
  if (typeof f0 === 'function') {
    window.fetch = function (url, opt) {
      try {
        var E = C().envoi_url, u = typeof url === 'string' ? url : '';
        if (E && u && u.indexOf(E) === 0) {
          var L = lire();
          if (opt && String(opt.method).toUpperCase() === 'POST' && typeof opt.body === 'string') {
            var b = JSON.parse(opt.body);
            if (L.e) b.etu = L.e;
            if (L.p) b.promo = L.p;
            b.titre = b.titre || C().etiquette || C().titre || document.title;
            b.ecole = b.ecole || C().ecole || '';
            b.page = location.origin + location.pathname;
            var o2 = {}; for (var k in opt) o2[k] = opt[k];
            o2.body = JSON.stringify(b);
            opt = o2;
          } else if (/[?&]seances=1/.test(u) && !/[?&]app=/.test(u)) {
            url = u + '&app=' + encodeURIComponent(C().app_id || '') + (L.p ? '&p=' + encodeURIComponent(L.p) : '');
          }
        }
      } catch (e) { /* en cas de doute, l'envoi part tel quel */ }
      return f0.call(window, url, opt);
    };
  }

  // Bouton « Mes notes » (seulement avec un lien personnel).
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function nombre(n) { return String(Math.round((+n || 0) * 100) / 100).replace('.', ','); }
  function bouton(r) {
    var app = C().app_id || '';
    var notes = (r.notes || []).filter(function (n) { return !app || n.cours === app; });
    var st = document.createElement('style');
    st.textContent = '#suivi-notes{position:fixed;right:16px;top:12px;z-index:9000;font:600 13px/1.2 Inter,system-ui,sans-serif;background:var(--accent,#1F3D66);color:#fff;border:1px solid rgba(255,255,255,.5);border-radius:20px;padding:8px 14px;box-shadow:0 4px 16px rgba(0,0,0,.18);cursor:pointer}' +
      '#suivi-notes b{display:inline-block;margin-left:6px;background:#fff;color:var(--accent,#1F3D66);border-radius:10px;padding:1px 7px;font-size:12px}' +
      '#suivi-voile{position:fixed;inset:0;background:rgba(20,30,50,.45);z-index:9001;display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;overflow:auto}' +
      '#suivi-fen{background:#fff;color:#1B2740;border-radius:14px;max-width:560px;width:100%;padding:22px;font:15px/1.5 Inter,system-ui,sans-serif}' +
      '#suivi-fen h2{margin:0 0 10px;font-size:20px}#suivi-fen .n{border-top:1px solid #D8DCE6;padding:12px 0}#suivi-fen .v{font-size:18px;font-weight:700}' +
      '#suivi-fen button{font:inherit;font-weight:600;margin-top:12px;border:1px solid #1F3D66;background:#fff;color:#1F3D66;border-radius:8px;padding:6px 14px;cursor:pointer}' +
      '@media print{#suivi-notes,#suivi-voile{display:none!important}}';
    document.head.appendChild(st);
    var b = document.createElement('button');
    b.id = 'suivi-notes'; b.type = 'button';
    b.innerHTML = 'Mes notes' + (notes.length ? '<b>' + notes.length + '</b>' : '');
    b.title = r.prenom ? 'Lien personnel de ' + r.prenom : 'Lien personnel';
    b.onclick = function () {
      var v = document.createElement('div'); v.id = 'suivi-voile';
      v.innerHTML = '<div id="suivi-fen"><h2>' + (r.prenom ? esc(r.prenom) + ', vos notes' : 'Vos notes') + '</h2>' +
        (notes.length ? notes.map(function (n) {
          return '<div class="n"><div>' + esc(n.livrable) + '</div><div class="v">' + nombre(n.note) + ' / ' + nombre(n.sur) + '</div>' +
            (n.commentaire ? '<div style="white-space:pre-wrap;margin-top:4px">' + esc(n.commentaire) + '</div>' : '') + '</div>';
        }).join('') : '<p>Aucune note publiée pour l’instant. Elles apparaîtront ici dès que votre enseignant les aura publiées.</p>') +
        '<button type="button">Fermer</button></div>';
      v.onclick = function (e) { if (e.target === v || e.target.tagName === 'BUTTON') v.remove(); };
      document.body.appendChild(v);
    };
    document.body.appendChild(b);
  }
  function demarrer() {
    retenir();
    var L = lire(), E = C().envoi_url;
    if (!L.e || !E || typeof f0 !== 'function') return;
    f0.call(window, E + (E.indexOf('?') < 0 ? '?' : '&') + 'retour=' + encodeURIComponent(L.e))
      .then(function (r) { return r.json(); })
      .then(function (r) { if (r && r.ok) bouton(r); })
      .catch(function () { /* hors connexion : pas de bouton */ });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
