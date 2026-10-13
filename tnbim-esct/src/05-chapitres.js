/* ───────── Contenu des chapitres ───────── */
function tableau(entetes, lignes, classe) {
  return `<div class="defile"><table class="tab ${classe || ''}"><thead><tr>${entetes.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${lignes.map(l => `<tr>${l.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function aideLimite() {
  return aide(`Claude me dit que j'ai atteint ma limite`, `<p>Les comptes gratuits ont une limite d'usage par session. Elle se remet à zéro toutes les cinq heures. Claude indique quand vous pourrez reprendre. Votre travail n'est pas perdu.</p>`
    + pas([`Enregistrez le fichier de projet, avec le bouton « Enregistrer ».`, `Notez où vous en étiez : la consigne collée et la réponse attendue.`, `Avancez sur ce qui ne demande pas Claude : vos choix, votre cadrage, la fiche de contrôle des références.`, `Un autre membre du groupe peut continuer avec son propre compte. Il note l'usage dans le journal.`])
    + `<p class="note">Pour consommer moins : regroupez vos demandes dans un seul message, évitez de recoller un long texte et ouvrez une conversation par tâche.</p>` + liens(['claude_limites']), 'aide_limite');
}
function aideGlossaire() {
  const t = [
    ['Journal de bord IA', `Tableau où le groupe note chaque usage significatif de l'IA : outil, objectif, consigne clé, résultat, décision (gardé, modifié ou rejeté) et vérification.`],
    ['Cadrage initial', `Texte écrit sans IA avant le premier échange avec Claude : votre compréhension du problème, vos hypothèses, ce que vous attendez de l'outil.`],
    ['Fiche de contrôle des références', `Tableau où le groupe note, pour chaque référence juridique, la source officielle consultée, la date et le verdict : exacte, inexacte, introuvable ou périmée.`],
    ['Fichier de projet', `Fichier .json de cette page, qui garde tout le travail du groupe. Seule la page sait le lire.`],
    ['BIM', `Modélisation des informations de la construction : une maquette numérique partagée entre les acteurs d'un projet.`],
    ['Convention BIM', `Document qui fixe les règles d'échange de la maquette entre les acteurs : qui fait quoi, quel niveau de détail, quels formats.`],
    ['Projet Claude', `Espace de Claude qui garde des instructions et des fichiers d'une conversation à l'autre.`],
    ['Transition numérique', `Passage d'une organisation du papier et des échanges dispersés à des données partagées, structurées et exploitées à chaque étape d'un projet.`],
    ['IoT (objets connectés)', `Capteurs et appareils reliés au réseau, qui mesurent et transmettent : position d'un engin, prise du béton, présence sur une zone.`],
    ['Scénario', `Une façon de faire, décrite en une phrase, que l'on compare à d'autres.`],
    ['Benchmarking', `Comparer plusieurs options ou plusieurs pratiques avec les mêmes critères, pour choisir en connaissance de cause.`],
    ['Fourchette', `Une valeur basse et une valeur haute, au lieu d'un chiffre unique.`],
    ['Invention', `Réponse fausse que Claude présente avec assurance, souvent quand une donnée manque.`]];
  return aide(`Glossaire : les mots du module`, `<dl class="glossaire">${t.map(x => `<dt>${x[0]}</dt><dd>${x[1]}</dd>`).join('')}</dl>`);
}
function ficheChantier() {
  const C = CHANTIER;
  return `<dl class="fiche"><dt>Opération</dt><dd>${C.resume}</dd><dt>Surface de plancher</dt><dd>${nb(C.surface)} m²</dd><dt>Budget des travaux</dt><dd>${eur(C.budget)} HT</dd>
    <dt>Durée</dt><dd>${C.duree} mois, à partir de l'ordre de service du ${dLong(C.os)} (date fictive)</dd><dt>Maître d'ouvrage</dt><dd>${C.moa}</dd><dt>Maîtrise d'œuvre</dt><dd>${C.moe}</dd><dt>Maquette numérique</dt><dd>${C.bim}</dd></dl>`;
}
function tableauLots() {
  const tot = CHANTIER.lots.reduce((s, l) => s + l[3], 0);
  return tableau(['N°', 'Lot', 'Entreprise (fictive)', 'Montant HT', 'Effectif max.', 'Début', 'Durée'],
    CHANTIER.lots.map(l => [l[0], l[1], l[2], eur(l[3]), l[4], `mois ${l[5]}`, `${l[6]} mois`]).concat([['', '<b>Total</b>', '', `<b>${eur(tot)}</b>`, '', '', '']]));
}
function blocRoles() {
  return `<div class="champs">${ROLES.map(r => champ(r[0], `${r[1]}`, { aide: r[2], sansMention: true, ex: 'Prénom NOM' })).join('')}</div>`;
}
function blocJournalLigne(n) {
  const k = c => 'jb' + n + '_' + c, req = n === 1;
  return `<section class="bloc ligne-journal"><h3>Ligne ${n}</h3><div class="champs">
    ${champ(k('date'), 'Date', { ex: '14/10', requis: req, sansMention: true })}${champ(k('outil'), 'Outil', { ex: 'Claude, projet du groupe', requis: req, sansMention: true })}
    ${champ(k('objectif'), 'Objectif', { large: true, ex: 'Ce que nous voulions obtenir', requis: req, sansMention: true })}
    ${champ(k('consigne'), 'Consigne clé', { type: 'zone', lignes: 2, large: true, ex: 'La phrase qui a fait la différence, entre guillemets', requis: req, sansMention: true })}
    ${champ(k('resultat'), 'Résultat obtenu', { type: 'zone', lignes: 2, large: true, requis: req, sansMention: true })}
    ${champ(k('decision'), 'Décision', { type: 'liste', options: [['garde', 'Gardé'], ['modifie', 'Modifié'], ['rejete', 'Rejeté']], requis: req, sansMention: true })}
    ${champ(k('pourquoi'), 'Pourquoi', { type: 'zone', lignes: 2, large: true, ex: 'Gardé : …. Rejeté : …', requis: req, sansMention: true })}
    ${champ(k('verif'), 'Vérification (source consultée, date)', { type: 'zone', lignes: 2, large: true, ex: 'Document ouvert, date', requis: req, sansMention: true })}
  </div></section>`;
}
function blocFicheControle() {
  const lignes = THEMES_JURIDIQUES.map((t, i) => {
    const n = i + 1, k = c => 'fc' + n + '_' + c;
    return [t, cel(k('ref'), { l: 'Référence examinée' }), cel(k('src'), { l: 'Source officielle consultée' }), cel(k('date'), { l: 'Date de consultation', court: true }),
      cel(k('verdict'), { l: 'Verdict', liste: [['exacte', 'Exacte'], ['inexacte', 'Inexacte'], ['introuvable', 'Introuvable'], ['perimee', 'Périmée']] })];
  });
  return tableau(['Thème', 'Référence examinée', 'Source officielle consultée', 'Date', 'Verdict'], lignes);
}
const cel = (cle, o) => { o = o || {}; REG.champs[cle] = { l: o.l || cle, ch: CH, requis: !!o.requis };
  if (o.liste) return `<select data-champ="${cle}" aria-label="${esc(o.l || '')}">${[['', '…']].concat(o.liste).map(x => `<option value="${x[0]}"${v(cle) === x[0] ? ' selected' : ''}>${x[1]}</option>`).join('')}</select>`;
  if (o.court) return `<input type="text" data-champ="${cle}" value="${esc(v(cle))}" aria-label="${esc(o.l || '')}" autocomplete="off">`;
  return `<textarea data-champ="${cle}" rows="2" aria-label="${esc(o.l || '')}">${esc(v(cle))}</textarea>`; };

function grilleHtml() {
  const s = CONFIG.soutenance;
  return `<p>Soutenance de <b>${s.total} minutes par groupe</b> : ${s.expose} minutes d'exposé, ${s.questions} minutes de questions. Chaque membre prend la parole. Note sur 20, selon sept critères. Chaque critère est jugé sur quatre niveaux : ${NIVEAUX_GRILLE.join(', ')}.</p>`
    + tableau(['Critère', 'Points', 'Ce que le jury regarde'], GRILLE.map(g => [`<b>${g.c}</b>`, g.pts, g.q]))
    + `<p class="note">Le groupe doit présenter la démonstration de l'efficacité de ce qu'il propose, ses limites et ses contraintes. Il décrit toute la mise en œuvre : les contrôles, les tests et les modifications importantes apportées en cours de route. Un travail qui montre ce qui a été rejeté ou corrigé est mieux noté qu'un travail lisse.</p>`;
}
const CHAPITRES = [
/* ── Départ ── */
{ id: 'depart', nav: 'Départ', groupe: 0, seance: () => `Module de 8 heures – deux sessions de 4 heures`,
  titre: `Votre projet, votre chantier, votre journal`,
  chapo: `En deux sessions de quatre heures, votre groupe traite un problème de transition numérique sur un chantier fictif commun, avec un projet choisi parmi quatre. Chacun trace ses usages de l'IA dans un journal de bord.`,
  rendu: () => blocSecours() + bloc(`Ce que vous allez faire`, `<p>Vous êtes de futurs managers de projets BTP. Pendant deux sessions de quatre heures, vous traitez un problème de <b>transition numérique</b> sur un <b>chantier fictif</b>, « ${CHANTIER.nom} », le même pour tous les groupes.</p>
      <p>Vous travaillez avec <b>Claude</b>, l'assistant d'IA, installé dans un <b>projet Claude</b> : un espace où vous rangez vos instructions et vos fichiers. Claude propose, vous vérifiez, vous décidez. Ce n'est pas une application à programmer.</p>
      <h3>En groupe, mais chacun sur sa page</h3>
      <p>Le travail se fait en groupe : même chantier, même projet, mêmes résultats. Mais <b>chaque étudiant utilise cette page sur son propre appareil</b>, avec son propre projet Claude, et rend son propre fichier. Pourquoi ? Parce que le journal de bord trace ce que <i>vous</i> avez demandé à Claude, ce que vous avez gardé et rejeté. Le jury lit le travail du groupe, et le journal de chacun.</p>
      <h3>Vous remettez trois choses</h3>` + pas([
        `<b>Le travail de votre projet</b>, choisi parmi quatre : comparateur de scénarios de transition numérique, tableau de bord numérique de chantier, veille juridique de la transition numérique, compétences et organisation de la transition numérique. Tous les quatre travaillent les mêmes objectifs : cadrage stratégique, benchmarking, cadre juridique, organisation.`,
        `<b>Un journal de bord IA</b>, individuel : vous notez chaque usage important de Claude, ce que vous gardez, modifiez ou rejetez, et comment vous l'avez vérifié.`,
        `<b>Un support de présentation</b> de dix diapositives au plus, commun au groupe, pour l'oral de la dernière session.`])
      + `<h3>Le rôle de cette page</h3><p>Elle vous guide pas à pas, prépare vos consignes pour Claude, fait les calculs de votre projet, garde la trace de votre travail et produit le PDF à déposer. Elle ne remplace ni Claude ni votre réflexion : les références juridiques et les calculs se vérifient tout au long de la conception et de l'utilisation de votre futur projet.</p>`)
    + bloc(`La transition numérique du BTP, en bref`, `<p><b>Définition.</b> La transition numérique, c'est passer du papier et des échanges dispersés (plans imprimés, e-mails, tableurs de chacun) à des données partagées, structurées et exploitées à chaque étape d'un projet : conception, chantier, exploitation du bâtiment.</p>
      <p><b>Les enjeux pour le BTP.</b> Moins d'erreurs entre les plans et le chantier, des délais et des coûts mieux tenus, une sécurité mieux suivie, une traçabilité de qui a décidé quoi, et une maintenance du bâtiment préparée dès la conception. En face : un coût d'entrée, des compétences à acquérir, des contrats à réécrire et des données à protéger.</p>
      <p><b>Les impacts sur les métiers et les processus.</b> Le conducteur de travaux et le chef de chantier lisent la maquette plutôt que des plans ; de nouveaux rôles apparaissent (coordination BIM, gestion des données) ; la réunion de chantier se fait autour d'une maquette partagée ; l'avancement se pointe sur tablette ; les décisions laissent une trace. Les processus changent autant que les outils.</p>
      <h3>Quatre familles de technologies</h3>` + tirets([
        `<b>le BIM</b> : une maquette numérique du bâtiment, partagée entre les acteurs, et surtout une façon de travailler ensemble autour d'elle (convention BIM, niveaux de détail, échanges). La modélisation sous Revit est enseignée par un autre formateur`,
        `<b>l'IoT, les objets connectés</b> : des capteurs sur les engins, le béton, les zones à risque, qui mesurent et transmettent en continu`,
        `<b>l'IA</b> : des outils qui analysent des données, rédigent, comparent et proposent, comme Claude. Elle aide à décider, elle ne décide pas`,
        `<b>les technologies émergentes</b> : drones et scan 3D pour relever l'existant, réalité augmentée sur le chantier, robots et impression 3D, jumeau numérique du bâtiment en exploitation`])
      + `<p><b>Dans ce module, nous nous consacrons à l'IA</b> : vous l'utilisez vous-mêmes avec Claude, et vous étudiez ce qu'elle change dans la stratégie, le cadre juridique et l'organisation d'un projet de construction.</p>`)
    + bloc(`Les deux sessions`, `<ul class="parcours">
      <li><b>Première session de cours</b>Vous réglez Claude, vous découvrez le chantier fictif, vous choisissez votre projet. Vous écrivez le cadrage initial sans IA, puis vous ouvrez le journal.</li>
      <li class="entre"><b>Entre les deux sessions</b>Vous avancez le projet, vous vérifiez les références juridiques sur les sources officielles, vous tenez le journal. Dépôt sur Teams au plus tard ${DEPOTL()}.</li>
      <li><b>Dernière session de cours</b>Soutenance orale de votre projet, ${CONFIG.soutenance.total} minutes par groupe, avec le support de dix diapositives au plus.</li></ul>`)
    + etape('depart_identite', `Dites qui vous êtes`, '', `<p>Ces informations servent aux consignes, au journal et au dossier. Elles restent sur l'appareil : la page n'envoie rien sur Internet. Les dates vous sont données par votre formateur.</p>
      <div class="champs">${champ('id_classe', `Classe`, { ex: 'MP2-gpC3', requis: true, sansMention: true })}
      ${champ('id_groupe', `Numéro du groupe`, { ex: '3', requis: true, sansMention: true, aide: `Entre 1 et ${CONFIG.nbGroupes}, ou le numéro donné par votre formateur.` })}
      ${champ('id_seance1', `Date de la première session`, { type: 'date', requis: true, sansMention: true })}
      ${champ('id_seance2', `Date de la dernière session (oral)`, { type: 'date', requis: true, sansMention: true, aide: `Le dépôt sur Teams se fait la veille de cette session.` })}
      ${champ('id_nom', `Vous, qui tenez cette page`, { ex: 'Prénom NOM', requis: true, sansMention: true, large: true, aide: `Votre nom figure sur votre PDF et sur votre fichier de projet.` })}
      ${champ('id_membres', `Tous les membres du groupe`, { type: 'zone', large: true, ex: `Prénom NOM, un par ligne`, requis: true, sansMention: true })}</div>
      <h3>Qui fait quoi dans le groupe</h3><p>Chacun garde un rôle principal. Le travail reste collectif. Écrivez le prénom et le nom.</p>${blocRoles()}`)
    + aide(`Comment marche cette page`, tirets([
        `chaque étudiant tient sa page et son fichier de projet ; les contenus communs (cadrage, plan, résultats) se recopient entre coéquipiers`,
        `chaque étape contient des actions à cocher et des consignes à copier dans Claude`,
        `chaque choix modifie l'état du projet : risque juridique, charge de travail, fiabilité des sources, traçabilité de l'IA`,
        `vos choix déclenchent une scène : deux étudiants ne vivront pas la même histoire`,
        `le travail s'enregistre seul sur cet appareil`]) + `
      <h3>Le fichier de projet, votre vraie sauvegarde</h3>
      <p><b>Ce que c'est.</b> Un petit fichier .json qui contient tout ce que vous avez saisi. Seule cette page sait le lire.</p>
      <p><b>À quoi il sert.</b> Le navigateur peut tout perdre : cache vidé, autre ordinateur, session de l'école fermée. Avec ce fichier, vous reprenez là où vous vous étiez arrêté.</p>
      <p><b>Ce que vous en faites.</b></p>` + pas([
        `Cliquez sur « Enregistrer » à chaque pause et en fin de session. Le fichier arrive dans les téléchargements.`,
        `Rangez-le dans le dossier du groupe sur Teams, ou envoyez-le à votre propre adresse.`,
        `Pour reprendre : cliquez sur « Ouvrir », ou glissez le fichier n'importe où sur la page.`])
      + `<p><b>À la fin.</b> Vous déposez sur Teams votre fichier de projet, votre PDF (journal et dossier) et le support commun du groupe, au plus tard ${DEPOTL()}. Ne collez jamais ce fichier dans Claude.</p>`
      + tableau(['Action', 'Bouton', 'Raccourci'], [
        ['Repartir de zéro', '« Nouveau »', 'Alt + N'], ['Reprendre un fichier de projet', '« Ouvrir », ou glisser le fichier sur la page', 'Alt + O'],
        ['Enregistrer le fichier de projet', '« Enregistrer »', 'Ctrl + S, ou ⌘ S sur Mac'], ['Exporter le dossier en PDF', '« Exporter »', 'Ctrl + E, ou ⌘ E sur Mac']]))
    + etape('depart_regles', `Retenez quatre règles`, '', pas([
        `<b>Aucune donnée réelle dans Claude.</b> Ni entreprise, ni contrat, ni salarié. Vous travaillez sur le chantier fictif.`,
        `<b>Le cadrage s'écrit sans IA</b>, avant le premier échange avec Claude.`,
        `<b>Chaque usage significatif entre dans le journal</b>, avec ce que vous gardez, modifiez ou rejetez.`,
        `<b>Aucune référence juridique n'entre dans le dossier sans avoir été ouverte</b> sur sa source officielle.`]))
    + aide(`Ce qui est évalué : la grille de la soutenance`, grilleHtml() + `<p class="note">Sans journal de bord, l'usage de l'IA est plafonné à 1,5 point sur 3. Aucune donnée confidentielle ou personnelle ne figure dans le journal.</p>`, 'aide_grille')
    + aideLimite() + aideGlossaire()
},

/* ── 1. Le chantier ── */
{ id: 'chantier', nav: '1. Le chantier fictif', groupe: 0, seance: () => `Première session de cours`,
  titre: `Un chantier fictif pour tous les groupes`,
  chapo: `Tous les projets s'appuient sur le même chantier. Les données sont inventées : elles servent à apprendre, pas à décrire un vrai marché.`,
  rendu: () => bloc(`Rive Nord`, ficheChantier() + `<h3>Les onze lots</h3>` + tableauLots()
      + `<h3>Les jalons</h3>` + tableau(['Jalon', 'Mois après l\'ordre de service', 'Date'], CHANTIER.jalons.map(j => [j[0], j[1], dateMois(j[1])])))
    + bloc(`Les aléas possibles`, `<p>Ces événements peuvent frapper le chantier. Chaque projet en traite au moins un.</p>` + `<ul class="tirets">${CHANTIER.aleas.map(a => `<li>${a}</li>`).join('')}</ul>`)
    + etape('ch_lire', `Lisez la fiche ensemble`, '10 min', `<p><b>Pourquoi.</b> Vous allez choisir un projet et donner des consignes à Claude sur ce chantier. Si vous ne le connaissez pas, Claude le connaîtra mieux que vous, et vous ne pourrez pas le contredire. Dix minutes de lecture vous évitent une heure de travail à côté.</p>
      <p><b>Comment.</b> Chacun lit la fiche en silence, puis pose au groupe une question à laquelle la fiche ne répond pas. Des exemples de questions utiles :</p>` + tirets([
        `quel lot coûte le plus cher, et lequel dure le plus longtemps ?`,
        `à quel moment le plus de lots travaillent en même temps ?`,
        `quelles informations manquent pour décider : le niveau de détail de la maquette, le logiciel utilisé, qui pointe l'avancement ?`,
        `quelles données numériques existent déjà sur ce chantier, et lesquelles n'existent pas ?`,
        `qui décide de quoi entre le maître d'ouvrage, la maîtrise d'œuvre et les entreprises ?`])
      + `<p><b>Ce qui manque à la fiche.</b> La fiche est volontairement incomplète, comme un vrai dossier reçu en début de mission. Notez ici ce qu'il vous manque pour votre projet. Ces manques deviendront vos <b>hypothèses</b> : vous les écrirez dans le dossier (« nous supposons que … »), vous les direz à Claude (« si une donnée manque, dis-le ») et le jury verra que vous n'avez rien inventé.</p>
      <div class="champs">${champ('ch_manque', `Ce qui manque à la fiche, pour notre projet`, { type: 'zone', large: true, sansMention: true, ex: `Le niveau de détail de la maquette. Le logiciel de gestion. Le nombre de chefs de chantier par lot.` })}</div>
      <p><b>Les fichiers du chantier.</b> Téléchargez la fiche au format .md : vous l'ajouterez à votre projet Claude à l'étape suivante. Les lots au format .csv servent aux projets qui calculent.</p>
      <div class="actions"><button type="button" class="btn plein" data-action="fiche-md">Télécharger la fiche (.md)</button><button type="button" class="btn" data-action="fiche-csv">Télécharger les lots (.csv)</button></div>`)
    + repere(`Données de chantier : ce qui est permis`, `<p>Les documents d'un vrai chantier (contrats, prix, plans, noms de salariés) sont confidentiels. Les confier à un outil d'IA grand public, c'est les confier à un tiers. Seule l'entreprise peut l'autoriser.</p>
      <p>Une donnée personnelle concerne une personne identifiable : un nom, une fonction ou un e-mail. Le RGPD demande de ne traiter que les données nécessaires.</p>
      <p>La CNIL recommande de ne saisir aucune information confidentielle dans un service d'IA grand public.</p>`, ['cnil_generative', 'rgpd'])
    + decision('donnees')
},

/* ── 2. Régler Claude ── */
{ id: 'claude', nav: '2. Régler Claude', groupe: 0, seance: () => `Première session de cours`,
  titre: `Réglez Claude pour votre projet`,
  chapo: `Claude travaille mieux quand il connaît le chantier et vos règles. Chaque étudiant crée son projet Claude, avec les mêmes instructions que ses coéquipiers.`,
  rendu: () => bloc(`Pourquoi un projet Claude ?`, `<p>Sans projet, chaque nouvelle conversation repart de zéro : il faut tout recoller, et chaque membre du groupe obtient des réponses différentes.</p>
      <p>Avec un projet, Claude connaît dès la première phrase le chantier Rive Nord et vos règles de travail. Tout le groupe travaille avec le même cadre, et vos usages restent faciles à tracer dans le journal.</p>
      <p class="note">Quatre gestes, une quinzaine de minutes : ouvrir Claude, créer le projet, coller les instructions déjà rédigées, ajouter la fiche du chantier. Le reste est facultatif.</p>`)
    + aideLimite() + etape('c_compte', `Ouvrez Claude`, '5 min', `<p>Allez sur <a href="https://claude.ai" target="_blank" rel="noopener">claude.ai</a> et connectez-vous. La formule gratuite permet de suivre le module. Elle limite le nombre de messages.</p>`
      + tirets([`regroupez vos demandes dans un seul message`, `donnez le contexte dès le début`, `ouvrez une nouvelle conversation quand la précédente devient longue`, `si la limite arrive, avancez sur cette page en attendant`])
      + `<p class="note">Ouvrez aussi « Paramètres », puis « Confidentialité ». Regardez si les conversations servent à améliorer les modèles, et décidez.</p>`)
    + etape('c_projet', `Créez votre projet`, '5 min', `<p>Un projet garde des instructions et des fichiers d'une conversation à l'autre. Le compte gratuit en autorise cinq. Chaque membre du groupe crée le sien : mêmes instructions, même fiche du chantier.</p>`
      + pas([`Dans Claude, ouvrez « Projets », puis « Nouveau projet ».`, `Nommez-le « TNBIM groupe ${rempli('id_groupe') ? esc(v('id_groupe')) : '…'} ».`, `Ajoutez la fiche du chantier (.md), téléchargée à l'étape 1, aux fichiers du projet.`, `Collez les instructions de l'étape suivante.`])
      + aide(`La fiche ne se charge pas ?`, `<p>Si l'ajout de fichier échoue, copiez le texte ci-dessous et collez-le à la fin de la zone « Instructions » du projet. Claude le relira à chaque conversation.</p>` + consigne('fiche_chantier', `Texte de la fiche du chantier`), 'aide_fiche_texte') + liens(['claude_projets']))
    + etape('c_instructions', `Collez les instructions`, '10 min', `<p>Les instructions sont déjà rédigées ci-dessous : copiez-les telles quelles dans votre projet. Les cases et les champs sont là pour les adapter. Dans les deux champs de texte, remplacez ce qui est entre accolades { } par votre situation.</p>
      <div class="coches">${coche('ip_questions', `Poser au plus trois questions avant de produire`, true)}${coche('ip_plan', `Proposer un plan court avant de rédiger ou de calculer`, true)}
      ${coche('ip_sources', `Marquer « à vérifier » toute référence dont il n'est pas sûr`, true)}${coche('ip_doutes', `Signaler ses doutes et les calculs à refaire à la main`, true)}
      ${coche('ip_change', `Dire en une phrase ce qui a changé`, true)}${coche('ip_contredire', `Nous contredire quand notre idée est trop large ou risquée`, true)}</div>
      <div class="champs">${champ('ip_format', `Format d'écriture des réponses`, { type: 'liste', options: LIB_FORMATS, sansMention: true, aide: `Sans choix, Claude répond en prose courte.` })}
      ${champ('ip_travail', `Qui nous sommes et notre façon de travailler`, { type: 'zone', lignes: 5, large: true, defaut: DEF_TRAVAIL, sansMention: true, aide: `Remplacez les accolades. Vous pouvez tout réécrire.` })}
      ${champ('ip_jamais', `Ce que Claude ne doit jamais faire`, { type: 'zone', lignes: 4, large: true, defaut: DEF_JAMAIS, sansMention: true, aide: `Remplacez les accolades. Ajoutez ce qui vous a déjà agacé chez une IA.` })}</div>`
      + consigne('instructions', `Instructions du projet`) + `<p>Elles mentionnent votre projet : le groupe n'a pas encore choisi à ce stade. Claude l'apprendra dans la première conversation, ou vous revenez copier la version à jour après l'étape 3.</p>`)
    + etape('c_test', `Vérifiez que Claude a compris (facultatif)`, '5 min', `<p>Envoyez cette consigne dans une conversation du projet. Comparez chaque réponse à ce que vous attendiez :</p>` + tirets([
        `rôle : assistant de votre groupe, pour un module sur la transition numérique du BTP`,
        `chantier : ${nb(CHANTIER.surface)} m², ${eur(CHANTIER.budget)} HT, ${CHANTIER.duree} mois`,
        `références : nom exact du texte, et « à vérifier » quand il n'est pas sûr`,
        `donnée manquante : il le dit et propose une hypothèse, il n'invente pas`,
        `refus : données réelles, chiffres inventés, et ce que vous avez écrit dans « ne jamais faire »`,
        `format : celui que vous avez choisi`,
        `vouvoiement`,
        `un risque : s'il en cite un sans dire ce qu'il suppose, c'est déjà une erreur à noter`]) + consigne('test_instructions', `Consigne de vérification`)
      + `<div class="champs">${champ('c_test', `Ce que Claude a mal compris, et votre correction`, { type: 'zone', large: true })}</div>
         <p class="note">Cet essai est un premier usage significatif : notez-le dans le journal.</p>`)
    + bloc(`La suite : entraîner vos consignes`, `<p>À l'étape 3, avant de lancer le projet, vous passerez votre consigne de démarrage dans l'« Entraîneur de prompt », intégré à cette page. Il note la consigne, dit ce qui manque et vous fait recommencer jusqu'à une version prête.</p>`)
},

/* ── 3. Le projet ── */
{ id: 'projet', nav: '3. Votre projet', groupe: 0, seance: () => `Première session de cours`,
  titre: `Choisissez votre projet`,
  chapo: `Quatre projets sont proposés. Tous travaillent les mêmes objectifs du module, chacun par un angle différent. Le groupe en choisit un.`,
  rendu: () => {
    const choix = v('pj_choix');
    REG.champs.pj_choix = { l: 'Projet choisi', ch: CH, requis: true };
    return etape('p_choix', `Choisissez un projet`, '15 min', `<p>Lisez les quatre fiches, discutez, puis cliquez. Le projet choisi s'écrit dans vos instructions, vos consignes et votre dossier. Vous pouvez changer d'avis pendant la première session, pas après.</p>
      ${PROJETS.map(p => `<section class="bloc fiche-projet${p.id === choix ? ' choisi' : ''}"><h3>${p.t}</h3><dl class="fiche"><dt>Le but</dt><dd>${p.but}</dd><dt>Ce que vous produisez</dt><dd>${p.livrable}</dd><dt>Ce que cela implique</dt><dd>${p.implique}</dd><dt>Le rôle de Claude</dt><dd>${p.ia}</dd><dt>Angle principal</dt><dd>${p.missions.join(', ')}</dd></dl>
        <div class="actions"><button type="button" class="btn${p.id === choix ? ' plein' : ''}" data-radio="pj_choix" data-valeur="${p.id}" aria-pressed="${p.id === choix}">${p.id === choix ? 'Projet choisi' : 'Choisir ce projet'}</button></div></section>`).join('')}`)
    + bloc(`Les mêmes objectifs pour tous les groupes`, `<p>Quel que soit le projet, chaque groupe travaille les quatre objectifs du module : le <b>cadrage stratégique</b> (cadrage initial, plan, périmètre), le <b>benchmarking</b> (comparer des options ou des cas avec des critères et des sources), le <b>cadre juridique</b> (la fiche de contrôle des références, commune à tous) et l'<b>organisation</b> de la transition numérique (forces, faiblesses, mesures, ce que change le numérique).</p>
      <p>Ce qui change d'un projet à l'autre, c'est l'angle principal, rattaché à une ou deux des cinq missions du manager de projets BTP. Le tableau le montre. Chaque projet comporte aussi un champ sur ce qu'il apporte aux autres missions.</p>`
      + tableau(['Mission du manager de projets BTP', ...PROJETS.map(p => p.court)], MISSIONS.map(m => [m, ...PROJETS.map(p => p.missions.indexOf(m) >= 0 ? (p.id === choix ? '<b>● votre angle</b>' : '●') : '')])))
    + decision('projet_perim')
    + etape('p_entraineur', `Entraînez votre consigne de démarrage`, '15 min', `<p>Une consigne bien rédigée donne une meilleure première réponse, et moins de messages perdus. L'« Entraîneur de prompt », l'outil de votre formateur, note votre consigne sur cinq points : le rôle donné à l'IA, l'action demandée, le contexte, le public et la forme attendue. Il dit ce qui manque et vous fait recommencer.</p>` + pas([
        `Copiez la consigne de démarrage de l'étape suivante (bouton « Copier »).`,
        `Collez-la dans l'entraîneur ci-dessous, dans la zone « Votre prompt », puis cliquez sur « Analyser mon prompt ».`,
        `Améliorez-la d'après l'analyse : ajoutez ce qui manque, retirez ce qui est flou. Recommencez jusqu'à une consigne jugée prête.`,
        `Collez votre version finale dans le champ ci-dessous. C'est elle que vous enverrez à Claude, et c'est votre première ligne de journal.`])
      + `<div class="cadre-outil"><iframe src="${OUTILS.entraineur}" title="Entraîneur de prompt" loading="lazy"></iframe></div>
      <div class="actions"><a class="btn" href="${OUTILS.entraineur}" target="_blank" rel="noopener">Ouvrir l'entraîneur dans un nouvel onglet</a></div>
      <div class="champs">${champ('p_consigne', `Votre consigne de démarrage, améliorée dans l'entraîneur`, { type: 'zone', lignes: 6, large: true, ex: `Collez ici la version finale, après l'analyse de l'entraîneur.`, aide: `Facultatif mais recommandé : elle figure dans votre dossier, à côté de la consigne de départ, et montre votre progrès.` })}</div>`)
    + etape('p_depart', `Lancez le projet avec Claude`, '20 min', `<p>Envoyez cette consigne dans votre projet Claude, ou la version améliorée dans l'entraîneur. <b>Avant</b>, écrivez le cadrage initial à l'étape 5 « Journal et références » : le cadrage s'écrit sans IA, avant le premier échange.</p>` + consigne('demarrage', `Consigne de démarrage`)
      + `<p><b>Le plan en cinq lignes.</b> Claude vous propose un plan. Discutez-le, corrigez-le, puis écrivez ici <i>votre</i> plan, pas le sien : cinq étapes, dans l'ordre, avec pour chacune qui s'en charge et ce que vous vérifiez à la main. Ce plan ira dans la section « Le projet » du dossier et sur la diapositive « Notre méthode ». À l'oral, le jury comparera ce plan à ce que vous avez réellement fait : les écarts sont normaux, à condition de les expliquer.</p>
      <div class="champs">${champ('p_plan', `Le plan retenu par le groupe, en cinq lignes`, { type: 'zone', lignes: 6, large: true, requis: true, sansMention: true, ex: `1. Décrire les scénarios (tous, première session) ; vérification : relecture croisée.\n2. Chercher les ordres de grandeur (Prénom, avant le …) ; vérification : une source par chiffre.\n3. …` })}</div>`);
  }
},

/* ── 4. Le travail du projet ── */
{ id: 'travail', nav: '4. Travail du projet', groupe: 1, seance: () => `Entre les deux sessions, jusqu'au dépôt`,
  titre: `Le travail de votre projet`,
  chapo: `La page calcule, vous vérifiez. Chaque résultat se refait à la main au moins une fois, et chaque projet dit ses forces, ses faiblesses et ce qu'il apporte aux autres missions.`,
  rendu: () => projetTravail()
},

/* ── 5. Le journal ── */
{ id: 'journal', nav: '5. Journal et références', groupe: 1, seance: () => `De la première session au dépôt`,
  titre: `Le journal de bord IA`,
  chapo: `Le journal est votre preuve : il montre ce que Claude vous a apporté, ce que vous avez rejeté, et comment vous avez vérifié. Il se remplit au fil de l'eau, en deux minutes par ligne.`,
  rendu: C => bloc(`À quoi sert le journal, et comment le remplir`, `<p><b>À quoi il sert.</b> Le jury ne peut pas voir vos conversations avec Claude. Le journal est la seule trace de votre usage de l'IA. C'est lui qui est noté sur ce critère : sans journal, l'usage de l'IA est plafonné à 1,5 point sur 3. Il montre surtout votre jugement : ce que vous avez rejeté ou corrigé compte plus que ce que vous avez gardé.</p>
      <p><b>Quand ajouter une ligne.</b> Chaque fois que Claude a changé votre travail : une consigne qui a donné un résultat que vous avez utilisé, un résultat que vous avez corrigé, une réponse que vous avez rejetée. Pas besoin de noter « bonjour » ni les reformulations. Une bonne session de travail donne deux à quatre lignes.</p>
      <p><b>Comment.</b> Tout de suite après l'échange, pas le soir. Dans l'ordre : la date, l'outil (« Claude, projet du groupe »), ce que vous vouliez, la phrase de votre consigne qui a fait la différence, ce que Claude a donné, votre décision (gardé, modifié ou rejeté) et pourquoi, puis comment vous avez vérifié : quel document ouvert, à quelle date. Aucune donnée confidentielle ou personnelle.</p>
      <p><b>Trois moments obligatoires.</b> Le cadrage initial, écrit sans IA avant tout. Le journal, au fil de l'eau. Le bilan, avant le dépôt.</p>`)
    + decision('cadrage')
    + etape('j_cadrage', `Cadrage initial, écrit sans IA`, '20 min', `<p>Écrivez à la main, avant d'ouvrir Claude pour le projet. Quelques lignes suffisent. C'est votre point de départ : le jury le comparera à ce que vous présenterez, pour mesurer ce que le travail et l'IA ont changé.</p>
      <div class="champs">${champ('cad_date', `Date d'écriture`, { ex: '14 octobre', requis: true, sansMention: true })}
      ${champ('cad_comprehension', `Notre compréhension du problème`, { type: 'zone', large: true, requis: true, sansMention: true, ex: `Le chantier Rive Nord doit décider jusqu'où numériser. Le problème, c'est …` })}
      ${champ('cad_hypotheses', `Nos hypothèses`, { type: 'zone', large: true, requis: true, sansMention: true, ex: `Nous supposons que … (reprendre « ce qui manque à la fiche »)` })}
      ${champ('cad_attentes', `Ce que nous attendons de l'outil`, { type: 'zone', large: true, requis: true, sansMention: true, ex: `Des pistes de critères, des ordres de grandeur à vérifier, une relecture. Pas la décision.` })}</div>
      <p class="note">Ensuite seulement, vous pouvez demander à Claude de le comparer à son avis. Notez-le dans le journal.</p>` + consigne('cadrage_ia', `Consigne de comparaison (après l'écriture)`))
    + decision('journal')
    + aide(`Exemple de ligne du journal`, tableau(['Date', 'Outil', 'Objectif', 'Consigne clé', 'Résultat obtenu', 'Gardé, modifié ou rejeté, et pourquoi', 'Vérification'], [[
        '14/10', 'Claude, projet du groupe', 'Grille de benchmarking', '« Six critères observables, une source par critère, dis ce que tu ne sais pas »', 'Grille de six critères, deux sources introuvables',
        'Gardé : quatre critères. Rejeté : deux sources, introuvables sur le site indiqué', 'Rapport annuel 2025 ouvert le 15/10 ; sources rejetées non retrouvées']]) + `<p class="note">Exemple du modèle de journal de l'école. Votre propre ligne parle de votre projet.</p>`)
    + bloc(`Le journal de bord`, `<p>Une ligne par usage significatif. Ajoutez des lignes au fil de l'eau avec le bouton en bas. La première ligne est obligatoire, les suivantes comptent pour la note.</p>`
      + Array.from({ length: nJournal() }, (_, i) => blocJournalLigne(i + 1)).join('')
      + `<div class="actions"><button type="button" class="btn plein" data-action="jb-plus">Ajouter une ligne</button></div>`)
    + decision('sources')
    + repere(`Références juridiques à vérifier`, `<p>Voici les thèmes du module. Pour chacun, la fiche de contrôle demande la référence examinée, la source officielle consultée, la date et un verdict : exacte, inexacte, introuvable ou périmée.</p>`
        + tirets(THEMES_JURIDIQUES), ['legifrance', 'daj', 'rgpd', 'ia_ce', 'ia_texte', 'anssi'])
    + etape('j_refs', `Fiche de contrôle des références`, '30 min', `<p>Demandez d'abord à Claude des pistes, puis ouvrez chaque source. Le verdict compte plus que la piste : une référence « introuvable » bien notée vaut mieux qu'une référence copiée sans l'avoir lue.</p>
      <div class="champs">${champ('vr_theme', `Thème en cours`, { type: 'liste', options: THEMES_JURIDIQUES.map(t => [t, t]), sansMention: true })}</div>` + consigne('verif_refs', `Consigne pour obtenir des pistes`) + blocFicheControle())
    + etape('j_bilan', `Bilan, à remplir avant le dépôt`, '15 min', `<p>Trois questions, trois réponses honnêtes de quelques lignes. Elles ferment le journal et nourrissent la diapositive « Les limites ».</p><div class="champs">${champ('bi_perdu', `Ce que nous aurions perdu en travaillant sans IA`, { type: 'zone', large: true, requis: true, sansMention: true })}
      ${champ('bi_gagne', `Ce que nous aurions gagné`, { type: 'zone', large: true, requis: true, sansMention: true })}
      ${champ('bi_pasconfie', `Ce que nous avons volontairement pas confié à l'outil`, { type: 'zone', large: true, requis: true, sansMention: true })}</div>`)
},

/* ── 6. Dépôt ── */
{ id: 'depot', nav: '6. Dépôt et oral', groupe: 2, seance: () => `Dépôt la veille de la dernière session – oral`,
  titre: `Déposez, puis présentez`,
  chapo: `L'état de votre projet, une scène née de vos choix, un diagnostic et l'export. Le dépôt se fait sur Teams, la veille de la dernière session.`,
  rendu: C => scene('s_veille', C)
    + (() => { const D = diagnostic(C); return bloc(D.titre, D.phrases.map(p => `<p>${p}</p>`).join('') + `<h3>Plan d'action</h3>` + D.temps.map(x => `<p class="tt"><b>${x.t}</b></p>${x.a.length ? tirets(x.a) : '<p class="note">Rien de particulier.</p>'}`).join('')
        + `<h3>La question du jury</h3><p>« ${QUESTIONS_JURY[C.faible]} »</p>` + `<div class="champs">${champ('jury_reponse', `Notre réponse`, { type: 'zone', large: true, sansMention: true })}</div>`); })()
    + aide(`La grille de la soutenance`, grilleHtml(), 'aide_grille_depot')
    + etape('dp_support', `Support de présentation`, '', `<p>Dix diapositives au plus, avec les sources et les dates, commun au groupe. Voici le plan, tiré de votre travail. Vous le mettez en forme dans votre outil habituel. Pensez à montrer la mise en œuvre : vos contrôles, vos tests, les modifications importantes.</p>` + consigne('plan_support', `Plan des dix diapositives`) + `<p class="note">Les passages « à compléter » signalent ce qui manque encore. Chaque chiffre porte sa source et sa date.</p>`)
    + etape('dp_relecture', `Relisez avant d'exporter`, '', `<p>Faites relire le journal et la fiche de contrôle par une personne qui n'a pas écrit le dossier.</p>`)
    + etape('dp_pdf', `Exportez le dossier et le journal en PDF`, '', `<p>Le PDF réunit votre identité, le cadrage, le travail du projet, votre journal, la fiche de contrôle des références, le bilan et l'état du projet.</p>
      <div class="actions"><button type="button" class="btn plein" data-action="exporter">Exporter en PDF</button><button type="button" class="btn" data-action="enregistrer">Enregistrer le fichier de projet</button></div>
      <p class="note">Nom du PDF : TNBIM_${esc(cheminNom())}_journal-dossier.pdf. Nom du fichier de projet : ${esc(nomJson())}.</p>`)
    + etape('dp_teams', `Déposez sur Teams`, '', `<p>Au plus tard ${DEPOTL()}, chaque étudiant dépose dans le dossier Teams de son groupe :</p>` + tirets([`son PDF (journal et dossier)`, `son fichier de projet .json`, `le support de présentation commun au groupe (une seule fois, par la personne chargée du support)`])
      + `<p class="note">Vérifiez que les fichiers apparaissent bien dans Teams avant de fermer.</p>`)
}
];
const groupes = () => ['Première session', 'Entre les deux sessions', 'Dépôt et oral'];
