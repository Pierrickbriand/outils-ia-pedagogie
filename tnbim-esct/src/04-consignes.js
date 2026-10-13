/* ───────── Consignes à copier dans Claude ───────── */
const groupe = () => rempli('id_groupe') ? 'G' + String(v('id_groupe')).trim().replace(/^g/i, '') : VIDE;
const projetChoisi = () => PROJETS.find(p => p.id === v('pj_choix'));
const libChoix = id => { const o = DECISIONS[id].options.find(x => x.id === S.choix[id]); return o ? o.l : VIDE; };

/* Textes par défaut des instructions : les accolades signalent ce que l'étudiant remplace */
const DEF_TRAVAIL = `Nous sommes {nombre} étudiants en Manager de projets BTP, en alternance chez {type d'entreprise : maîtrise d'œuvre, entreprise générale, bureau d'études}. Nous écrivons pour un jury de professionnels du BTP. Si notre demande est floue, pose-nous une question avant de produire. Signale-nous les erreurs et les points douteux. Ton direct, précis, sans flatterie. Ne reformule pas notre question.`;
const DEF_JAMAIS = `Inventer un chiffre, une norme ou un article de loi. Remplacer notre cadrage par le tien. Utiliser des données de {notre entreprise ou nos vrais chantiers}. Terminer ta réponse par une offre d'aide générique. Employer les mots {« innovant », « révolutionnaire »} sans preuve.`;
const FORMATS = {
  prose: `Réponds en prose courte : pas de tableau ni de longue liste, sauf si nous le demandons.`,
  listes: `Réponds par des listes courtes : une idée par ligne, introduite par deux-points.`,
  tableau: `Quand tu compares des options, utilise un tableau. Sinon, réponds en prose courte.`,
  etapes: `Réponds par étapes numérotées : une action par étape, dans l'ordre où nous la ferons.`
};
const LIB_FORMATS = [['prose', 'Prose courte, pas de tableau ni de longue liste'], ['listes', 'Listes courtes, une idée par ligne'], ['tableau', 'Tableau pour comparer, prose sinon'], ['etapes', 'Étapes numérotées, une action par étape']];
function ficheChantierTexte() {
  const C = CHANTIER, lots = C.lots;
  const lignes = lots.map(l => `${l[0]}. ${l[1]} – ${l[2]} – ${nb(l[3])} € HT – effectif maximal ${l[4]} – début au mois ${l[5]} après l'ordre de service, durée ${l[6]} mois`).join('\n');
  const jal = C.jalons.map(j => `– ${j[0]} : mois ${j[1]} (${dateMois(j[1])})`).join('\n');
  return `FICHE DU CHANTIER FICTIF « ${C.nom.toUpperCase()} »
Chantier entièrement fictif, commun à tous les groupes du module « ${CONFIG.module} ». Aucune donnée réelle.

Opération : ${C.resume}
Surface de plancher : ${nb(C.surface)} m²
Budget des travaux : ${nb(C.budget)} € HT
Durée : ${C.duree} mois à partir de l'ordre de service du ${dLong(C.os)} (date fictive)
Maître d'ouvrage : ${C.moa}
Maîtrise d'œuvre : ${C.moe}
Maquette numérique : ${C.bim}

LOTS (marchés privés, entreprises fictives)
${lignes}

JALONS
${jal}

ALÉAS POSSIBLES (à traiter selon le projet du groupe)
${C.aleas.map(a => '– ' + a).join('\n')}

RÈGLE DE TRAVAIL : si une donnée manque, dis-le et propose une hypothèse que je pourrai valider. N'invente jamais un chiffre présenté comme un fait.`;
}
function ficheChantierCsv() {
  const q = x => '"' + String(x).replace(/"/g, '""') + '"';
  return ['lot;intitule;entreprise_fictive;montant_ht_eur;effectif_max;debut_mois;duree_mois']
    .concat(CHANTIER.lots.map(l => [l[0], q(l[1]), q(l[2]), l[3], l[4], l[5], l[6]].join(';'))).join('\n');
}

Object.assign(CONSIGNES, {
  instructions: () => {
    const m = [];
    if (estCoche('ip_questions', true)) m.push(`Pose-nous au plus trois questions avant de produire quoi que ce soit.`);
    if (estCoche('ip_plan', true)) m.push(`Propose un plan court avant de rédiger ou de calculer, et attends notre accord.`);
    if (estCoche('ip_sources', true)) m.push(`Pour toute référence juridique ou technique, donne le nom exact du texte et dis si tu es sûr de son existence. Si tu n'es pas sûr, écris « à vérifier ».`);
    if (estCoche('ip_doutes', true)) m.push(`Signale tes doutes et les calculs que nous devons refaire à la main.`);
    if (estCoche('ip_change', true)) m.push(`Après chaque modification, dis en une phrase ce qui a changé.`);
    if (estCoche('ip_contredire', true)) m.push(`Contredis-nous quand notre idée est trop large ou risquée.`);
    return [`Tu es l'assistant ${rempli('id_nom') ? 'de ' + v('id_nom').trim() + ', membre du' : 'd\'un membre du'} groupe ${groupe()}, étudiants de la formation « ${CONFIG.formation} ». Le module s'appelle « ${CONFIG.module} ». Chaque membre du groupe a son propre projet Claude, avec ces mêmes instructions.

NOTRE PROJET
Nous travaillons sur le chantier fictif « ${CHANTIER.nom} » (fiche dans les fichiers du projet). Projet choisi : ${projetChoisi() ? projetChoisi().t : `le groupe vous l'indiquera dans la première conversation`}.
Le module porte sur la transition numérique du BTP : stratégie, benchmarking, cadre juridique, organisation. Nous produisons un dossier, un support de présentation d'au plus dix diapositives et un journal de bord où nous traçons chaque usage de l'IA.

TA MÉTHODE
${m.map(x => '– ' + x).join('\n')}

GARDE-FOUS
– Travaille uniquement sur le chantier fictif. Si nous collons des données qui semblent réelles (noms, adresses, prix d'un vrai marché), arrête-toi et préviens-nous.
– Ne présente jamais une estimation comme un fait. Dis ce que tu supposes.
– Ne cite jamais un article de loi de mémoire sans le marquer « à vérifier » : nous ouvrirons la source officielle.
– Ne fais jamais ceci : ${ou('ip_jamais', DEF_JAMAIS)}

STYLE
– Réponds en français, en phrases de vingt mots au plus, à la voix active, avec le vouvoiement.
– ${FORMATS[v('ip_format')] || FORMATS.prose}
– Guillemets français « », espace avant : ; ! ?, nombres avec espace des milliers (1 000) et virgule décimale (3,14), espace avant % et €.
– Notre façon de travailler : ${ou('ip_travail', DEF_TRAVAIL)}`];
  },
  test_instructions: () => [`Avant de commencer, réponds point par point, en une ligne chacun.
1. Quel est ton rôle dans ce projet, et pour qui travailles-tu ?
2. Sur quel chantier travaillons-nous ? Donne sa surface, son budget et sa durée.
3. Que fais-tu quand nous te demandons un article de loi ou une norme ?
4. Que fais-tu si une donnée manque pour répondre ?
5. Que refuses-tu de faire ?
6. Quel format de réponse devons-nous attendre de toi ?
7. Nous tutoies-tu ou nous vouvoies-tu ?
8. Cite un risque de notre projet que tu vois déjà, et dis ce que tu supposes pour l'affirmer.`],
  fiche_chantier: () => [ficheChantierTexte()],
  cadrage_ia: () => [`Voici notre cadrage initial, écrit sans toi avant notre premier échange.

Notre compréhension du problème : ${ou('cad_comprehension')}
Nos hypothèses : ${ou('cad_hypotheses')}
Ce que nous attendons de l'outil : ${ou('cad_attentes')}

Compare-le à ce que tu aurais proposé. Dis-nous ce que nous avons oublié, ce qui est discutable, et ce que tu ne sais pas. Ne réécris pas notre cadrage.`],
  demarrage: () => {
    const p = projetChoisi();
    if (!p) return [`Choisissez d'abord un projet, juste au-dessus.`];
    return [`Nous démarrons le projet « ${p.t} » sur le chantier Rive Nord.

Objectif : ${p.but}
Livrable minimal : ${p.livrable}
Missions couvertes : ${p.missions.join(', ')}.

Avant de produire quoi que ce soit, pose-nous au plus trois questions. Puis propose un plan court en cinq étapes, avec pour chacune ce que nous vérifions à la main. Indique les points où tu manques d'information.`];
  },
  verif_refs: () => [`Pour le thème « ${ou('vr_theme', 'à choisir')} », liste les références juridiques ou techniques qui s'appliquent à notre chantier Rive Nord.

Pour chaque référence : le nom exact du texte, ce qu'il règle en deux lignes, et ton niveau de certitude (sûr, probable, incertain). Ne cite aucun numéro d'article dont tu n'es pas sûr. Nous ouvrirons chaque source officielle et nous noterons notre verdict.`]
});

function cahierChantierMd() { return typo('# Fiche du chantier fictif Rive Nord\n\n' + ficheChantierTexte().replace(/^FICHE DU CHANTIER FICTIF.*\n/, '')); }
function texteConsigne(id) {
  const r = CONSIGNES[id]();
  return typo(r[0]) + (r[1] ? '\n' + r[1] : '');
}
