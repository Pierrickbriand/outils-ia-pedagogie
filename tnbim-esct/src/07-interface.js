/* ───────── Interface ───────── */
const $ = id => document.getElementById(id);
const chapitre = id => CHAPITRES.find(c => c.id === id) || CHAPITRES[0];

function majNav(C) {
  let html = '', tf = 0, tt = 0;
  groupes().forEach((g, gi) => {
    html += `<h2>${g}</h2>`;
    CHAPITRES.filter(c => c.groupe === gi).forEach(c => {
      const [f, t] = progression(c.id, C); tf += f; tt += t;
      html += `<a href="#${c.id}"${c.id === S.chapitre ? ' aria-current="page"' : ''}${t && f === t ? ' class="complet"' : ''}><span>${c.nav}</span>${t ? `<small>${f === t ? 'fait' : f + '/' + t}</small>` : ''}</a>`;
    });
  });
  const pc = tt ? Math.round(tf / tt * 100) : 0;
  html += `<div class="nav-global"><b>${pc} %</b> du parcours<div class="filet"><i style="width:${pc}%"></i></div></div>`;
  $('nav').innerHTML = html; typoNoeuds($('nav'));
}
function majEtat(C) {
  const a = alertes(C);
  let html = `<h2>État du projet<button type="button" class="btn" data-action="volet-etat">Fermer</button></h2>`, past = '';
  Object.keys(JAUGES).forEach(k => {
    const x = C.j[k], n = niveau(k, x), on = Math.round(x / 10);
    past += `<i class="${n[0]}"></i>`;
    html += `<div class="jauge"><div class="jauge-l"><b>${JAUGES[k].l}</b><span>${x} sur 100, ${n[1]}</span></div>
      <div class="seg ${n[0]}" role="img" aria-label="${JAUGES[k].l} : ${x} sur 100">${Array.from({ length: 10 }, (_, i) => `<i${i < on ? ' class="on"' : ''}></i>`).join('')}</div><small>${JAUGES[k].aide}</small></div>`;
  });
  html += `<h3>Alertes</h3>` + (a.length ? `<div class="alertes">${a.map(x => x[2] ? `<a class="alerte ${x[0]}" href="#${x[2]}">${x[1]}</a>` : `<span class="alerte ${x[0]}">${x[1]}</span>`).join('')}</div>` : `<p class="calme">Aucune alerte. Vos choix feront bouger ces jauges.</p>`);
  $('etat').innerHTML = html; typoNoeuds($('etat'));
  $('pastilles').innerHTML = past;
}
function majBarre() {
  const z = $('barre-etat'); if (!z) return;
  let t, alerte = false;
  if (!stockageOk) { t = `Sauvegarde automatique impossible ici : enregistrez le fichier.`; alerte = true; }
  else if (!S.maj) t = `Prêt. Le travail du groupe s'enregistre seul sur cet appareil.`;
  else { t = `Enregistré sur cet appareil à ${heure(S.maj)}.`; if (!S.exportLe) { t += ` Fichier de projet : jamais enregistré.`; alerte = S.modifs > 15; } else t += ` Fichier : ${dateFr(new Date(S.exportLe))} à ${heure(S.exportLe)}.`; }
  z.className = 'barre-etat' + (alerte ? ' alerte' : '');
  z.querySelector('span').textContent = typo(t);
}
function majConsignes() {
  document.querySelectorAll('pre[data-consigne]').forEach(p => {
    const t = texteConsigne(p.getAttribute('data-consigne'));
    p.innerHTML = esc(t).split(VIDE).join(`<span class="vide">${VIDE}</span>`);
  });
}
function majProchaine(C) {
  const z = $('prochaine'); if (!z) return;
  const r = restants(C), p = r[0];
  if (!p) { z.className = 'prochaine fini'; z.innerHTML = `<div><span class="lib">Prochaine étape du groupe</span><b>Tout l'obligatoire est fait.</b><span class="ou">Relisez le dossier, puis exportez-le.</span></div><button type="button" class="btn plein" data-aller-ch="depot" data-aller-ancre="#e-dp_pdf">Aller à l'export</button>`; typoNoeuds(z); return; }
  const c = chapitre(p.ch), n = r.length;
  z.className = 'prochaine';
  z.innerHTML = `<div><span class="lib">Prochaine étape du groupe</span><b>${esc(p.titre)}</b><span class="ou">${esc(c.nav.replace(/^\d\. /, ''))}${p.detail ? ' · ' + esc(p.detail) : ''}</span></div>
    <button type="button" class="btn plein" data-aller-ch="${p.ch}" data-aller-ancre="${esc(p.ancre)}">Y aller</button>
    <span class="reste">Il reste ${n} point${n > 1 ? 's' : ''} obligatoire${n > 1 ? 's' : ''}.</span>`;
  typoNoeuds(z);
}
function majCompteurs() {
  document.querySelectorAll('.etape[data-requis]').forEach(s => {
    const n = s.getAttribute('data-requis').split(',').filter(k => !rempli(k)).length, z = s.querySelector('[data-compteur]'); if (!z) return;
    z.className = 'compteur ' + (n ? 'reste' : 'ok'); z.textContent = typo(texteCompteur(n));
  });
}
function allerAncre(ch, ancre) {
  if (S.chapitre !== ch) allerA(ch, false);
  const el = document.querySelector(ancre); if (!el) return;
  el.scrollIntoView({ block: 'start' });
  const f = el.matches('input,textarea,select') ? el : el.querySelector('input:not([type=checkbox]):not([type=radio]),textarea,select');
  if (f) f.focus({ preventScroll: true });
  const bloc = el.closest('.bloc') || el; bloc.classList.add('flash'); setTimeout(() => bloc.classList.remove('flash'), 1700);
}
function majLeger() { const C = calcul(); majNav(C); majEtat(C); majConsignes(); majCalculs(); majBarre(); majProchaine(C); majCompteurs(); verifierRappel(); }

function rendre(haut) {
  const C = calcul(), ch = chapitre(S.chapitre), i = CHAPITRES.indexOf(ch), y = window.scrollY;
  CH = ch.id;
  const prec = CHAPITRES[i - 1], suiv = CHAPITRES[i + 1];
  $('page').innerHTML = `<header class="tete"><p class="seance">${typeof ch.seance === 'function' ? ch.seance() : ch.seance}</p><h1>${ch.titre}</h1><p class="chapo">${ch.chapo}</p></header><div id="prochaine" class="prochaine"></div>${ch.rendu(C)}
    <div class="pied">${prec ? `<a class="btn" href="#${prec.id}">Étape précédente</a>` : '<span></span>'}${suiv ? `<a class="btn plein" href="#${suiv.id}">Étape suivante</a>` : ''}</div>`;
  typoNoeuds($('page'));
  document.title = typo(ch.nav.replace(/^\d\. /, '') + ' – TNBIM, ESCT Nantes');
  majLeger();
  if (haut) { window.scrollTo(0, 0); } else window.scrollTo(0, y);
}
function allerA(id, depuisHash) {
  const cible = chapitre(id).id;
  S.chapitre = cible; sauver();
  fermerVolets();
  rendre(true);
  if (!depuisHash && location.hash !== '#' + cible) history.replaceState(null, '', '#' + cible);
}

/* Messages brefs, dialogue, volets */
let minuteurBref = null;
function bref(t) { const z = $('bref'); z.textContent = typo(t); z.hidden = false; clearTimeout(minuteurBref); minuteurBref = setTimeout(() => { z.hidden = true; }, Math.max(2600, t.length * 60)); }
function demander(titre, texte, oui, non) {
  return new Promise(res => {
    const d = $('dlg'); $('dlg-t').textContent = typo(titre); $('dlg-p').textContent = typo(texte); $('dlg-oui').textContent = oui || 'Continuer'; $('dlg-non').textContent = typo(non || 'Annuler');
    if (!d.showModal) { res(window.confirm(titre + '\n\n' + texte)); return; }
    d.returnValue = 'non';
    d.onclose = () => res(d.returnValue === 'oui');
    d.showModal();
  });
}
function fermerVolets() {
  $('nav').classList.remove('ouvert'); $('etat').classList.remove('ouvert');
  document.querySelectorAll('[data-action^="volet-"]').forEach(b => b.setAttribute('aria-expanded', 'false'));
}
function basculer(id) {
  const autre = id === 'nav' ? 'etat' : 'nav';
  $(autre).classList.remove('ouvert');
  const ouvert = $(id).classList.toggle('ouvert');
  document.querySelectorAll('[data-action="volet-' + id + '"]').forEach(b => b.setAttribute('aria-expanded', String(ouvert)));
}

/* Fichiers */
function telecharger(nom, contenu, type) {
  const b = new Blob([contenu], { type: type }), u = URL.createObjectURL(b), a = document.createElement('a');
  a.href = u; a.download = nom; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000);
}
const slug = x => String(x).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
const nomGroupe = () => (rempli('id_groupe') ? 'G' + String(v('id_groupe')).trim().replace(/^g/i, '') : 'groupe');
const cheminNom = () => nomGroupe() + (rempli('id_nom') ? '_' + slug(v('id_nom')) : '');
function copier(texte, message) {
  const fin = () => bref(message || 'Copié.');
  const secours = () => { const z = document.createElement('textarea'); z.value = texte; z.style.position = 'fixed'; z.style.opacity = '0'; document.body.appendChild(z); z.select(); try { document.execCommand('copy'); fin(); } catch (e) { bref('Copie impossible : sélectionne le texte à la main.'); } z.remove(); };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(texte).then(fin, secours); else secours();
}
const nomJson = () => 'TNBIM_' + cheminNom() + '_' + (S.exportLe || new Date().toISOString()).slice(0, 10) + '.json';
function enregistrer() {
  S.exportLe = new Date().toISOString(); S.modifsExport = S.modifs;
  telecharger(nomJson(), JSON.stringify(S, null, 1), 'application/json');
  sauver(); $('rappel').hidden = true; majBarre(); bref('Fichier enregistré dans les téléchargements. Rangez-le aussi dans le dossier Teams du groupe.');
}
function preparerImpression() {
  const C = calcul(); $('impression').innerHTML = dossierHtml(C); typoNoeuds($('impression'));
  /* Pied de page du PDF : nom de l'étudiant et numéro de page (navigateurs qui gèrent les marges de page) */
  let st = $('style-impression');
  if (!st) { st = document.createElement('style'); st.id = 'style-impression'; document.head.appendChild(st); }
  const nom = ('Groupe ' + (rempli('id_groupe') ? String(v('id_groupe')).trim() : '…') + (rempli('id_nom') ? ' \u2013 ' + String(v('id_nom')).trim() : '')).replace(/[\\"\n\r]/g, ' ');
  const police = 'font-family:"Avenir Next","Segoe UI",system-ui,sans-serif;font-size:8.5pt;color:#64748B;';
  st.textContent = '@page{@bottom-left{content:"' + nom + ' \u2013 mini-dossier IA et vente";' + police + '}@bottom-right{content:counter(page) " / " counter(pages);' + police + '}}';
}
async function exporter() {
  const C = calcul(), M = manques(C), n = M.liste.length;
  if (n) {
    const ou = CHAPITRES.filter(c => M.parChapitre[c.id]).map(c => c.nav.replace(/^\d\. /, '') + ' (' + M.parChapitre[c.id] + ')').join(', ');
    const ok = await demander('Le dossier est rempli à ' + M.taux + ' %', 'Il manque ' + (n === 1 ? 'un élément' : n + ' éléments') + ' : ' + ou + '. Le PDF affichera « à compléter » à ces endroits.', 'Exporter quand même', 'Voir ce qui manque');
    if (!ok) { const premier = CHAPITRES.find(c => M.parChapitre[c.id]); if (premier && S.chapitre !== premier.id) location.hash = '#' + premier.id; return; }
  }
  preparerImpression();
  const ancien = document.title; document.title = 'TNBIM_' + cheminNom() + '_journal-dossier';
  window.print();
  setTimeout(() => { document.title = ancien; }, 1500);
}
/* Filet de sécurité : un projet effacé reste récupérable sur l'appareil, et son fichier part dans les téléchargements */
const CLE_SECOURS = CLE + '-secours';
function secours() { try { const b = localStorage.getItem(CLE_SECOURS); const d = b ? JSON.parse(b) : null; return d && d.etat && d.etat.app === APP.id ? d : null; } catch (e) { return null; } }
function blocSecours() {
  const d = secours(); if (!d || S.maj) return '';
  const quand = new Date(d.le);
  return `<section class="bloc repere"><h2>Un projet effacé peut être récupéré</h2><p>Un projet a été effacé le ${dateFr(quand)} à ${heure(d.le)}. Il reste disponible sur cet appareil.</p><div class="actions"><button type="button" class="btn plein" data-action="recuperer">Récupérer ce projet</button></div></section>`;
}
function recuperer() {
  const d = secours(); if (!d) return;
  S = Object.assign(nouvelEtat(), d.etat); sauver();
  history.replaceState(null, '', '#' + chapitre(S.chapitre).id); rendre(true); bref('Projet récupéré.');
}
async function nouveau() {
  const travail = !!S.maj;
  const texte = travail ? 'Le fichier de projet part d\'abord dans les téléchargements. Tout le travail affiché est ensuite effacé de cet appareil.' : 'La page repart d\'un projet vide.';
  if (!(await demander('Repartir de zéro ?', texte, 'Tout effacer'))) return;
  if (travail) {
    const le = new Date().toISOString();
    try { localStorage.setItem(CLE_SECOURS, JSON.stringify({ le: le, etat: S })); } catch (e) {}
    telecharger('TNBIM_' + cheminNom() + '_avant-effacement_' + le.slice(0, 10) + '.json', JSON.stringify(S, null, 1), 'application/json');
  }
  S = nouvelEtat(); try { localStorage.removeItem(CLE); } catch (e) {}
  history.replaceState(null, '', '#depart'); rendre(true); bref(travail ? 'Nouveau projet. L\'ancien est dans les téléchargements.' : 'Nouveau projet.');
}
function ouvrir() { $('fichier').value = ''; $('fichier').click(); }
function lireFichier(f) {
  const l = new FileReader();
  l.onload = async () => {
    let d; try { d = JSON.parse(l.result); } catch (e) { d = null; }
    if (!d || d.app !== APP.id || typeof d.champs !== 'object') { bref('Ce fichier n\'est pas un fichier de projet de ce module.'); return; }
    if (S.maj && !(await demander('Ouvrir ce fichier ?', 'Il remplace le travail affiché sur cet appareil.', 'Ouvrir'))) return;
    S = Object.assign(nouvelEtat(), d); sauver();
    history.replaceState(null, '', '#' + chapitre(S.chapitre).id); rendre(true); bref('Projet rouvert.');
  };
  l.readAsText(f);
}

/* Glisser-déposer : le fichier de projet n'importe où sur la page, un fichier de données dans la zone d'essai */
const porteFichier = e => !!(e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') >= 0);
const dansDepot = e => null;
function finDepose() { $('depose').hidden = true; document.querySelectorAll('.depot.survol').forEach(x => x.classList.remove('survol')); }
let minuteDepose = 0;
document.addEventListener('dragover', e => {
  if (!porteFichier(e)) return;
  e.preventDefault(); clearTimeout(minuteDepose);
  const z = dansDepot(e);
  document.querySelectorAll('.depot.survol').forEach(x => { if (x !== z) x.classList.remove('survol'); });
  if (z) z.classList.add('survol');
  $('depose').hidden = !!z || !!document.querySelector('dialog[open]');
});
/* Safari ne renseigne pas relatedTarget : on masque après une courte pause sans survol */
document.addEventListener('dragleave', () => { clearTimeout(minuteDepose); minuteDepose = setTimeout(finDepose, 150); });
document.addEventListener('drop', e => {
  if (!porteFichier(e)) return;
  e.preventDefault(); clearTimeout(minuteDepose); const z = dansDepot(e); finDepose();
  const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (!f) return;
  if (document.querySelector('dialog[open]')) return;
  if (/\.json$/i.test(f.name)) return lireFichier(f);
  bref('Fichier non reconnu. Pour reprendre le travail, déposez un fichier de projet .json.');
});
/* Rappel d'enregistrement : après beaucoup de modifications, et en fin de demi-journée */
let rappelRepousse = 0;
function verifierRappel() {
  const depuis = (S.modifs || 0) - (S.modifsExport || 0);
  const h = new Date(), m = h.getHours() * 60 + h.getMinutes();
  const finDeSeance = (m >= 735 && m <= 755);
  const montrer = Date.now() > rappelRepousse && ((depuis > 0 && (depuis >= 60 || finDeSeance)) || (finDeSeance && (S.modifs || 0) > 0));
  const fin = montrer && finDeSeance;
  $('rappel-texte').textContent = typo(fin ? `Fin de séance : enregistrez le fichier, puis rangez-le dans le dossier Teams du groupe. Sans lui, vous ne retrouvez pas votre travail à la prochaine session.` : 'Enregistrez le fichier de projet avant de fermer. Le navigateur peut tout perdre.');
  $('rappel-fait').hidden = !fin;
  $('rappel').hidden = !montrer;
}

document.addEventListener('toggle', e => { const d = e.target; if (d.matches && d.matches('details[data-aide]')) AIDES[d.getAttribute('data-aide')] = d.open; }, true);

/* ───────── Événements ───────── */
let minuteurLeger = null;
document.addEventListener('input', e => {
  const c = e.target.getAttribute && e.target.getAttribute('data-champ');
  if (!c) return;
  S.champs[c] = e.target.value; toucher();
  clearTimeout(minuteurLeger); minuteurLeger = setTimeout(majLeger, 180);
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.type === 'date' && t.hasAttribute('data-champ')) { S.champs[t.getAttribute('data-champ')] = t.value; toucher(); rendre(false); return; }
  if (t.hasAttribute('data-champ') && /^ps_opt/.test(t.getAttribute('data-champ'))) { rendre(false); return; }
  if (t.id === 'fichier') { if (t.files[0]) lireFichier(t.files[0]); return; }
  if (t.hasAttribute('data-decision')) {
    const id = t.getAttribute('data-decision'); S.choix[id] = t.value; toucher(); rendre(false);
    const r = document.querySelector('[data-decision="' + id + '"][value="' + t.value + '"]'); if (r) r.focus({ preventScroll: true });
    return;
  }
  if (t.hasAttribute('data-fait')) { const id = t.getAttribute('data-fait'); S.faits[id] = t.checked; toucher(); t.closest('.etape').classList.toggle('faite', t.checked); majLeger(); return; }
  if (t.hasAttribute('data-coche')) { S.champs[t.getAttribute('data-coche')] = t.checked ? 'oui' : 'non'; toucher(); majLeger(); return; }
  if (t.tagName === 'SELECT' && t.hasAttribute('data-champ')) {
    const c = t.getAttribute('data-champ'); S.champs[c] = t.value; toucher();
    if (c === 'id_classe') rendre(false); else majLeger();
  }
});
document.addEventListener('click', e => {
  const b = e.target.closest('button,[data-action]'); if (!b) return;
  const a = b.getAttribute('data-action');
  if (a === 'nouveau') return nouveau();
  if (a === 'fiche-md') { telecharger('fiche-chantier-rive-nord.md', cahierChantierMd(), 'text/markdown;charset=utf-8'); return bref('Fiche téléchargée. Vous l\'ajouterez au projet Claude à l\'étape « Régler Claude ».'); }
  if (a === 'fiche-csv') { telecharger('lots-chantier-rive-nord.csv', '\ufeff' + ficheChantierCsv(), 'text/csv;charset=utf-8'); return bref('Fichier des lots téléchargé.'); }
  if (a === 'jb-plus') { S.champs.jb_n = String(Math.min(40, nJournal() + 1)); toucher(); rendre(false); return; }
  if (a === 'ouvrir') return ouvrir();
  if (b.hasAttribute('data-aller-ch')) return allerAncre(b.getAttribute('data-aller-ch'), b.getAttribute('data-aller-ancre'));
  if (a === 'enregistrer') return enregistrer();
  if (a === 'exporter') return exporter();
  if (a === 'recuperer') return recuperer();
  if (a === 'volet-nav') return basculer('nav');
  if (a === 'volet-etat') return basculer('etat');
  if (a === 'copie-faite') { rappelRepousse = Date.now() + 90 * 60000; $('rappel').hidden = true; return bref('Parfait. Le travail est en sécurité.'); }
  if (a === 'plus-tard') { rappelRepousse = Date.now() + 20 * 60000; $('rappel').hidden = true; return; }
  if (b.hasAttribute('data-copier')) {
    const idc = b.getAttribute('data-copier');
    const t = texteConsigne(idc);
    return copier(t, t.indexOf(VIDE) >= 0 ? 'Copié. Attention : il reste des passages à compléter.' : 'Consigne copiée. Collez-la dans Claude.');
  }
  if (b.hasAttribute('data-scene')) {
    const id = b.getAttribute('data-scene'), va = b.getAttribute('data-variante'), rep = b.getAttribute('data-rep');
    S.scenes[id] = S.scenes[id] || {}; S.scenes[id][va] = rep; toucher(); rendre(false);
    const r = document.querySelector('[data-scene="' + id + '"][data-rep="' + rep + '"]'); if (r) r.focus({ preventScroll: true });
    return;
  }
  if (b.hasAttribute('data-radio')) {
    const c = b.getAttribute('data-radio'), val = b.getAttribute('data-valeur'); S.champs[c] = val; toucher(); rendre(false);
    const r = document.querySelector('[data-radio="' + c + '"][data-valeur="' + val + '"]'); if (r) r.focus({ preventScroll: true });
    return;
  }
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('depot')) { e.preventDefault(); e.target.click(); return; }
  const mod = e.ctrlKey || e.metaKey;
  if (mod && !e.altKey && e.code === 'KeyS') { e.preventDefault(); enregistrer(); }
  else if (mod && !e.altKey && e.code === 'KeyE') { e.preventDefault(); exporter(); }
  else if (e.altKey && !mod && e.code === 'KeyN') { e.preventDefault(); nouveau(); }
  else if (e.altKey && !mod && e.code === 'KeyO') { e.preventDefault(); ouvrir(); }
  else if (e.key === 'Escape') fermerVolets();
});
window.addEventListener('hashchange', () => { const id = location.hash.slice(1); if (CHAPITRES.some(c => c.id === id)) { if (id !== S.chapitre) allerA(id, true); } });
window.addEventListener('beforeprint', preparerImpression);
/* À la fermeture : dernières saisies écrites tout de suite, et avertissement si le fichier de projet a du retard */
function sauverMaintenant() { if (!aSauver) return; clearTimeout(minuteur); aSauver = false; try { localStorage.setItem(CLE, JSON.stringify(S)); } catch (e) {} }
window.addEventListener('pagehide', sauverMaintenant);
window.addEventListener('beforeunload', e => {
  sauverMaintenant();
  if ((S.modifs || 0) - (S.modifsExport || 0) >= 10) { e.preventDefault(); e.returnValue = ''; }
});
setInterval(verifierRappel, 60000);

/* ───────── Démarrage ───────── */
charger();
/* Premier passage : chaque chapitre déclare ses étapes, ses champs et ses choix */
(function () { const C = calcul(); CHAPITRES.forEach(c => { CH = c.id; c.rendu(C); }); })();
(function () { const id = location.hash.slice(1); if (CHAPITRES.some(c => c.id === id)) S.chapitre = id; })();
typoNoeuds(document.querySelector('.barre')); typoNoeuds($('rappel'));
document.querySelectorAll('[title]').forEach(e => e.setAttribute('title', typo(e.getAttribute('title'))));
rendre(true);
