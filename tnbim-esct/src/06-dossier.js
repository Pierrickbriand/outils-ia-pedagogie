/* ───────── Diagnostic, manques, dossier ───────── */
function diagnostic(C) {
  const j = C.j, d = C.drap, faibles = [];
  if (j.risque >= 65) faibles.push('le risque juridique');
  if (j.charge >= 65) faibles.push('la charge de travail');
  if (j.fiabilite <= 35) faibles.push('la fiabilité des sources');
  if (j.tracabilite <= 35) faibles.push('la traçabilité de l\'IA');
  const nbChoix = Object.keys(DECISIONS).filter(k => S.choix[k]).length;
  let titre;
  if (nbChoix < 3) titre = `Diagnostic provisoire : faites d'abord vos choix`;
  else if (!faibles.length) titre = `Projet maîtrisé`;
  else if (faibles.length === 1) titre = `Projet solide, avec un point faible : ${faibles[0]}`;
  else titre = `Projet à reprendre sur ${faibles.length} points`;
  const ph = [];
  ph.push(j.risque <= 30 ? `Risque juridique : le projet reste dans un cadre que vous savez expliquer.` : j.risque < 65 ? `Risque juridique : des points restent à sécuriser avant le dépôt.` : `Risque juridique : le dossier expose le groupe. Reprenez les données et les références.`);
  ph.push(j.charge <= 50 ? `Charge de travail : le périmètre tient dans le temps disponible.` : j.charge < 65 ? `Charge de travail : le périmètre est tendu. Chaque ajout se paie.` : `Charge de travail : le périmètre dépasse le temps disponible.`);
  ph.push(j.fiabilite >= 70 ? `Fiabilité : les références ont été ouvertes et les chiffres refaits à la main.` : j.fiabilite > 35 ? `Fiabilité : elle tient, mais des références restent à ouvrir.` : `Fiabilité : trop de références reposent sur la seule parole de l'outil.`);
  ph.push(j.tracabilite >= 70 ? `Traçabilité : le journal montre ce que l'IA a apporté, et ce que vous avez rejeté.` : j.tracabilite > 35 ? `Traçabilité : le journal existe, il manque des lignes ou des rejets.` : `Traçabilité : le journal est trop pauvre pour être crédible.`);
  if (nbChoix < 3) { ph.length = 0; ph.push(`Vous n'avez pas encore fait assez de choix pour un diagnostic. Avancez dans les étapes 1 à 4, puis revenez ici.`); }
  const lignes = lignesJournal().filter(l => l.rempli).length;
  const verdicts = THEMES_JURIDIQUES.filter((t, i) => v('fc' + (i + 1) + '_verdict')).length;
  const pool = [
    [0, d.donneesReelles, `Retirer les données réelles de vos conversations et repartir sur le chantier fictif.`],
    [0, d.cadrageIA, `Réécrire le cadrage initial à la main et le dater.`],
    [0, d.sansVerif, `Ouvrir chaque référence sur sa source officielle et noter le verdict.`],
    [0, lignes < 3, `Remplir le journal : au moins trois usages significatifs, dont un rejeté ou modifié.`],
    [0, true, `Enregistrer le fichier de projet et le ranger dans le dossier Teams du groupe.`],
    [1, verdicts < 3, `Terminer la fiche de contrôle : un verdict pour chaque thème traité.`],
    [1, j.charge >= 60, `Réduire le périmètre au livrable minimal et le terminer.`],
    [1, true, `Refaire à la main un calcul de chaque tableau ou indicateur du projet.`],
    [1, true, `Préparer le support : dix diapositives au plus, avec sources et dates.`],
    [2, true, `Relire le journal et la fiche de contrôle avec une personne extérieure au groupe.`],
    [2, true, `Préparer l'oral : qui présente quoi, et la réponse à la question du jury.`],
    [2, true, `Déposer les fichiers sur Teams au plus tard ${DEPOT()}.`]
  ];
  const temps = [`Cette semaine`, `Avant le dépôt`, `Avant l'oral`].map((t, i) => ({ t, a: pool.filter(x => x[0] === i && x[1]).slice(0, 3).map(x => x[2].replace(/\.$/, '')) }));
  return { titre, phrases: ph, alertes: alertes(C).filter(a => a[0] !== 'info').map(a => a[1]), temps };
}

function manques(C) {
  const m = [];
  Object.keys(REG.champs).forEach(k => {
    const c = REG.champs[k]; if (!c.requis || k.indexOf('j_') === 0) return;
    if (!rempli(k)) m.push({ l: c.l.replace(/<[^>]+>/g, ''), ch: c.ch });
  });
  Object.keys(DECISIONS).forEach(id => {
    if (!S.choix[id]) { m.push({ l: 'Choix : ' + DECISIONS[id].q, ch: REG.decisions[id] }); m.push({ l: 'Justification : ' + DECISIONS[id].q, ch: REG.decisions[id] }); }
    else if (!rempli('j_' + id)) m.push({ l: 'Justification : ' + DECISIONS[id].q, ch: REG.decisions[id] });
  });
  Object.keys(SCENES).forEach(id => { const va = C.variantes[id]; if (!va || !(S.scenes[id] && S.scenes[id][va.id])) m.push({ l: 'Scène : ' + SCENES[id].titre, ch: REG.scenes[id] }); });
  const parChapitre = {}; m.forEach(x => { parChapitre[x.ch] = (parChapitre[x.ch] || 0) + 1; });
  const total = Object.keys(REG.champs).filter(k => REG.champs[k].requis && k.indexOf('j_') !== 0).length + 2 * Object.keys(DECISIONS).length + Object.keys(SCENES).length;
  return { liste: m, parChapitre, taux: Math.max(0, Math.min(100, Math.round((total - m.length) / total * 100))) };
}

const LIB_DECISION = { garde: 'Gardé', modifie: 'Modifié', rejete: 'Rejeté' };
const LIB_VERDICT = { exacte: 'Exacte', inexacte: 'Inexacte', introuvable: 'Introuvable', perimee: 'Périmée' };
/* Le dossier : même contenu à l'écran et à l'impression */
function travailDossier() {
  const t = cle => rempli(cle) ? esc(String(v(cle)).trim()).replace(/\n/g, '<br>') : `<span class="vide">à compléter</span>`;
  const qr = (l, cle) => `<h3>${l}</h3><p>${t(cle)}</p>`;
  const p = v('pj_choix');
  if (p === 'strategie') { const r = calcStrat(); return `<h3>Options</h3><p>${[1, 2, 3].filter(o => rempli('ps_opt' + o)).map(o => esc(v('ps_opt' + o))).join(' ; ') || '<span class="vide">à compléter</span>'}</p>` + qr('Hypothèses chiffrées et sources', 'ps_hyp')
      + `<h3>Grille pondérée</h3>` + (r.ok ? `<table><tr><th>Critère</th><th>Poids</th>${r.noms.map(n => `<th>${esc(n)}</th>`).join('')}</tr>${CRITERES_STRAT.map((c, i) => `<tr><td>${c}</td><td>${esc(v('ps_w' + (i + 1)))}</td>${[1, 2, 3].map(o => `<td>${esc(v('ps_s' + (i + 1) + '_' + o))}</td>`).join('')}</tr>`).join('')}<tr><td><b>Note pondérée sur 10</b></td><td></td>${r.t.map(x => `<td><b>${nb(x, 2)}</b></td>`).join('')}</tr></table>` : `<p><span class="vide">grille à compléter</span></p>`)
      + qr('Calcul refait à la main', 'ps_verif') + qr('Recommandation', 'ps_reco') + qr('Forces et faiblesses', 'ps_ff') + qr('Ce qui ferait changer d\'avis', 'ps_limites') + qr('Ce que le projet apporte aux autres missions', 'ps_trans'); }
  if (p === 'chantier') { const L = lignesSuivi().filter(x => x.ok); return `<p><b>Mois de suivi.</b> ${t('pc_mois')}</p>` + qr('Règles d\'invention des données', 'pc_regles') + qr('D\'où viendraient ces données dans un chantier numérisé', 'pc_sources')
      + (L.length ? `<table><tr><th>Lot</th><th>Prévu</th><th>Réel</th><th>Dépensé</th><th>SPI</th><th>CPI</th></tr>${L.map(x => `<tr><td>${x.n}. ${x.lot}</td><td>${pct(x.prevu)}</td><td>${pct(x.av)}</td><td>${eur(x.dep)}</td><td>${nb(x.spi, 2)}</td><td>${nb(x.cpi, 2)}</td></tr>`).join('')}</table>` : `<p><span class="vide">suivi à compléter</span></p>`)
      + qr('Calcul refait à la main', 'pc_verif') + `<h3>Aléa traité</h3><p>${CHANTIER.aleas[parseInt(v('pc_alea'), 10) - 1] || '<span class="vide">à compléter</span>'}</p>` + qr('Indicateurs clés', 'pc_indic') + qr('Actions correctives', 'pc_actions') + qr('Ce que le numérique change', 'pc_numerique') + qr('Forces et faiblesses', 'pc_ff') + qr('Ce que le projet apporte aux autres missions', 'pc_trans'); }
  if (p === 'contrats') { return qr('Documents contractuels supposés', 'pk_docs') + qr('Cadre applicable', 'pk_cadre')
      + `<table><tr><th>Cas</th><th>Risque</th><th>Référence</th><th>Source officielle</th><th>Date</th><th>Statut</th><th>Action</th></tr>${[1, 2, 3, 4].filter(n => rempli('ck' + n + '_cas')).map(n => { const g = c => rempli('ck' + n + '_' + c) ? esc(v('ck' + n + '_' + c)) : '–'; return `<tr><td>${CAS_VEILLE[parseInt(v('ck' + n + '_cas'), 10) - 1] || g('cas')}</td><td>${g('risque')}</td><td>${g('ref')}</td><td>${g('src')}</td><td>${g('date')}</td><td>${v('ck' + n + '_statut') === 'verifie' ? 'Vérifié' : 'À vérifier'}</td><td>${g('action')}</td></tr>`; }).join('')}</table>`
      + qr('Points de vigilance', 'pk_synthese') + qr('Forces et faiblesses', 'pk_ff') + qr('Ce que le projet apporte aux autres missions', 'pk_trans'); }
  if (p === 'rh') { const E = effectifsMois(), pic = E.reduce((a, b) => b.tot > a.tot ? b : a); return `<p><b>Pointe de charge.</b> ${pic.tot} personnes au mois ${pic.m}. <b>Personnes mobilisables.</b> ${t('pr_dispo')}.</p>` + qr('Notre lecture du planning', 'pr_lecture') + qr('Calcul refait à la main', 'pr_verif')
      + `<table><tr><th>Compétence</th><th>Lots</th><th>Besoin</th><th>Mesure</th></tr>${[1, 2, 3, 4].filter(n => rempli('rc' + n + '_nom')).map(n => `<tr><td>${esc(v('rc' + n + '_nom'))}</td><td>${esc(v('rc' + n + '_lots'))}</td><td>${esc(v('rc' + n + '_besoin'))}</td><td>${esc(v('rc' + n + '_mesure'))}</td></tr>`).join('')}</table>` + qr('Trois mesures RH', 'pr_mesures') + qr('Ce qui change dans les métiers', 'pr_metiers') + qr('Forces et faiblesses', 'pr_ff') + qr('Ce que le projet apporte aux autres missions', 'pr_trans'); }
  return `<p><span class="vide">projet à choisir</span></p>`;
}
function dossierHtml(C) {
  const t = cle => rempli(cle) ? esc(String(v(cle)).trim()).replace(/\n/g, '<br>') : `<span class="vide">à compléter</span>`;
  const qr = (l, cle) => `<h3>${l}</h3><p>${t(cle)}</p>`;
  const D = diagnostic(C), P = projetChoisi();
  const choix = Object.keys(DECISIONS).map(id => { const o = DECISIONS[id].options.find(x => x.id === S.choix[id]);
    return `<tr><td>${DECISIONS[id].q}</td><td>${o ? o.l : '<span class="vide">à choisir</span>'}</td><td>${t('j_' + id)}</td></tr>`; }).join('');
  const scenes = Object.keys(SCENES).map(id => { const va = C.variantes[id]; if (!va) return '';
    const rep = va.reps.find(x => x.id === (S.scenes[id] && S.scenes[id][va.id]));
    return `<tr><td>${SCENES[id].titre}</td><td>${va.texte}</td><td>${rep ? rep.l : '<span class="vide">sans réponse</span>'}</td></tr>`; }).join('');
  const jauges = Object.keys(JAUGES).map(k => { const n = niveau(k, C.j[k]); const on = Math.round(C.j[k] / 10);
    return `<div class="jg"><span>${JAUGES[k].l}</span><span class="seg ${n[0]}">${Array.from({ length: 10 }, (_, i) => `<i${i < on ? ' class="on"' : ''}></i>`).join('')}</span><span>${C.j[k]} sur 100, ${n[1]}</span></div>`; }).join('');
  const lj = lignesJournal();
  const journal = lj.filter(l => l.rempli || l.n === 1).map(l => `<tr><td>${l.date ? esc(l.date) : '–'}</td><td>${l.outil ? esc(l.outil) : '–'}</td><td>${l.objectif ? esc(l.objectif) : '<span class="vide">à compléter</span>'}</td><td>${l.consigne ? esc(l.consigne) : '–'}</td><td>${l.resultat ? esc(l.resultat) : '–'}</td><td>${l.decision ? '<b>' + LIB_DECISION[l.decision] + '</b>. ' : ''}${l.pourquoi ? esc(l.pourquoi) : '–'}</td><td>${l.verif ? esc(l.verif) : '–'}</td></tr>`).join('');
  const refs = THEMES_JURIDIQUES.map((th, i) => { const n = i + 1, g = c => rempli('fc' + n + '_' + c) ? esc(v('fc' + n + '_' + c)) : '–';
    return `<tr><td>${th}</td><td>${g('ref')}</td><td>${g('src')}</td><td>${g('date')}</td><td>${LIB_VERDICT[v('fc' + n + '_verdict')] || '–'}</td></tr>`; }).join('');
  const roles = ROLES.map(r => `<tr><td>${r[1]}</td><td>${t(r[0])}</td></tr>`).join('');
  return `<div class="couv"><p>Module « ${CONFIG.module} » – ${CONFIG.formation}</p>
      <h1>Journal de bord IA et dossier – groupe ${rempli('id_groupe') ? esc(String(v('id_groupe')).trim()) : '…'}</h1>
      <p><b>${t('id_nom')}</b> – classe ${esc(nomClasse())} – chantier fictif ${CHANTIER.nom}</p><p>Projet : ${P ? P.t : '<span class="vide">à choisir</span>'}</p>
      <p>Dossier exporté le ${dateFr(new Date())}. Dépôt sur Teams avec le support, au plus tard ${DEPOTL()}.</p></div>
    <h2>1. Le groupe</h2><p><b>Page tenue par.</b> ${t('id_nom')}</p><p><b>Membres.</b> ${t('id_membres')}</p><table><tr><th>Rôle</th><th>Responsable</th></tr>${roles}</table>
    <h2>2. Le projet</h2>${P ? `<p><b>${P.t}.</b> ${P.but}</p><p><b>Livrable minimal.</b> ${P.livrable}</p><p><b>Angle principal.</b> ${P.missions.join(', ')}.</p>` : ''}${rempli('ch_manque') ? qr('Ce qui manque à la fiche du chantier : nos hypothèses', 'ch_manque') : ''}${qr('Plan retenu par le groupe', 'p_plan')}${rempli('p_consigne') ? qr('Consigne de démarrage, améliorée dans l\'entraîneur de prompt', 'p_consigne') : ''}
    <h2>3. Le travail du projet</h2>${travailDossier()}
    <h2>4. Cadrage initial, écrit sans IA le ${t('cad_date')}</h2>${qr('Notre compréhension du problème', 'cad_comprehension')}${qr('Nos hypothèses', 'cad_hypotheses')}${qr('Ce que nous attendons de l\'outil', 'cad_attentes')}
    <h2>5. Journal de bord IA</h2><p>Module TNBIM – groupe ${rempli('id_groupe') ? esc(String(v('id_groupe')).trim()) : '…'} – chantier fictif ${CHANTIER.nom}. Aucune donnée confidentielle ou personnelle.</p>
    <table class="journal"><tr><th>Date</th><th>Outil</th><th>Objectif</th><th>Consigne clé</th><th>Résultat obtenu</th><th>Gardé, modifié ou rejeté, et pourquoi</th><th>Vérification (source consultée, date)</th></tr>${journal}</table>
    <h2>6. Fiche de contrôle des références juridiques</h2><table><tr><th>Thème</th><th>Référence examinée</th><th>Source officielle consultée</th><th>Date</th><th>Verdict</th></tr>${refs}</table>
    <p class="note">${VERIFIE() ? `Repères relus le ${VERIFIE()}.` : `Aucune référence n'est présentée comme vérifiée si la ligne reste vide.`}</p>
    <h2>7. Bilan</h2>${qr('Ce que nous aurions perdu en travaillant sans IA', 'bi_perdu')}${qr('Ce que nous aurions gagné', 'bi_gagne')}${qr('Ce que nous avons volontairement pas confié à l\'outil', 'bi_pasconfie')}
    <h2>8. Nos choix et leurs justifications</h2><table><tr><th>Question</th><th>Notre choix</th><th>Notre justification</th></tr>${choix}</table>
    ${scenes ? `<h3>La scène rencontrée</h3><table><tr><th>Scène</th><th>Situation</th><th>Notre réponse</th></tr>${scenes}</table>` : ''}
    <h2>9. État du projet et diagnostic</h2><div class="jauges">${jauges}</div><h3>${D.titre}</h3>${D.phrases.map(p => `<p>${p}</p>`).join('')}
    ${D.alertes.length ? `<h3>Alertes</h3><ul>${D.alertes.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}<h3>Plan d'action, en trois temps</h3>${D.temps.map(x => `<p class="tt"><b>${x.t}</b></p><ul>${x.a.map(a => `<li>${a}</li>`).join('')}</ul>`).join('')}
    <h3>La question du jury</h3><p>« ${QUESTIONS_JURY[C.faible]} »</p><p>${t('jury_reponse')}</p>
    <h2>Annexes</h2><h3>Plan du support de présentation (dix diapositives au plus)</h3><pre>${esc(texteConsigne('plan_support'))}</pre>
    <h3>Grille de la soutenance (${CONFIG.soutenance.total} minutes par groupe : ${CONFIG.soutenance.expose} d'exposé, ${CONFIG.soutenance.questions} de questions)</h3><table><tr><th>Critère</th><th>Points</th><th>Ce que le jury regarde</th></tr>${GRILLE.map(g => `<tr><td>${g.c}</td><td>${g.pts}</td><td>${g.q}</td></tr>`).join('')}</table>
    <h3>Instructions de mon projet Claude</h3><pre>${esc(texteConsigne('instructions'))}</pre>`;
}
