/* ───────── Données du parcours ───────── */
const APP = { id: 'tnbim-esct', version: 1 };
const CLE = 'tnbim-esct-v1';

/* ───────── RÉGLAGES DU MODULE : seul bloc à modifier chaque année ─────────
   Dates au format AAAA-MM-JJ. Tous les textes de l'application s'en déduisent.
   nbGroupes : nombre de groupes par classe (simple aide à la saisie).
   soutenance : minutes par groupe, exposé puis questions.
   Les dates des sessions ne sont pas dans ce bloc : chaque étudiant les saisit à la page « Départ ». Le dépôt se fait la veille de la dernière session, sans date affichée.
   verifieLe : laisse vide tant que tu n'as pas relu les références juridiques sur les sources officielles.
   Les repères juridiques ne se mettent pas à jour tout seuls : relis-les, puis écris la date. */
const CONFIG = {
  module: 'La transition numérique, le BIM et les enjeux juridiques',
  formation: 'Manager de projets BTP, ESCT Nantes',
  rncp: '38810',
  verifieLe: '',
  nbGroupes: 6,
  remise: 'Teams',
  soutenance: { total: 20, expose: 12, questions: 8 }
};
const MOIS_CFG = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const dCfg = iso => { const [a, m, j] = iso.split('-').map(Number); return { a, m: m - 1, j }; };
const jourCfg = j => (j === 1 ? '1er' : String(j));
const dJM = iso => { const d = dCfg(iso); return jourCfg(d.j) + ' ' + MOIS_CFG[d.m]; };
const dLong = iso => { const d = dCfg(iso); return jourCfg(d.j) + ' ' + MOIS_CFG[d.m] + ' ' + d.a; };
const decaler = (iso, jours) => { const d = dCfg(iso); return new Date(Date.UTC(d.a, d.m, d.j + jours)); };
const dJMdepuis = (iso, jours) => { const d = decaler(iso, jours); return jourCfg(d.getUTCDate()) + ' ' + MOIS_CFG[d.getUTCMonth()]; };
/* Les dates sont saisies par les étudiants à la page « Départ ». Le dépôt se fait la veille de la dernière session. */
const DATE_OK = x => /^\d{4}-\d{2}-\d{2}$/.test(String(x || ''));
const DATE_VIDE = '(date à saisir à la page « Départ »)';
const dateChamp = cle => { const x = S.champs && S.champs[cle]; return DATE_OK(x) ? x : ''; };
const dLongDepuis = (iso, jours) => { const d = decaler(iso, jours); return jourCfg(d.getUTCDate()) + ' ' + MOIS_CFG[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); };
const S1 = () => dateChamp('id_seance1') ? dJM(dateChamp('id_seance1')) : DATE_VIDE;
const S2 = () => dateChamp('id_seance2') ? dJM(dateChamp('id_seance2')) : DATE_VIDE;
const S1L = () => dateChamp('id_seance1') ? dLong(dateChamp('id_seance1')) : DATE_VIDE;
const S2L = () => dateChamp('id_seance2') ? dLong(dateChamp('id_seance2')) : DATE_VIDE;
/* Le dépôt se fait la veille de la dernière session : la page n'affiche pas de date, pour rester juste pour les trois classes */
const DEPOT = () => 'la veille de la dernière session';
const DEPOTL = DEPOT;
const nomClasse = () => rempli('id_classe') ? String(v('id_classe')).trim() : '…';
const VERIFIE = () => CONFIG.verifieLe ? dLong(CONFIG.verifieLe) : '';

/* Références officielles : liens de départ, à ouvrir et à relire. Aucun article n'est cité de mémoire dans cette page. */
const SOURCES = {
  legifrance: { t: `Légifrance – le service public de la diffusion du droit`, u: 'https://www.legifrance.gouv.fr/' },
  daj: { t: `Direction des affaires juridiques (économie.gouv.fr) – commande publique`, u: 'https://www.economie.gouv.fr/daj' },
  rgpd: { t: `CNIL – Texte du RGPD, article par article`, u: 'https://www.cnil.fr/fr/reglement-europeen-protection-donnees' },
  cnil_ia: { t: `CNIL – Intelligence artificielle`, u: 'https://www.cnil.fr/fr/technologies/intelligence-artificielle-ia' },
  cnil_generative: { t: `CNIL – Questions-réponses sur l'utilisation d'un système d'IA générative`, u: 'https://www.cnil.fr/fr/les-questions-reponses-de-la-cnil-sur-lutilisation-dun-systeme-dia-generative' },
  ia_ce: { t: `Commission européenne – Législation sur l'IA et calendrier d'application`, u: 'https://digital-strategy.ec.europa.eu/fr/policies/regulatory-framework-ai' },
  ia_texte: { t: `Règlement (UE) 2024/1689 sur l'intelligence artificielle – texte officiel`, u: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=OJ:L_202401689' },
  anssi: { t: `ANSSI – la directive NIS 2`, u: 'https://cyber.gouv.fr/' },
  claude_projets: { t: `Aide de Claude – créer et gérer des projets (en anglais)`, u: 'https://support.claude.com/en/articles/9519177' },
  claude_limites: { t: `Aide de Claude – bien utiliser ses limites d'usage (en anglais)`, u: 'https://support.claude.com/en/articles/9797557' }
};
const OUTILS = {
  calibrateur: 'https://pierrickbriand.github.io/Calibrateur-de-preferences-Claude/',
  entraineur: 'https://pierrickbriand.github.io/entraineur-de-prompt/'
};

/* Thèmes juridiques du module (issus du TD). Chaque groupe vérifie les références sur la source officielle. */
const THEMES_JURIDIQUES = [
  `Propriété de la maquette numérique et des données du BIM`,
  `Responsabilités des acteurs et convention BIM`,
  `Documents contractuels de travaux : CCAG-Travaux et autres cadres`,
  `Données personnelles sur un chantier (RGPD)`,
  `Règlement européen sur l'intelligence artificielle`,
  `Cybersécurité des entreprises (directive NIS 2)`
];

/* Le chantier fictif, commun à tous les groupes */
const CHANTIER = {
  nom: 'Rive Nord',
  resume: `Immeuble de bureaux de sept niveaux (rez-de-chaussée et six étages) avec un sous-sol de stationnement, à Nantes. Le site, le maître d'ouvrage et les entreprises sont fictifs.`,
  surface: 6800, budget: 14200000, duree: 22, os: '2027-01-04',
  moa: `Société Rive Nord Immobilier (fictive)`,
  moe: `Atelier d'architecture et bureau d'études (fictifs)`,
  bim: `Maquette numérique de conception, niveau de détail à préciser dans la convention BIM (à construire par le groupe)`,
  lots: [
    // n, intitulé, entreprise fictive, montant HT, effectif maximum, début (mois depuis l'OS), durée (mois)
    [1, 'Terrassement et fondations', 'Fondations Ouest (fictive)', 1150000, 14, 0, 4],
    [2, 'Gros œuvre béton armé', 'Béton Loire (fictive)', 3300000, 46, 3, 10],
    [3, 'Charpente métallique, couverture, étanchéité', 'Structures Atlantique (fictive)', 1050000, 18, 11, 5],
    [4, 'Façades vitrées et menuiseries extérieures', 'Façades Estuaire (fictive)', 2350000, 22, 12, 7],
    [5, 'Cloisons, doublages, plafonds', 'Cloisons Ouest (fictive)', 1200000, 30, 15, 6],
    [6, 'Revêtements de sols, peintures', 'Finitions Erdre (fictive)', 760000, 20, 18, 4],
    [7, 'Électricité courants forts et faibles', 'Électricité Maine (fictive)', 1450000, 24, 13, 9],
    [8, 'Chauffage, ventilation, climatisation, plomberie', 'Fluides Océan (fictive)', 1900000, 26, 12, 9],
    [9, 'Ascenseurs', 'Élévation Bretagne (fictive)', 380000, 6, 17, 4],
    [10, 'Voirie, réseaux divers, espaces verts', 'Aménagements Sèvre (fictive)', 410000, 10, 19, 3],
    [11, 'Serrurerie, métallerie', 'Métal Vilaine (fictive)', 250000, 8, 16, 5]
  ],
  jalons: [
    ['Ordre de service de démarrage', 0], ['Fin des fondations', 4], ['Fin du gros œuvre', 13], ['Hors d\'eau', 16],
    ['Hors d\'air', 19], ['Fin des essais techniques', 21], ['Réception', 22]
  ],
  aleas: [
    `Un réseau enterré, absent des plans, est découvert pendant le terrassement. Il faut le dévoyer.`,
    `Le fournisseur des vitrages annonce quatorze semaines de délai au lieu de dix.`,
    `Le maître d'ouvrage demande une terrasse accessible sur le toit, après la signature des marchés.`,
    `L'entreprise de gros œuvre manque de grutiers pendant deux mois.`,
    `Le bureau d'études met à jour la maquette numérique : le plan de réservations des fluides change.`
  ]
};
const eur = x => nb(x) + ' €';
const dateMois = n => { const d = decaler(CHANTIER.os, 0); const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, d.getUTCDate())); return MOIS_CFG[t.getUTCMonth()] + ' ' + t.getUTCFullYear(); };

const PROJETS = [
  { id: 'strategie', t: `Comparateur de scénarios de transition numérique`, court: `Comparateur de scénarios`, missions: ['Stratégie de construction'],
    but: `Comparer deux ou trois façons de numériser le chantier Rive Nord. Par exemple : la maquette sert seulement à la conception ; la maquette est partagée jusqu'au chantier, avec une convention BIM ; le chantier est connecté, avec des capteurs et une IA qui alerte.`,
    livrable: `Une grille de comparaison avec des critères pondérés, une recommandation argumentée et la liste de vos hypothèses chiffrées, avec leurs sources.`,
    implique: `C'est le projet du benchmarking. Vous cherchez des ordres de grandeur (coût, délai, gains) dans des sources que vous citez. Vous notez chaque scénario, vous défendez vos poids. La difficulté : trouver des sources fiables et ne pas inventer de chiffres.`,
    ia: `Claude aide à lister les critères, à critiquer vos poids et à trouver des pistes de sources. Chaque ordre de grandeur se vérifie dans une source ouverte et datée.` },
  { id: 'chantier', t: `Tableau de bord numérique de chantier et pilotage des écarts`, court: `Tableau de bord`, missions: ['Performance financière', 'Pilotage de projet'],
    but: `Construire le tableau de bord qu'un chantier numérisé rend possible : avancement et dépenses par lot, écarts entre le prévu et le réel, actions correctives. Vous dites d'où viendraient les données (maquette, pointage, capteurs) et ce que le numérique change par rapport au suivi sur papier.`,
    livrable: `Un tableau de bord sur les lots de Rive Nord, trois indicateurs clés, la liste des données numériques nécessaires et un plan d'action pour un aléa du chantier.`,
    implique: `Vous inventez des données de suivi plausibles, la page calcule les écarts, vous refaites un calcul à la main. La difficulté : rester cohérent entre les lots, et expliquer ce que chaque indice veut dire à quelqu'un qui ne connaît pas la méthode.`,
    ia: `Claude aide à construire des données plausibles et à lire les écarts. Les calculs se refont à la main sur au moins un lot.` },
  { id: 'contrats', t: `Veille juridique de la transition numérique`, court: `Veille juridique`, missions: ['Gestion contractuelle'],
    but: `Repérer les risques juridiques que le numérique ajoute au chantier Rive Nord : convention BIM et responsabilités, propriété et réutilisation de la maquette, données personnelles du chantier connecté, pièces contractuelles rédigées avec une IA, cybersécurité. Pour chaque risque, trouver la référence officielle et dire ce que fait le manager de projets.`,
    livrable: `Une fiche de veille par cas, avec la référence officielle consultée et sa date, trois points de vigilance, et la fiche de contrôle des références du groupe.`,
    implique: `Vous ouvrez des textes officiels (Légifrance, CNIL, EUR-Lex) et vous écrivez ce qu'ils disent, avec la date de consultation. Claude propose des pistes, parfois fausses : vous les contrôlez une par une. La difficulté : lire un texte juridique et n'en garder que ce qui concerne le chantier.`,
    ia: `Claude propose des pistes. Chaque référence est ouverte sur sa source officielle avant d'entrer dans le dossier.` },
  { id: 'rh', t: `Compétences et organisation de la transition numérique`, court: `Compétences`, missions: ['Management RH', 'Pilotage de projet'],
    but: `Lire la charge des équipes de Rive Nord sur 22 mois, repérer les pointes, puis dire quelles compétences numériques manquent (coordination BIM, modélisation, gestion des données, lecture de la maquette sur le chantier) et comment les obtenir : recruter, former, sous-traiter.`,
    livrable: `Un planning de charge commenté, une carte des compétences numériques à acquérir et trois mesures de gestion des ressources humaines, avec un coût et un délai.`,
    implique: `Vous travaillez sur les métiers : qui change de façon de travailler, qui doit être formé, dans quel ordre. La difficulté : chiffrer un coût et un délai de formation sans inventer, et n'utiliser aucune donnée sur de vraies personnes.`,
    ia: `Claude aide à lisser la charge et à lister les compétences. Il ne reçoit aucune donnée sur de vraies personnes.` }
];
const MISSIONS = ['Stratégie de construction', 'Performance financière', 'Gestion contractuelle', 'Pilotage de projet', 'Management RH'];

const JAUGES = {
  risque:      { l: 'Risque juridique', base: 40, sens: -1, aide: 'Plus bas, c\'est mieux.', niv: ['faible', 'modéré', 'à surveiller', 'élevé'] },
  charge:      { l: 'Charge de travail', base: 40, sens: -1, aide: 'Plus bas, c\'est mieux.', niv: ['légère', 'modérée', 'à surveiller', 'lourde'] },
  fiabilite:   { l: 'Fiabilité des sources', base: 50, sens: 1, aide: 'Ce que le groupe a vérifié. Plus haut, c\'est mieux.', niv: ['solide', 'correcte', 'à surveiller', 'fragile'] },
  tracabilite: { l: 'Traçabilité de l\'IA', base: 50, sens: 1, aide: 'Journal de bord tenu. Plus haut, c\'est mieux.', niv: ['bonne', 'correcte', 'à surveiller', 'faible'] }
};

const DECISIONS = {
  donnees: {
    q: `Avec quelles données le groupe travaille-t-il ?`,
    sources: ['cnil_generative'],
    options: [
      { id: 'fictives', l: `Le chantier fictif Rive Nord, fourni par cette page`, e: { risque: -5, fiabilite: 5 },
        suite: `Tout le monde part de la même base. Les écarts entre groupes viendront de vos choix, pas des données.` },
      { id: 'anonymes', l: `Le chantier fictif, complété par des données d'entreprise anonymisées, avec l'accord écrit du maître de stage ou du tuteur`, e: { risque: 5, charge: 5 },
        suite: `Vos résultats seront plus réalistes. Supprimer les noms ne suffit pas toujours : un chantier se reconnaît à son lieu, son budget et ses entreprises.` },
      { id: 'reelles', l: `Des documents réels d'un chantier ou d'une entreprise, tels quels`, e: { risque: 35, fiabilite: -10 }, grave: true,
        suite: `Stop. Vous confiez à un tiers des documents contractuels, des prix ou des noms de personnes. Changez ce choix avant de continuer.` }
    ]
  },
  cadrage: {
    q: `Quand le groupe écrit-il son cadrage initial ?`,
    options: [
      { id: 'avant', l: `Avant tout usage de Claude, à la main, en séance`, e: { tracabilite: 15, fiabilite: 5 },
        suite: `Vous aurez une trace de votre pensée avant l'outil. C'est ce que demande le journal de bord.` },
      { id: 'apres', l: `Après un premier échange avec Claude, pour gagner du temps`, e: { tracabilite: -10, fiabilite: -5 },
        suite: `Le cadrage ne montre plus ce que vous pensiez seuls. Le jury ne pourra pas mesurer ce que l'outil a changé.` },
      { id: 'jamais', l: `Nous le demandons à Claude`, e: { tracabilite: -25, fiabilite: -10 }, grave: true,
        suite: `Le cadrage initial doit être écrit sans IA. Reprenez-le à la main, même en trois lignes.` }
    ]
  },
  sources: {
    q: `Claude vous donne un article de loi ou une norme. Que faites-vous ?`,
    sources: ['legifrance', 'daj'],
    options: [
      { id: 'verifier', l: `Nous ouvrons la source officielle, nous lisons le texte et nous notons la date de consultation`, e: { risque: -10, fiabilite: 15, charge: 5 },
        suite: `Vous avez la preuve que la référence existe et dit ce que vous écrivez. Notez le verdict dans la fiche de contrôle : exacte, inexacte, introuvable ou périmée.` },
      { id: 'recouper', l: `Nous vérifions sur un site de vulgarisation ou une autre IA`, e: { risque: 5, fiabilite: 0 },
        suite: `Vous recoupez, mais sans source officielle. Une autre IA peut se tromper de la même façon.` },
      { id: 'copier', l: `Nous copions la référence dans le dossier : l'outil est plutôt fiable`, e: { risque: 25, fiabilite: -25, tracabilite: -5 }, grave: true,
        suite: `Une référence inventée ou périmée coûte cher à l'oral. Aucune référence n'entre dans le dossier sans avoir été ouverte.` }
    ]
  },
  journal: {
    q: `Comment le groupe tient-il son journal de bord IA ?`,
    options: [
      { id: 'continu', l: `Une ligne par usage significatif, remplie au fil de l'eau par un responsable désigné`, e: { tracabilite: 25, charge: 5 },
        suite: `Le journal reste fidèle. Il vous servira de base pour le bilan et pour les questions du jury.` },
      { id: 'chacun', l: `Chacun note ses propres usages, puis nous fusionnons avant le dépôt`, e: { tracabilite: 10, charge: 10 },
        suite: `C'est faisable si vous fixez une date de fusion. Sinon, il manquera des lignes.` },
      { id: 'fin', l: `Nous le reconstituons à la fin, de mémoire`, e: { tracabilite: -15, fiabilite: -5 }, grave: true,
        suite: `Un journal reconstitué oublie les rejets, qui sont ce qu'il y a de plus utile. Sans journal, l'usage de l'IA est plafonné à 1,5 point sur 3.` }
    ]
  },
  projet_perim: {
    q: `Quelle ambition pour le projet du groupe ?`,
    options: [
      { id: 'une', l: `Un livrable minimal, complet et vérifié`, e: { charge: -10, fiabilite: 5 },
        suite: `Vous aurez un projet que vous savez défendre. Le reste passe dans « la suite ».` },
      { id: 'deux', l: `Le livrable minimal, plus une extension si le temps le permet`, e: { charge: 10 },
        suite: `Décidez dès maintenant à quel moment vous arrêtez l'extension.` },
      { id: 'tout', l: `Tout le projet, y compris les calculs les plus fins`, e: { risque: 5, charge: 30, fiabilite: -10 }, grave: true,
        suite: `Vous risquez de présenter beaucoup de pages et peu de preuves. Réduisez le périmètre.` }
    ]
  }
};

const SCENES = {
  s_veille: {
    titre: `Le jour du dépôt, 17 h : la veille de la dernière session`,
    dependDe: ['sources', 'journal'],
    variantes: [
      { id: 'inventee', si: c => c.choix.sources === 'copier',
        texte: `Un membre du groupe relit le dossier. Il cherche l'article cité à la page 6. Il ne le trouve pas sur la source officielle.`,
        reps: [
          { id: 'a', l: `Vous retirez la référence, vous le notez dans le journal comme « rejeté, introuvable » et vous contrôlez toutes les autres`, e: { risque: -10, fiabilite: 15, tracabilite: 10, charge: 10 }, suite: `Vous perdez une heure et vous gagnez un dossier fiable. Le rejet montre aussi que vous contrôlez l'outil.` },
          { id: 'b', l: `Vous remplacez l'article par un autre, proposé par Claude`, e: { risque: 10, fiabilite: -10 }, suite: `Vous reproduisez le même risque. Ouvrez cette nouvelle référence avant de la garder.` },
          { id: 'c', l: `Vous laissez la référence : le jury ne vérifiera pas`, e: { risque: 15, fiabilite: -15 }, suite: `Le jury peut vérifier. Vous défendriez à l'oral une référence que vous n'avez jamais lue.` }
        ] },
      { id: 'journalvide', si: c => c.choix.journal === 'fin',
        texte: `Il est 17 h. Le journal compte deux lignes, alors que le groupe a utilisé Claude pendant plusieurs séances.`,
        reps: [
          { id: 'a', l: `Vous reconstituez les usages à partir de l'historique de vos conversations, et vous écrivez que le journal est reconstitué`, e: { tracabilite: 15, charge: 10 }, suite: `Vous restez honnêtes. Vous retrouverez des rejets que la mémoire avait effacés.` },
          { id: 'b', l: `Vous inventez des lignes plausibles`, e: { tracabilite: -20, risque: 10 }, suite: `Un journal inventé est pire qu'un journal court. Reprenez avec l'historique réel.` },
          { id: 'c', l: `Vous déposez deux lignes`, e: { tracabilite: -10 }, suite: `Le plafond de 1,5 point sur 3 risque de s'appliquer. Ajoutez au moins les usages principaux.` }
        ] },
      { id: 'tendu', si: c => c.j.charge >= 65,
        texte: `Le groupe a encore la moitié du projet à finir. Le support compte dix-neuf diapositives.`,
        reps: [
          { id: 'a', l: `Vous gardez le livrable minimal et dix diapositives au plus, quitte à retirer un chapitre`, e: { charge: -20, fiabilite: 5 }, suite: `Vous présenterez peu, mais complet. C'est ce que demande la consigne.` },
          { id: 'b', l: `Vous demandez à Claude de tout condenser en une heure`, e: { charge: 5, fiabilite: -10, tracabilite: -5 }, suite: `Vous aurez un dossier que personne n'a relu. Notez cet usage dans le journal.` },
          { id: 'c', l: `Vous déposez le dossier tel quel`, e: { charge: 5, fiabilite: -10 }, suite: `Le jury verra les trous. Mieux vaut un périmètre réduit qu'un dossier troué.` }
        ] },
      { id: 'pret', si: () => true,
        texte: `Le dossier est prêt une heure avant le dépôt. Le groupe hésite à relire encore.`,
        reps: [
          { id: 'a', l: `Vous faites relire le journal et la fiche de contrôle par une personne qui n'a pas écrit le dossier`, e: { fiabilite: 10, tracabilite: 5 }, suite: `Un regard neuf repère ce que vous ne voyez plus. C'est la meilleure heure du projet.` },
          { id: 'b', l: `Vous déposez tout de suite`, e: {}, suite: `Vous tenez le délai. Vérifiez au moins que les deux fichiers sont bien partis sur Teams.` },
          { id: 'c', l: `Vous demandez à Claude de relire tout le dossier`, e: { tracabilite: 5, fiabilite: -5 }, suite: `Il corrigera du style, pas les faits. Notez l'usage dans le journal et gardez la vérification humaine.` }
        ] }
    ]
  }
};

const QUESTIONS_JURY = {
  risque: `Si une référence juridique de votre dossier est fausse, qui l'a contrôlée et comment ?`,
  charge: `Qu'avez-vous choisi de ne pas faire, et pourquoi ?`,
  fiabilite: `Quelle source avez-vous rejetée, et comment l'avez-vous su ?`,
  tracabilite: `Montrez une ligne de votre journal où vous avez rejeté ou corrigé la réponse de Claude.`
};

const ROLES = [
  ['r_coord', 'Coordination du groupe', `Tient le calendrier, anime les points d'étape, dépose les fichiers sur Teams.`],
  ['r_ia', 'Journal de bord IA', `Tient le journal ligne par ligne, relit les consignes clés, prépare le bilan.`],
  ['r_jur', 'Références juridiques', `Tient la fiche de contrôle : ouvre chaque source officielle, note le verdict et la date.`],
  ['r_proj', 'Contenu du projet', `Garde la cohérence du livrable, refait les calculs à la main.`],
  ['r_pres', 'Support de présentation', `Prépare les dix diapositives au plus, avec sources et dates.`]
];

/* Grille d'évaluation de la soutenance : proposée par le formateur, 20 points. Quatre niveaux par critère. */
const GRILLE = [
  { c: `Cadrage stratégique`, pts: 3, q: `Le problème du chantier est compris et formulé ; le cadrage initial a été écrit sans IA ; le périmètre est tenu.` },
  { c: `Benchmarking et solutions techniques`, pts: 3, q: `Les options ou cas sont comparés avec des critères explicites, des sources citées et datées, des forces et des faiblesses.` },
  { c: `Cadre juridique`, pts: 3, q: `Les références sont ouvertes sur une source officielle, avec un verdict et une date ; les risques pour le chantier sont nommés.` },
  { c: `Mise en œuvre : méthode, contrôles, tests, modifications`, pts: 3, q: `Le groupe décrit comment il a travaillé, ce qu'il a contrôlé, les tests faits et les modifications importantes apportées en cours de route.` },
  { c: `Démonstration de l'efficacité, limites et contraintes`, pts: 3, q: `Un résultat est montré et refait à la main ; les limites, les hypothèses et les contraintes sont dites sans les cacher.` },
  { c: `Usage de l'IA tracé`, pts: 3, q: `Le journal de bord montre des usages, des rejets et des vérifications. Sans journal, ce critère est plafonné à 1,5 point.` },
  { c: `Oral et support`, pts: 2, q: `Dix diapositives au plus, sources et dates visibles, temps tenu, chaque membre prend la parole.` }
];
const NIVEAUX_GRILLE = ['insuffisant', 'fragile', 'solide', 'maîtrisé'];
