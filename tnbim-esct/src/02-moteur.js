/* ───────── État, sauvegarde, calcul ───────── */
function nouvelEtat() {
  return { app: APP.id, version: APP.version, cree: new Date().toISOString(), maj: null, exportLe: null, modifs: 0,
    chapitre: 'depart', champs: {}, faits: {}, choix: {}, scenes: {} };
}
let S = nouvelEtat();
let stockageOk = true;

function charger() {
  try {
    const brut = localStorage.getItem(CLE);
    if (brut) { const d = JSON.parse(brut); if (d && d.app === APP.id) S = Object.assign(nouvelEtat(), d); }
  } catch (e) { stockageOk = false; }
}
let minuteur = null, aSauver = false;
function sauver() {
  clearTimeout(minuteur); aSauver = true;
  minuteur = setTimeout(() => {
    try { localStorage.setItem(CLE, JSON.stringify(S)); stockageOk = true; } catch (e) { stockageOk = false; }
    aSauver = false;
    majBarre();
  }, 250);
}
function toucher() { S.maj = new Date().toISOString(); S.modifs = (S.modifs || 0) + 1; sauver(); }

const v = (cle, defaut) => { const x = S.champs[cle]; return (x === undefined || x === null) ? (defaut === undefined ? '' : defaut) : x; };
const rempli = cle => String(v(cle)).trim().length > 0;
const num = (cle, defaut) => { const x = parseFloat(String(v(cle, defaut)).replace(/\s/g, '').replace(',', '.')); return isFinite(x) ? x : NaN; };
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const borne = x => Math.max(0, Math.min(100, x));

/* Typographie française : espaces insécables, apostrophes, milliers */
function typo(t) {
  return String(t)
    .replace(/(\p{L})'(?=\p{L}|«)/gu, '$1’')
    .replace(/« /g, '« ').replace(/ »/g, ' »')
    .replace(/ ([:;!?])/g, ' $1')
    .replace(/(\d) (\d{3})(?!\d)/g, '$1 $2')
    .replace(/(\d) h (\d)/g, '$1 h $2')
    .replace(/(\d) (%|€|h|min|heures?|minutes?|jours?|semaines?|mois|ans?)(?![\p{L}])/gu, '$1 $2')
    .replace(/n° /g, 'n° ');
}
function typoNoeuds(racine) {
  const marcheur = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const p = n.parentElement;
      if (!p || p.closest('pre,textarea,script,style,[data-brut]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const noeuds = []; while (marcheur.nextNode()) noeuds.push(marcheur.currentNode);
  noeuds.forEach(n => { const t = typo(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; });
  racine.querySelectorAll('[placeholder]').forEach(e => e.setAttribute('placeholder', typo(e.getAttribute('placeholder'))));
}
const nb = (x, dec) => isFinite(x) ? x.toLocaleString('fr-FR', { maximumFractionDigits: dec || 0, minimumFractionDigits: 0 }) : '–';
const heure = iso => { const d = new Date(iso); return d.getHours() + ' h ' + String(d.getMinutes()).padStart(2, '0'); };
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const dateFr = d => (d.getDate() === 1 ? '1er' : d.getDate()) + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear();

/* Ordre de calcul : les choix d'un chapitre, puis la scène qui en découle */
const ORDRE = [
  ['d', 'donnees'], ['d', 'cadrage'], ['d', 'projet_perim'], ['d', 'sources'], ['d', 'journal'], ['s', 's_veille']
];
function appliquer(j, e) { Object.keys(e || {}).forEach(k => { j[k] = borne(j[k] + e[k]); }); }
function calcul() {
  const j = {}; Object.keys(JAUGES).forEach(k => { j[k] = JAUGES[k].base; });
  const variantes = {};
  ORDRE.forEach(([type, id]) => {
    if (type === 'd') {
      const o = DECISIONS[id].options.find(x => x.id === S.choix[id]);
      if (o) appliquer(j, o.e);
    } else {
      const sc = SCENES[id];
      if (!sc.dependDe.every(d => S.choix[d])) { variantes[id] = null; return; }
      const va = sc.variantes.find(x => x.si({ j: Object.assign({}, j), choix: S.choix }));
      variantes[id] = va;
      const rep = S.scenes[id] && S.scenes[id][va.id];
      const r = va.reps.find(x => x.id === rep);
      if (r) appliquer(j, r.e);
    }
  });
  const c = S.choix;
  const drap = {
    donneesReelles: c.donnees === 'reelles', cadrageIA: c.cadrage === 'jamais' || c.cadrage === 'apres', sansVerif: c.sources === 'copier',
    journalTardif: c.journal === 'fin', tropLarge: c.projet_perim === 'tout'
  };
  /* Question du jury : le point le plus faible */
  const faiblesse = { risque: j.risque, charge: j.charge, fiabilite: 100 - j.fiabilite, tracabilite: 100 - j.tracabilite };
  const faible = Object.keys(faiblesse).sort((a, b) => faiblesse[b] - faiblesse[a])[0];
  return { j, variantes, drap, faible };
}
function niveau(k, x) {
  const g = JAUGES[k], r = g.sens < 0 ? (x <= 30 ? 0 : x <= 50 ? 1 : x <= 64 ? 2 : 3) : (x >= 70 ? 0 : x >= 50 ? 1 : x >= 36 ? 2 : 3);
  return [['vert', 'neutre', 'ambre', 'rouge'][r], g.niv[r]];
}
function alertes(C) {
  const a = [], d = C.drap, j = C.j;
  if (d.donneesReelles) a.push(['rouge', `Données réelles : changez ce choix avant d'aller plus loin.`, 'chantier']);
  if (d.sansVerif) a.push(['rouge', `Références copiées sans vérification : ouvrez chaque source officielle.`, 'journal']);
  if (d.cadrageIA) a.push(['orange', `Cadrage initial non écrit avant Claude : reprenez-le à la main.`, 'journal']);
  if (d.journalTardif) a.push(['orange', `Journal reconstitué à la fin : sans journal, l'usage de l'IA est plafonné à 1,5 point sur 3.`, 'journal']);
  if (d.tropLarge || j.charge >= 65) a.push(['orange', `Périmètre trop large pour l'oral.`, 'projet']);
  if (j.fiabilite <= 35) a.push(['orange', `Sources fragiles : que reste-t-il à vérifier ?`, 'journal']);
  if (j.tracabilite <= 35) a.push(['orange', `Traçabilité faible : le journal manque de lignes.`, 'journal']);
  const n = lignesJournal().filter(l => l.rempli).length;
  if (n >= 3 && !lignesJournal().some(l => l.rempli && (l.decision === 'rejete' || l.decision === 'modifie'))) a.push(['info', `Aucune ligne du journal n'est modifiée ou rejetée. Cela peut arriver, mais le jury demandera ce que vous avez corrigé.`, null]);
  const sansJustif = Object.keys(DECISIONS).filter(id => S.choix[id] && !rempli('j_' + id)).length;
  if (sansJustif) a.push(['info', sansJustif === 1 ? `Un choix reste sans justification.` : sansJustif + ` choix restent sans justification.`, null]);
  return a;
}

/* ───────── Registre et aides de rendu ───────── */
const REG = { etapes: {}, champs: {}, decisions: {}, scenes: {}, facultatives: {}, seq: [], seqVu: {}, etapeChamps: {}, champsEtape: {} };
function enreg(t, id, ch, titre) { const k = t + ':' + id; if (REG.seqVu[k]) return; REG.seqVu[k] = true; REG.seq.push({ t, id, ch, titre: String(titre).replace(/<[^>]+>/g, '') }); }
/* Étapes d'entraînement : facultatives, hors taux de remplissage et hors progression */
const ENTRAINEMENT = ['c_test'];
const CHAPITRES_MIXTES = ['claude'];
let CH = null; /* chapitre en cours de rendu */

function champ(cle, libelle, o) {
  o = o || {};
  REG.champs[cle] = { l: libelle, ch: CH, requis: !!o.requis };
  const val = v(cle, o.defaut);
  const facultatif = o.requis ? '' : ' <em>(facultatif)</em>';
  let saisie;
  if (o.type === 'zone') saisie = `<textarea data-champ="${cle}" rows="${o.lignes || 3}" placeholder="${esc(o.ex || '')}">${esc(val)}</textarea>`;
  else if (o.type === 'date') saisie = `<input type="date" data-champ="${cle}" value="${esc(val)}">`;
  else if (o.type === 'liste') saisie = `<select data-champ="${cle}">${[['', 'Choisir…']].concat(o.options).map(x => `<option value="${esc(x[0])}"${String(val) === String(x[0]) ? ' selected' : ''}>${esc(x[1])}</option>`).join('')}</select>`;
  else saisie = `<input type="text"${o.type === 'nombre' ? ' inputmode="decimal"' : ''} data-champ="${cle}" value="${esc(val)}" placeholder="${esc(o.ex || '')}" autocomplete="off">`;
  return `<label class="champ${o.large ? ' large' : ''}"><span class="l">${libelle}${o.sansMention ? '' : facultatif}</span>${saisie}${o.aide ? `<span class="aide">${o.aide}</span>` : ''}</label>`;
}
function coche(cle, libelle, defaut) {
  REG.champs[cle] = { l: libelle, ch: CH, requis: false, coche: true };
  const on = v(cle, defaut ? 'oui' : 'non') === 'oui';
  return `<label class="coche"><input type="checkbox" data-coche="${cle}"${on ? ' checked' : ''}><span>${libelle}</span></label>`;
}
const estCoche = (cle, defaut) => v(cle, defaut ? 'oui' : 'non') === 'oui';

const texteCompteur = n => n > 0 ? n + ' champ' + (n > 1 ? 's' : '') + ' à remplir' : 'Rempli';
function etape(id, titre, duree, corps) {
  REG.etapes[id] = CH; enreg('e', id, CH, titre);
  const cles = Array.from(new Set((corps.match(/data-champ="([^"]+)"/g) || []).map(s => s.slice(12, -1))));
  cles.forEach(k => { REG.champsEtape[k] = id; });
  const requises = cles.filter(k => REG.champs[k] && REG.champs[k].requis); REG.etapeChamps[id] = requises;
  const nManque = requises.filter(k => !rempli(k)).length;
  const compteur = requises.length ? `<span class="compteur ${nManque ? 'reste' : 'ok'}" data-compteur>${texteCompteur(nManque)}</span>` : '';
  const fac = ENTRAINEMENT.indexOf(id) >= 0; if (fac) REG.facultatives[id] = true;
  const statut = CHAPITRES_MIXTES.indexOf(CH) >= 0 ? (fac ? `<span class="statut facultatif">Entraînement · facultatif</span>` : `<span class="statut obligatoire">Obligatoire</span>`) : '';
  const fait = !!S.faits[id];
  return `<section class="bloc etape${fait ? ' faite' : ''}${fac ? ' entrainement' : ''}" id="e-${id}"${requises.length ? ` data-requis="${requises.join(',')}"` : ''}>
    <div class="etape-tete"><h2>${titre}${duree ? `<span class="duree">${duree}</span>` : ''}${statut}${compteur}</h2>
    <label class="fait"><input type="checkbox" data-fait="${id}"${fait ? ' checked' : ''}>Fait</label></div>
    ${corps}</section>`;
}
/* Aide contextuelle repliable : l'état ouvert ou fermé est gardé en mémoire pendant la visite, pas dans le projet */
const AIDES = {};
const PICTO_AIDE = '<svg class="picto" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="8.2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="10" cy="6.2" r="1.1" fill="currentColor"/><path d="M10 9v5.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>';
function aide(titre, corps, id) {
  id = id || titre;
  return `<details class="bloc aide" data-aide="${esc(id)}"${AIDES[id] ? ' open' : ''}><summary>${PICTO_AIDE}<span>${titre}</span></summary><div class="aide-corps">${corps}</div></details>`;
}
function partie(obligatoire, titre, texte) {
  return `<div class="partie ${obligatoire ? 'obligatoire' : 'facultatif'}"><span class="statut ${obligatoire ? 'obligatoire' : 'facultatif'}">${obligatoire ? 'Obligatoire' : 'Facultatif'}</span><h2>${titre}</h2><p>${texte}</p></div>`;
}
function bloc(titre, corps, classe) { return `<section class="bloc${classe ? ' ' + classe : ''}">${titre ? `<h2>${titre}</h2>` : ''}${corps}</section>`; }
function liens(ids) { return `<ul class="sources">${ids.map(i => `<li><a href="${SOURCES[i].u}" target="_blank" rel="noopener">${SOURCES[i].t}</a></li>`).join('')}</ul>`; }
function repere(titre, corps, ids) {
  return `<section class="bloc repere"><h2>${titre}</h2>${corps}${ids ? liens(ids) + `<p class="verif">${VERIFIE() ? `Repères relus le ${VERIFIE()} sur les sources officielles.` : `Repères à vérifier : aucun texte n'a encore été relu pour ce module.`} Le droit change : ouvrez la source avant de la citer.</p>` : ''}</section>`;
}
function tirets(items) { return `<ul class="tirets">${items.map((x, i) => `<li>${x}${/[?!]$/.test(x) ? '' : i === items.length - 1 ? '.' : ' ;'}</li>`).join('')}</ul>`; }
function pas(items) { return `<ol class="pas">${items.map(x => `<li>${x}</li>`).join('')}</ol>`; }

const CONSIGNES = {};
function consigne(id, titre) {
  return `<div class="consigne"><div class="consigne-tete"><b>${titre}</b><button type="button" class="btn" data-copier="${id}">Copier</button></div><pre data-consigne="${id}" tabindex="0"></pre></div>`;
}
const VIDE = '⟦à compléter⟧';
const ou = (cle, defaut) => rempli(cle) ? String(v(cle)).trim() : (defaut || VIDE);

function effets(e) {
  const k = Object.keys(e || {}); if (!k.length) return '';
  return `<div class="effets">${k.map(x => { const bon = (e[x] * JAUGES[x].sens) > 0; return `<span class="effet ${bon ? 'bon' : 'mauvais'}">${JAUGES[x].l} ${e[x] > 0 ? '+' : '−'}${Math.abs(e[x])}</span>`; }).join('')}</div>`;
}
function decision(id) {
  REG.decisions[id] = CH; enreg('d', id, CH, DECISIONS[id].q);
  REG.champs['j_' + id] = { l: 'Justification', ch: CH, requis: true };
  const d = DECISIONS[id], choisi = S.choix[id], o = d.options.find(x => x.id === choisi);
  return `<section class="bloc decision" id="d-${id}">
    <p class="genre">Un choix à faire</p><p class="q">${d.q}</p>
    <div class="options" role="radiogroup" aria-label="${esc(d.q)}">${d.options.map(x => `<label class="option${x.id === choisi ? ' choisi' : ''}"><input type="radio" name="d-${id}" value="${x.id}" data-decision="${id}"${x.id === choisi ? ' checked' : ''}><span>${x.l}</span></label>`).join('')}</div>
    ${o ? `<div class="suite${o.grave ? ' grave' : ''}">${o.suite}</div>${effets(o.e)}
      <div class="champs"><label class="champ large"><span class="l">Expliquez votre choix en trois phrases simples</span><textarea data-champ="j_${id}" rows="4" placeholder="1. Ce que nous avons lu ou constaté : …  2. Pourquoi ce choix convient à notre projet : …  3. Ce que nous ferons concrètement : …">${esc(v('j_' + id))}</textarea><span class="aide">Phrase 1 : ce que vous avez lu ou constaté${d.sources ? ' (dans un des textes ci-dessous)' : ''}. Phrase 2 : pourquoi ce choix convient à votre projet. Phrase 3 : ce que vous ferez concrètement. Vous pouvez changer d'avis : l'état du projet se recalcule.</span></label></div>
      ${d.sources ? liens(d.sources) : ''}` : `<p class="note" style="margin-top:12px">Votre choix modifie l'état du projet, affiché à droite.</p>`}
  </section>`;
}
function scene(id, C) {
  REG.scenes[id] = CH; enreg('s', id, CH, 'Scène : ' + SCENES[id].titre);
  const sc = SCENES[id], va = C.variantes[id];
  if (!va) return `<section class="bloc scene" id="s-${id}"><p class="genre">Une scène</p><h2>${sc.titre}</h2><p class="verrou">Faites d'abord vos choix ci-dessus : la scène en dépend.</p></section>`;
  const rep = S.scenes[id] && S.scenes[id][va.id], r = va.reps.find(x => x.id === rep);
  return `<section class="bloc scene" id="s-${id}"><p class="genre">Une scène, née de vos choix</p><h2>${sc.titre}</h2><p>${va.texte}</p>
    <div class="reps">${va.reps.map(x => `<button type="button" class="rep${x.id === rep ? ' choisi' : ''}" data-scene="${id}" data-variante="${va.id}" data-rep="${x.id}" aria-pressed="${x.id === rep}">${x.l}</button>`).join('')}</div>
    ${r ? `<div class="suite">${r.suite}</div>${effets(r.e)}` : ''}</section>`;
}

/* Ce qui reste d'obligatoire, dans l'ordre du parcours */
function restants(C) {
  const out = [];
  CHAPITRES.forEach(c => {
    REG.seq.filter(x => x.ch === c.id).forEach(x => {
      if (x.t === 'e') {
        if (REG.facultatives[x.id] || horsProjet(x.id)) return;
        const manque = (REG.etapeChamps[x.id] || []).filter(k => !rempli(k)).length;
        if (!S.faits[x.id] || manque) out.push({ ch: c.id, ancre: '#e-' + x.id, titre: x.titre, detail: manque ? texteCompteur(manque) : 'à cocher quand c\'est fait' });
      } else if (x.t === 'd') {
        if (!S.choix[x.id] || !rempli('j_' + x.id)) out.push({ ch: c.id, ancre: '#d-' + x.id, titre: x.titre, detail: !S.choix[x.id] ? 'choix à faire' : 'justification à écrire' });
      } else if (x.t === 's') {
        const va = C.variantes[x.id];
        if (!va || !(S.scenes[x.id] && S.scenes[x.id][va.id])) out.push({ ch: c.id, ancre: '#s-' + x.id, titre: x.titre, detail: va ? 'réponse à choisir' : 'après vos choix' });
      }
    });
    Object.keys(REG.champs).forEach(k => {
      const f = REG.champs[k];
      if (f.ch !== c.id || !f.requis || k.indexOf('j_') === 0 || REG.champsEtape[k] || rempli(k)) return;
      out.push({ ch: c.id, ancre: '[data-champ="' + k + '"]', titre: String(f.l).replace(/<[^>]+>/g, ''), detail: 'champ à remplir' });
    });
  });
  return out;
}

/* Progression */
function progression(ch, C) {
  let total = 0, fait = 0;
  Object.keys(REG.etapes).forEach(id => { if (REG.etapes[id] === ch && !REG.facultatives[id] && !horsProjet(id)) { total++; if (S.faits[id]) fait++; } });
  Object.keys(REG.decisions).forEach(id => { if (REG.decisions[id] === ch) { total++; if (S.choix[id]) fait++; } });
  Object.keys(REG.scenes).forEach(id => { if (REG.scenes[id] === ch) { total++; const va = C.variantes[id]; if (va && S.scenes[id] && S.scenes[id][va.id]) fait++; } });
  return [fait, total];
}

/* Journal de bord IA : lignes numérotées, au moins trois affichées */
const JB_CHAMPS = ['date', 'outil', 'objectif', 'consigne', 'resultat', 'decision', 'pourquoi', 'verif'];
const nJournal = () => Math.max(3, parseInt(v('jb_n', '3'), 10) || 3);
function lignesJournal() {
  const out = [];
  for (let n = 1; n <= Math.max(nJournal(), 40); n++) {
    const l = { n }; JB_CHAMPS.forEach(c => { l[c] = String(v('jb' + n + '_' + c)).trim(); });
    l.rempli = !!(l.objectif || l.consigne || l.resultat || l.pourquoi);
    out.push(l);
  }
  return out.slice(0, Math.max(nJournal(), out.reduce((m, l) => l.rempli ? l.n : m, 0)));
}

const horsProjet = id => Object.keys(PREFIXES).some(k => id.indexOf(PREFIXES[k]) === 0 && v('pj_choix') !== k);
