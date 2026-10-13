/* ───────── Travail des quatre projets : calculs faits par la page, vérifiés à la main par le groupe ───────── */
const PREFIXES = { strategie: 'ps_', chantier: 'pc_', contrats: 'pk_', rh: 'pr_' };
const estP = id => v('pj_choix') === id;
const bornes = (x, a, b) => Math.max(a, Math.min(b, x));
const pct = x => nb(x * 100) + ' %';
const transverse = (cle, aide, req) => champ(cle, `Ce que votre projet apporte aux autres missions du manager`, { type: 'zone', large: true, requis: !!req, aide: `Une phrase par mission : ` + aide + ` Exemple : « Pour la performance financière, notre scénario coûte … et fait gagner … ».`, ex: `Une phrase par mission` });
const forcesFaiblesses = (cle, req) => champ(cle, `Forces et faiblesses de ce que vous proposez`, { type: 'zone', lignes: 4, large: true, requis: !!req, aide: `Deux forces, deux faiblesses, en phrases courtes. Le jury attend les deux : une proposition sans faiblesse n'est pas crédible.`, ex: `Force : …  Force : …  Faiblesse : …  Faiblesse : …` });

/* 1. Stratégie : grille pondérée */
const CRITERES_STRAT = ['Coût de mise en place', 'Délai de mise en place', 'Risque technique et juridique', 'Gain attendu sur le chantier (délais, qualité, sécurité)', 'Compétences à acquérir'];
const EXEMPLES_SCENARIOS = [`Maquette en conception seulement : la maquette sert aux plans, le chantier reste sur papier`, `Maquette partagée jusqu'au chantier : convention BIM, tablettes sur site, réunions sur la maquette`, `Chantier connecté : maquette partagée, capteurs sur les engins et le béton, IA qui alerte sur les écarts`];
function calcStrat() {
  const w = [1, 2, 3, 4, 5].map(i => num('ps_w' + i));
  const noms = [1, 2, 3].map(o => (String(v('ps_opt' + o)).split(/[:(]/)[0].trim().slice(0, 40)) || ('Scénario ' + o));
  const sc = [1, 2, 3].map(o => [1, 2, 3, 4, 5].map(i => num('ps_s' + i + '_' + o)));
  const ok = w.every(x => !isNaN(x) && x >= 0) && sc.every(l => l.every(x => !isNaN(x) && x >= 0 && x <= 10)) && w.reduce((s, x) => s + x, 0) > 0;
  if (!ok) return { ok: false, noms };
  const tot = ww => sc.map(l => l.reduce((s, x, i) => s + x * ww[i], 0) / ww.reduce((s, x) => s + x, 0));
  const t = tot(w), mieux = t.indexOf(Math.max.apply(null, t));
  const sens = [0, 1, 2, 3, 4].map(i => { const ww = w.slice(); ww[i] = ww[i] * 2; const tt = tot(ww); return { crit: CRITERES_STRAT[i], mieux: tt.indexOf(Math.max.apply(null, tt)) }; });
  return { ok: true, noms, t, mieux, sens, ecartPremiers: t.slice().sort((a, b) => b - a) };
}
function sortieStrat() {
  const r = calcStrat();
  if (!r.ok) return `<p class="note">Remplissez les cinq poids (au moins un non nul) et les quinze notes (de 0 à 10) : le calcul s'affiche ici.</p>`;
  const bascule = r.sens.filter(s => s.mieux !== r.mieux);
  return tableau(['Option', 'Note pondérée sur 10'], r.noms.map((n, i) => [esc(n), (i === r.mieux ? '<b>' : '') + nb(r.t[i], 2) + (i === r.mieux ? ' · en tête</b>' : '')]))
    + `<p>${r.ecartPremiers[0] - r.ecartPremiers[1] < 0.5 ? `Les deux premières options sont à moins d'un demi-point : la recommandation est fragile.` : `L'option en tête a plus d'un demi-point d'avance.`}</p>`
    + `<p>${bascule.length ? `Test de sensibilité : en doublant le poids de « ${bascule.map(b => b.crit).join(' », « ')} », une autre option passe en tête. Dites pourquoi vos poids sont justifiés.` : `Test de sensibilité : doubler le poids d'un seul critère ne change pas l'option en tête.`}</p>`;
}
function blocStrategie() {
  const R = estP('strategie'), r = calcStrat();
  const entetes = ['Critère', 'Poids (0 à 10)'].concat(r.noms.map((n, i) => `Note ${esc(n)} (0 à 10)`));
  const lignes = CRITERES_STRAT.map((c, i) => { const n = i + 1;
    return [c, cel('ps_w' + n, { l: 'Poids ' + c, court: true, requis: R })].concat([1, 2, 3].map(o => cel('ps_s' + n + '_' + o, { l: `Note ${c}, ${r.noms[o - 1]}`, court: true, requis: R && o < 3 }))); });
  return bloc(`Ce que vous allez faire ici`, `<p>Un <b>scénario</b> est une façon de numériser le chantier. Vous en décrivez deux ou trois. Puis vous les comparez avec cinq critères, comme on compare trois devis. La page calcule une note par scénario. Vous expliquez ensuite lequel vous recommandez, et pourquoi.</p>
      <p>Trois scénarios possibles, à reprendre ou à remplacer :</p>` + tirets(EXEMPLES_SCENARIOS.map(x => x.replace(/^./, c => c.toLowerCase()))) + `<p class="note">Vous pouvez copier ces exemples dans les champs ci-dessous, puis les adapter. Le troisième scénario est facultatif.</p>`)
    + etape('ps_cadre', `Décrivez vos scénarios`, '30 min', `<p>Un scénario tient en une phrase : ce que l'on met en place, et jusqu'où. Donnez-lui un nom court, il servira de titre de colonne dans la grille.</p>
      <div class="champs">${champ('ps_opt1', `Scénario 1 (nom court et description)`, { requis: R, sansMention: true, large: true, ex: EXEMPLES_SCENARIOS[0] })}${champ('ps_opt2', `Scénario 2`, { requis: R, sansMention: true, large: true, ex: EXEMPLES_SCENARIOS[1] })}${champ('ps_opt3', `Scénario 3 (facultatif)`, { sansMention: true, large: true, ex: EXEMPLES_SCENARIOS[2] })}
      ${champ('ps_hyp', `Vos hypothèses chiffrées, avec leurs sources`, { type: 'zone', lignes: 5, large: true, requis: R, sansMention: true, ex: `Scénario 2 : licence et formation environ … € (source : …, consultée le …). Scénario 3 : capteurs … € (hypothèse du groupe).`, aide: `Un ordre de grandeur par scénario, au moins pour le coût et le délai. Chaque chiffre cite une source ouverte et sa date. Sans source, écrivez « hypothèse du groupe » : c'est permis, à condition de le dire.` })}</div>` + consigne('travail_strategie', `Consigne pour critiquer vos scénarios et vos critères`))
    + etape('ps_grille', `Notez et pondérez`, '45 min', `<p><b>Le poids</b> dit l'importance du critère pour Rive Nord : 10 pour ce qui compte le plus, 0 pour ce qui ne compte pas. <b>La note</b> dit si le scénario est bon sur ce critère : 10 pour excellent, 0 pour mauvais. Attention : pour le coût, le délai et le risque, un scénario peu coûteux, rapide ou peu risqué reçoit une note élevée.</p>
      <p>Les colonnes portent les noms de vos scénarios. La page calcule la note pondérée : somme des notes multipliées par les poids, divisée par la somme des poids.</p>`
      + tableau(entetes, lignes) + `<div data-calc="strat"></div>`
      + `<div class="champs">${champ('ps_verif', `Calcul refait à la main, pour un scénario`, { type: 'zone', large: true, requis: R, sansMention: true, ex: `Scénario 1 : (7×3 + 5×2 + …) / (3 + 2 + …) = …`, aide: `Écrivez le calcul complet d'un scénario. Si vous ne trouvez pas le même résultat que la page, cherchez l'erreur : c'est ce que le jury demandera.` })}</div>`)
    + etape('ps_reco', `Recommandez`, '30 min', `<p>Votre recommandation sera la <b>page la plus lue de votre dossier</b> et la diapositive principale de l'oral. Elle tient en cinq à dix lignes, dans cet ordre : le scénario retenu ; les deux chiffres de la grille qui le justifient ; ce que ce scénario coûte ou impose ; ce qu'il faut vérifier avant de décider.</p>
      <div class="champs">${champ('ps_reco', `Recommandation argumentée (cinq à dix lignes)`, { type: 'zone', lignes: 6, large: true, requis: R, sansMention: true, ex: `Nous recommandons le scénario … Il obtient … sur 10, contre … pour … Il demande … Avant de décider, il faut vérifier …` })}
      ${forcesFaiblesses('ps_ff', R)}
      ${champ('ps_limites', `Ce qui ferait changer d'avis`, { type: 'zone', large: true, requis: R, sansMention: true, ex: `Si le coût réel dépassait … ou si l'équipe n'était pas formée avant …`, aide: `Le test de sensibilité de la grille vous aide : quel critère, s'il pesait plus lourd, changerait le classement ?` })}
      ${transverse('ps_trans', `performance financière, gestion contractuelle, pilotage, management RH.`, R)}</div>`);
}

/* 2. Suivi de chantier : valeur acquise simplifiée */
function lignesSuivi() {
  const m = num('pc_mois');
  return CHANTIER.lots.map(l => {
    const av = num('pc_av' + l[0]) / 100, dep = num('pc_dep' + l[0]);
    const prevu = isNaN(m) ? NaN : bornes((m - l[5]) / l[6], 0, 1);
    const pv = prevu * l[3], ev = av * l[3];
    return { n: l[0], lot: l[1], budget: l[3], av, dep, prevu, pv, ev, spi: pv > 0 ? ev / pv : NaN, cpi: dep > 0 ? ev / dep : NaN, ok: !isNaN(av) && !isNaN(dep) && !isNaN(prevu) };
  });
}
function sortieSuivi() {
  const L = lignesSuivi().filter(x => x.ok);
  if (isNaN(num('pc_mois'))) return `<p class="note">Indiquez d'abord le mois de suivi (de 1 à ${CHANTIER.duree}).</p>`;
  if (!L.length) return `<p class="note">Renseignez l'avancement réel (en %) et le montant dépensé (en €) d'au moins un lot.</p>`;
  const tot = L.reduce((s, x) => ({ pv: s.pv + x.pv, ev: s.ev + x.ev, ac: s.ac + x.dep }), { pv: 0, ev: 0, ac: 0 });
  const stat = x => (x.spi < 0.9 || x.cpi < 0.9) ? (x.spi < 0.9 && x.cpi < 0.9 ? 'retard et dépassement' : x.spi < 0.9 ? 'en retard' : 'coût dépassé') : 'dans la cible';
  return tableau(['Lot', 'Prévu (linéaire)', 'Réel', 'Valeur prévue', 'Valeur acquise', 'Dépensé', 'Délai (SPI)', 'Coût (CPI)', 'Lecture'],
      L.map(x => [`${x.n}. ${x.lot}`, pct(x.prevu), pct(x.av), eur(x.pv), eur(x.ev), eur(x.dep), nb(x.spi, 2), nb(x.cpi, 2), stat(x)])
        .concat([['<b>Ensemble des lots saisis</b>', '', '', `<b>${eur(tot.pv)}</b>`, `<b>${eur(tot.ev)}</b>`, `<b>${eur(tot.ac)}</b>`, `<b>${nb(tot.ev / tot.pv, 2)}</b>`, `<b>${nb(tot.ev / tot.ac, 2)}</b>`, '']]))
    + `<p class="note">Lecture : un indice inférieur à 0,9 signale un écart. Délai (SPI) = valeur acquise divisée par valeur prévue. Coût (CPI) = valeur acquise divisée par dépensé. L'avancement prévu est supposé linéaire sur la durée du lot : c'est une hypothèse simplificatrice, à discuter.</p>`;
}
function blocChantier() {
  const R = estP('chantier');
  const lignes = CHANTIER.lots.map(l => [`${l[0]}. ${l[1]}`, eur(l[3]), `mois ${l[5]} à ${l[5] + l[6]}`, cel('pc_av' + l[0], { l: `Avancement réel lot ${l[0]}`, court: true }), cel('pc_dep' + l[0], { l: `Dépensé lot ${l[0]}`, court: true })]);
  return bloc(`Ce que vous allez faire ici`, `<p>Un chantier numérisé produit des données chaque jour : avancement pointé sur la maquette, heures des équipes, livraisons, mesures des capteurs. Vous construisez le tableau de bord qu'un manager de projets lirait avec ces données : pour chaque lot, où en est-on par rapport au prévu, et combien a-t-on dépensé.</p>
      <p>Le chantier Rive Nord est fictif : il n'a pas de relevé réel. Vous <b>inventez un point d'avancement plausible</b>, à un mois donné, pour au moins quatre lots. La page calcule les écarts. Vous dites ensuite d'où ces données viendraient dans un vrai chantier numérisé, et ce que cela change par rapport au suivi sur papier.</p>`)
    + etape('pc_donnees', `Inventez les données de suivi`, '30 min', `<p>Choisissez un mois entre 1 et ${CHANTIER.duree}. Pour chaque lot en cours à ce mois, décidez un avancement réel et un montant dépensé. Faites des choix variés : un lot en avance, un lot en retard, un lot qui dépasse son budget. Écrivez vos règles d'invention : elles font partie de l'exercice et le jury les lira.</p>
      <div class="champs">${champ('pc_mois', `Mois de suivi (1 à ${CHANTIER.duree})`, { requis: R, sansMention: true, ex: '9' })}${champ('pc_regles', `Comment avons-nous inventé ces données ?`, { type: 'zone', large: true, requis: R, sansMention: true, ex: `Lot 2 : retard de deux mois à cause du manque de grutiers, dépenses au rythme prévu. Lot 1 : terminé, dépassement de 13 % à cause du réseau enterré.` })}
      ${champ('pc_sources', `D'où viendraient ces données dans un chantier numérisé ?`, { type: 'zone', large: true, requis: R, sansMention: true, ex: `Avancement : pointage sur la maquette par le chef de chantier chaque vendredi. Dépenses : factures validées dans le logiciel de gestion. Heures : badgeuse de chantier.`, aide: `Une source par type de donnée. C'est le cœur du lien avec la transition numérique.` })}</div>` + consigne('travail_chantier', `Consigne pour construire des données plausibles`))
    + etape('pc_suivi', `Tableau de bord des écarts`, '45 min', `<p>Saisissez l'avancement réel en pourcentage (0 à 100) et le montant déjà dépensé en euros, lot par lot.</p>`
      + tableau(['Lot', 'Budget', 'Période prévue', 'Avancement réel (%)', 'Dépensé (€)'], lignes) + `<div data-calc="chantier"></div>
      <div class="champs">${champ('pc_verif', `Calcul refait à la main sur un lot`, { type: 'zone', large: true, requis: R, sansMention: true })}</div>`)
    + etape('pc_actions', `Actions correctives et apport du numérique`, '40 min', `<p>Reprenez un aléa du chantier et traitez-le : quelles actions, qui les porte, sous quel délai. Puis dites ce que le tableau de bord numérique change par rapport au suivi sur papier.</p><div class="champs">
      ${champ('pc_alea', `Aléa traité`, { type: 'liste', options: CHANTIER.aleas.map((a, i) => [String(i + 1), a]), requis: R, sansMention: true })}
      ${champ('pc_indic', `Trois indicateurs clés retenus, et pourquoi`, { type: 'zone', large: true, requis: R, sansMention: true })}
      ${champ('pc_actions', `Actions correctives, responsables, délais`, { type: 'zone', lignes: 4, large: true, requis: R, sansMention: true, ex: `Action 1 : … Responsable : … Délai : …` })}
      ${champ('pc_numerique', `Ce que le numérique change par rapport au suivi sur papier`, { type: 'zone', lignes: 3, large: true, requis: R, sansMention: true, ex: `Écart connu le vendredi au lieu de la fin du mois. Mais : il faut que le chef de chantier pointe vraiment, et que les factures soient saisies à temps.` })}
      ${forcesFaiblesses('pc_ff', R)}
      ${transverse('pc_trans', `stratégie, gestion contractuelle, management RH.`, R)}</div>`);
}

/* 3. Veille contractuelle : fiches */
const CAS_VEILLE = [
  `Convention BIM : une erreur dans la maquette partagée fait percer un mur porteur au mauvais endroit. Qui est responsable ?`,
  `Propriété de la maquette : après la réception, le maître d'ouvrage veut réutiliser la maquette pour l'exploitation. Qui la possède, qui peut la modifier ?`,
  `Mise à jour de la maquette : le bureau d'études change le plan de réservations des fluides. Qui paie les reprises sur le chantier ?`,
  `Chantier connecté : badges, caméras et capteurs sur les engins. Quelles données personnelles, quelles obligations envers les salariés ?`,
  `Pièces contractuelles rédigées avec une IA générative : un avenant est écrit par Claude. Qui vérifie, qui engage l'entreprise ?`,
  `Cybersécurité : la plateforme qui héberge la maquette est attaquée et le chantier s'arrête deux jours. Quelles obligations, quels recours ?`
];
function blocContrats() {
  const R = estP('contrats');
  const fiches = [1, 2, 3, 4].map(n => {
    const k = c => 'ck' + n + '_' + c, req = R && n <= 2;
    return `<section class="bloc ligne-journal"><h3>Fiche de veille ${n}</h3><div class="champs">
      ${champ(k('cas'), `Cas du chantier`, { type: 'liste', options: CAS_VEILLE.map((c, i) => [String(i + 1), c]), requis: req, sansMention: true, large: true })}
      ${champ(k('risque'), `Le risque, et pour qui`, { type: 'zone', lignes: 2, large: true, requis: req, sansMention: true })}
      ${champ(k('ref'), `Référence examinée`, { requis: req, sansMention: true })}${champ(k('src'), `Source officielle consultée`, { requis: req, sansMention: true })}
      ${champ(k('date'), `Date de consultation`, { requis: req, sansMention: true })}${champ(k('statut'), `Statut`, { type: 'liste', options: [['verifie', 'Vérifié sur la source officielle'], ['averifier', 'À vérifier']], requis: req, sansMention: true })}
      ${champ(k('action'), `Ce que fait le manager de projets`, { type: 'zone', lignes: 2, large: true, requis: req, sansMention: true })}</div></section>`; }).join('');
  return bloc(`Ce que vous allez faire ici`, `<p>Le numérique ajoute des risques juridiques au chantier : qui est responsable d'une erreur dans la maquette, à qui appartient la maquette, que deviennent les données des salariés d'un chantier connecté, qui engage l'entreprise quand une IA rédige un document. Vous traitez ces cas un par un, comme un manager de projets qui prépare une réunion avec son juriste.</p>
      <p>Pour chaque cas, vous cherchez la <b>référence officielle</b> qui s'applique : un texte sur Légifrance, une fiche de la CNIL, un règlement sur EUR-Lex. Claude vous donne des pistes, parfois fausses. Vous ouvrez la source, vous notez la date, et vous écrivez ce que fait le manager.</p>`)
    + etape('pk_cadre', `Décrivez le cadre contractuel`, '30 min', `<p>Le chantier fictif n'a pas de contrat réel. Décrivez en quelques lignes les documents que vous supposez : un marché privé de travaux par lot, un cahier des charges, une convention BIM. Puis dites ce que vous savez du cadre qui s'applique, et ce qu'il faudra vérifier.</p>
      <div class="champs">${champ('pk_docs', `Documents contractuels supposés`, { type: 'zone', large: true, requis: R, sansMention: true })}
      ${champ('pk_cadre', `Cadre applicable (marché privé ou public, norme, cahier des clauses) : ce que vous savez, ce qu'il faut vérifier`, { type: 'zone', large: true, requis: R, sansMention: true })}</div>` + consigne('travail_contrats', `Consigne pour lister les clauses sensibles`))
    + etape('pk_fiches', `Fiches de veille`, '60 min', `<p>Une fiche par cas. Au moins deux fiches complètes. Une fiche « vérifié » indique la source officielle ouverte et sa date. Sinon, elle reste « à vérifier ».</p>` + fiches)
    + etape('pk_reco', `Synthèse`, '20 min', `<p>Trois points de vigilance : ce qu'un manager de projets doit faire avant de numériser le chantier, en une phrase chacun. Ils iront dans le dossier et sur la diapositive principale.</p><div class="champs">${champ('pk_synthese', `Les trois points de vigilance du manager de projets`, { type: 'zone', lignes: 4, large: true, requis: R, sansMention: true, ex: `1. Signer la convention BIM avant … 2. Informer les salariés de … 3. Faire relire par … tout document rédigé avec une IA.` })}
      ${forcesFaiblesses('pk_ff', R)}
      ${transverse('pk_trans', `stratégie, performance financière, pilotage, management RH.`, R)}</div>`);
}

/* 4. Planning des équipes */
function effectifsMois() {
  return Array.from({ length: CHANTIER.duree }, (_, i) => { const m = i + 1; let tot = 0; const actifs = [];
    CHANTIER.lots.forEach(l => { if (m > l[5] && m <= l[5] + l[6]) { tot += l[4]; actifs.push(l[0]); } });
    return { m, tot, actifs }; });
}
function sortiePlanning() {
  const E = effectifsMois(), pic = E.reduce((a, b) => b.tot > a.tot ? b : a), dispo = num('pr_dispo'), max = pic.tot;
  const barres = E.map(e => `<div class="mois"><span class="m">${dateMois(e.m - 1).replace(' 20', ' ’')}</span><span class="b"><i style="width:${Math.round(e.tot / max * 100)}%"${!isNaN(dispo) && e.tot > dispo ? ' class="sur"' : ''}></i></span><span class="n">${e.tot}</span></div>`).join('');
  const moy = E.reduce((s, e) => s + e.tot, 0) / E.length;
  const sur = isNaN(dispo) ? [] : E.filter(e => e.tot > dispo);
  return `<div class="mois-liste">${barres}</div><p>Pointe : <b>${pic.tot} personnes</b> au mois ${pic.m} (${dateMois(pic.m - 1)}), lots ${pic.actifs.join(', ')}. Moyenne : ${nb(moy, 1)} personnes. Hypothèse : chaque lot emploie son effectif maximal pendant toute sa durée, ce qui surestime la charge.</p>`
    + (isNaN(dispo) ? '' : `<p>${sur.length ? `Avec ${dispo} personnes disponibles, ${sur.length} mois dépassent la capacité (du mois ${sur[0].m} au mois ${sur[sur.length - 1].m}).` : `Avec ${dispo} personnes disponibles, aucun mois ne dépasse la capacité.`}</p>`);
}
function blocRh() {
  const R = estP('rh');
  const comp = [1, 2, 3, 4].map(n => [cel('rc' + n + '_nom', { l: 'Compétence', court: true }), cel('rc' + n + '_lots', { l: 'Lots ou métiers concernés', court: true }), cel('rc' + n + '_besoin', { l: 'Besoin et moment', court: true }), cel('rc' + n + '_mesure', { l: 'Mesure : recruter, former, sous-traiter' })]);
  return bloc(`Ce que vous allez faire ici`, `<p>Numériser un chantier change les métiers : le conducteur de travaux lit la maquette sur une tablette, un coordinateur BIM fait vivre la maquette, quelqu'un répond des données. Vous lisez d'abord la charge des équipes sur les ${CHANTIER.duree} mois, pour voir quand le chantier est le plus tendu. Puis vous dites quelles <b>compétences numériques</b> manquent, pour quels métiers, et comment les obtenir : recruter, former ou sous-traiter, avec un coût et un délai.</p>
      <p class="note">Aucune donnée sur de vraies personnes : vous raisonnez par métier et par compétence.</p>`)
    + etape('pr_planning', `Lisez la charge d'ensemble`, '30 min', `<p>La page additionne les effectifs maximaux des onze lots, mois par mois. Indiquez combien de personnes votre entreprise peut mobiliser en même temps : la page signale les mois en dépassement. Ces pointes sont les moments où former quelqu'un est le plus difficile.</p>
      <div class="champs">${champ('pr_dispo', `Personnes mobilisables en même temps`, { requis: R, sansMention: true, ex: '120' })}</div><div data-calc="rh"></div>` + consigne('travail_rh', `Consigne pour critiquer le planning`)
      + `<div class="champs">${champ('pr_lecture', `Notre lecture : pointes, creux, lots qui se chevauchent`, { type: 'zone', large: true, requis: R, sansMention: true })}
      ${champ('pr_verif', `Calcul refait à la main (un mois)`, { type: 'zone', large: true, requis: R, sansMention: true })}</div>`)
    + etape('pr_comp', `Compétences numériques et mesures`, '45 min', `<p>Au moins deux compétences, une par ligne. Exemples : coordination BIM (faire vivre la maquette, tous lots, dès le mois 0) ; lecture de la maquette sur tablette (chefs de chantier des lots 2, 4, 7, 8, dès le mois 3) ; gestion des données du chantier (pointages, capteurs, du mois 0 à la réception). Pour chacune, une mesure : recruter, former ou sous-traiter.</p>`
      + tableau(['Compétence', 'Lots ou métiers concernés', 'Besoin et moment', 'Mesure'], comp)
      + `<div class="champs">${champ('pr_mesures', `Trois mesures de gestion des ressources humaines, avec leur coût et leur délai`, { type: 'zone', lignes: 4, large: true, requis: R, sansMention: true, ex: `1. Former les quatre chefs de chantier à la lecture de la maquette : 2 jours chacun, environ … € (source : …), avant le mois 3. 2. … 3. …`, aide: `Un coût et un délai par mesure. Sans source, écrivez « hypothèse du groupe ».` })}
      ${champ('pr_metiers', `Ce qui change dans les métiers du chantier`, { type: 'zone', lignes: 3, large: true, requis: R, sansMention: true, ex: `Le conducteur de travaux passe … heures par semaine sur la maquette au lieu de … Le chef de chantier pointe l'avancement sur tablette. Un nouveau rôle apparaît : …` })}
      ${forcesFaiblesses('pr_ff', R)}
      ${transverse('pr_trans', `stratégie, performance financière, gestion contractuelle.`, R)}</div>`);
}

function projetTravail() {
  const blocs = { strategie: blocStrategie(), chantier: blocChantier(), contrats: blocContrats(), rh: blocRh() };
  const P = projetChoisi();
  if (!P) return bloc(`Choisissez d'abord un projet`, `<p class="verrou">Cette étape s'ouvre quand le groupe a choisi son projet, à l'étape précédente.</p>`);
  return `<p class="note" style="margin-bottom:12px">Projet choisi : <b>${P.t}</b>. ${P.but}</p>` + blocs[P.id];
}
function majCalculs() {
  document.querySelectorAll('[data-calc]').forEach(z => {
    const k = z.getAttribute('data-calc');
    z.innerHTML = k === 'strat' ? sortieStrat() : k === 'chantier' ? sortieSuivi() : k === 'rh' ? sortiePlanning() : '';
    typoNoeuds(z);
  });
}

/* Résumés pour le support et le dossier */
function resultatCle() {
  const p = v('pj_choix');
  if (p === 'strategie') { const r = calcStrat(); return r.ok ? `Option en tête : ${r.noms[r.mieux]} (${nb(r.t[r.mieux], 2)} sur 10).` : ''; }
  if (p === 'chantier') { const L = lignesSuivi().filter(x => x.ok); if (!L.length) return ''; const e = L.filter(x => x.spi < 0.9 || x.cpi < 0.9).length; return `${L.length} lots suivis, ${e} en écart.`; }
  if (p === 'contrats') { const f = [1, 2, 3, 4].filter(n => rempli('ck' + n + '_cas')); const ver = f.filter(n => v('ck' + n + '_statut') === 'verifie').length; return `${f.length} fiches de veille, ${ver} vérifiées sur source officielle.`; }
  if (p === 'rh') { const E = effectifsMois(), pic = E.reduce((a, b) => b.tot > a.tot ? b : a); return `Pointe de ${pic.tot} personnes au mois ${pic.m}.`; }
  return '';
}
function planSupport() {
  const P = projetChoisi(), lj = lignesJournal().filter(l => l.rempli), rej = lj.filter(l => l.decision === 'rejete' || l.decision === 'modifie').length;
  const ver = THEMES_JURIDIQUES.filter((t, i) => v('fc' + (i + 1) + '_verdict')).length;
  const n = (cle, d) => rempli(cle) ? String(v(cle)).trim() : (d || VIDE);
  const S = [
    [`Titre`, `${P ? P.t : VIDE}. Groupe ${rempli('id_groupe') ? v('id_groupe') : VIDE}, classe ${nomClasse()}${dateChamp('id_seance2') ? ', ' + S2L() : ''}. Membres : ${ou('id_membres').replace(/\n+/g, ', ')}.`],
    [`Le chantier et la mission`, `Rive Nord (fictif) : ${nb(CHANTIER.surface)} m², ${eur(CHANTIER.budget)} HT, ${CHANTIER.duree} mois. Missions couvertes : ${P ? P.missions.join(', ') : VIDE}.`],
    [`Le problème et notre cadrage`, n('cad_comprehension')],
    [`Notre méthode`, n('p_plan')],
    [`Le résultat principal`, resultatCle() || VIDE],
    [`La mise en œuvre : contrôles, tests, modifications`, `Ce que nous avons vérifié à la main : ` + n(P ? ({ strategie: 'ps_verif', chantier: 'pc_verif', contrats: 'pk_synthese', rh: 'pr_verif' })[P.id] : 'p_plan') + ` Les modifications importantes en cours de route : ` + (lj.filter(l => l.decision === 'modifie').map(l => l.objectif).filter(Boolean).join(' ; ') || VIDE) + `.`],
    [`L'usage de l'IA`, `${lj.length} usage${lj.length > 1 ? 's' : ''} tracé${lj.length > 1 ? 's' : ''} dans le journal, dont ${rej} gardé${rej > 1 ? 's' : ''} après modification ou rejeté${rej > 1 ? 's' : ''}. Source : journal de bord, ${dateFr(new Date())}.`],
    [`Les références juridiques`, `${ver} thème${ver > 1 ? 's' : ''} sur ${THEMES_JURIDIQUES.length} avec verdict (fiche de contrôle). Citez la source officielle et la date de consultation pour chaque référence.`],
    [`Limites, contraintes, forces et faiblesses`, n(P ? ({ strategie: 'ps_ff', chantier: 'pc_ff', contrats: 'pk_ff', rh: 'pr_ff' })[P.id] : 'bi_pasconfie') + ` Non confié à l'IA : ` + n('bi_pasconfie')],
    [`La suite et les questions`, n('bi_gagne')]
  ];
  return S;
}
Object.assign(CONSIGNES, {
  plan_support: () => [planSupport().map((s, i) => `Diapositive ${i + 1} – ${s[0]}\n${s[1]}`).join('\n\n')],
  travail_strategie: () => [`Nous comparons des scénarios de transition numérique pour le chantier fictif Rive Nord : ${ou('ps_opt1')} ; ${ou('ps_opt2')}${rempli('ps_opt3') ? ' ; ' + v('ps_opt3') : ''}.
Critères actuels : ${CRITERES_STRAT.join(' ; ')}.

Critique ces scénarios et ces critères : lesquels manquent, lesquels se recoupent, lesquels sont mesurables ? Pour chaque ordre de grandeur de coût ou de délai que tu avances, dis d'où il vient, ton niveau de certitude, et où nous pourrions le vérifier. Ne choisis pas à notre place.`],
  travail_chantier: () => [`Nous inventons un point d'avancement pour le chantier fictif Rive Nord au mois ${ou('pc_mois')}. Propose-nous des règles pour produire des avancements et des dépenses plausibles pour quatre lots au moins, avec des écarts crédibles (un lot en retard, un lot qui dépasse son budget). Explique chaque règle. Nous saisirons les chiffres nous-mêmes.`],
  travail_contrats: () => [`Nous faisons la veille juridique de la transition numérique du chantier fictif Rive Nord. Voici les cas à étudier :
${CAS_VEILLE.map((c, i) => (i + 1) + '. ' + c).join('\n')}

Pour chaque cas, dis quel type de clause ou de texte s'applique et ce qu'un manager de projets doit demander à la maîtrise d'œuvre, à l'entreprise ou au juriste. Pour toute référence juridique, donne le nom exact du texte, marque ton niveau de certitude et écris « à vérifier » quand tu n'es pas sûr. Nous ouvrirons chaque source officielle.`],
  travail_rh: () => [`Voici le planning de charge du chantier fictif Rive Nord, calculé en additionnant les effectifs maximaux des onze lots. Il surestime la charge, car chaque lot n'emploie pas son maximum pendant toute sa durée.

Pointes et creux : ${effectifsMois().map(e => `mois ${e.m} : ${e.tot}`).join(' ; ')}.

Critique cette hypothèse. Propose trois façons de lisser la charge, puis trois compétences numériques (maquette, données, outils de chantier) que l'entreprise devra acquérir, avec pour chacune un moyen : recruter, former ou sous-traiter. Dis ce que tu supposes. N'invente aucune donnée sur de vraies personnes.`]
});
