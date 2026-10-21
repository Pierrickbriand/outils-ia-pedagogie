# Atelier IA et vente – journal et backlog

Page HTML unique (`index.html`, environ 160 Ko) pour le module « Stratégies avancées d'utilisation de l'IA dans les métiers de la vente », Mastère MIA PC 2, 14 h : 13 octobre et 27 novembre 2026. Hébergement prévu sur GitHub Pages.

## Cadrage validé le 12 octobre 2026
- Équipes de deux ou trois pour réfléchir ; chaque étudiant utilise la page et construit son application seul.
- Fil rouge : l'entreprise d'alternance, avec des données fictives.
- Accès à Claude : formule gratuite par défaut (cinq projets, messages limités).
- Technique : page HTML d'abord, Apps Script pour les plus rapides.
- Module noté : mini-dossier PDF déposé sur le LMS (retour d'usage, retour sur investissement, éthique, cadre légal), puis présentation de l'application le 27 novembre.

## Livraison 1 (12 octobre 2026)
- Socle : barre « Nouveau, Ouvrir, Enregistrer, Exporter » (Alt + N, Alt + O, Ctrl ou ⌘ + S, Ctrl ou ⌘ + E), sauvegarde automatique sur l'appareil, fichier de projet .json, export PDF par la fenêtre d'impression, rappel d'enregistrement après 60 modifications et vers 11 h 45 et 16 h 15.
- Neuf chapitres : Départ, Régler Claude, Fil rouge, Atelier 1 (cibler et personnaliser), Atelier 2 (expérience client), Fabrique, Mini-dossier, Diagnostic et export, aperçu de la séance 2.
- État du projet : quatre jauges (risque juridique, charge de travail, confiance, sobriété), départ à 40, 40, 50, 50. Un parcours prudent finit vers 15, 55, 85, 85 : la prudence coûte du temps.
- Choix à justifier, trois scènes à variantes, une question du jury tirée de la jauge la plus faible, alertes, plan d'action et diagnostic différents selon les choix (contenu remplacé par la livraison 1 bis).
- Jeux de données fictifs calculés à partir du nom de l'étudiant : 36 clients (trois anomalies volontaires) et 24 messages (ironie, données personnelles, cas sensibles).
- Treize idées d'application, cahier de commande, consignes de cadrage, construction, contrôle et modification.
- Six schémas dessinés. Pour ajouter une capture réelle, déposer dans un dossier `captures/` du dépôt un fichier nommé : `claude-parametres.png`, `claude-instructions.png`, `claude-projet.png`, `claude-artefact.png`, `sheets-extensions.png`, `apps-script-editeur.png`. La capture s'affiche alors sous le schéma, sans toucher au code.
- Aucune ressource externe chargée : pas de police ni de script distant.

## Livraison 1 bis (12 octobre 2026, 21 h 30) : choix d'ingénieur d'affaires
- Les étudiants sont des ingénieurs d'affaires : vente d'affaires longues à des entreprises.
- Dix choix à justifier, sur le cycle d'une affaire : données, ciblage des comptes, qualification d'une affaire, cahier des charges d'un appel d'offres, prix et remise, transcription des réunions, périmètre, technique, présentation d'un chiffre à la direction, preuve du retour sur investissement.
- Trois scènes réécrites, onze variantes : appel d'offres (fuite, décideur fiché, affaire écartée par le score, pression de la direction), client clé (réunion enregistrée, remise de 18 %, méfiance, réclamation), dix jours avant la présentation (données réelles, retard, chiffre sans fourchette, outil prêt).
- La variante « méfiance » se déclenche par l'état du projet (confiance à 40 ou moins), pas par un choix précis.
- Plan d'action séquencé en trois temps : cette semaine, avant le 27 novembre, après le module. Trois actions au plus par temps.
- Septième question de qualification légale : documents confidentiels d'un client ou de l'entreprise.
- Banque d'idées : « Grille de décision d'appel d'offres » remplace « Plan de tournée ».
- Les exercices des ateliers, le socle et le dossier n'ont pas changé. Un fichier de projet enregistré avec la livraison 1 se rouvre, mais ses anciens choix sont ignorés.
- Sources ajoutées : Code de commerce, article L151-1 (secret des affaires) ; CNIL, réutilisation des données accessibles en ligne (2020) ; CNIL, questions-réponses sur l'IA générative (2024) ; CNIL, information des personnes.

## Mise en ligne (12 octobre 2026, 22 h 10)
- Dépôt : `Pierrickbriand/outils-ia-pedagogie`, branche `main`, dossier `atelier-ia-vente/` (comme les trois autres outils hébergés dans le portail).
- Adresse : https://pierrickbriand.github.io/outils-ia-pedagogie/atelier-ia-vente/
- La page d'accueil du portail n'a pas été modifiée : aucun lien vers l'atelier.
- Les captures d'écran se déposent dans `atelier-ia-vente/captures/`.
- Création d'un dépôt impossible depuis une session Claude : pour un dépôt dédié, Pierrick crée le dépôt vide, puis la page y est déplacée.

## Livraison 1 ter (13 octobre 2026, 10 h 45) : protections, publiées pendant la séance
- Jeux de données figés (`S.jeu` : nom et type de clients) dès la première visite d'un atelier avec un nom rempli, ou dès la copie d'un jeu. Un étudiant déjà avancé garde exactement son jeu.
- « Nouveau » enregistre d'office le fichier de projet (`…_avant-effacement_date.json`) et garde une copie sur l'appareil ; la page « Départ » propose alors « Récupérer ce projet ».
- Avertissement du navigateur à la fermeture ou au rechargement après dix saisies sans fichier de projet. Dernières saisies écrites à la fermeture.
- « Exporter » annonce le taux de remplissage et les étapes incomplètes, avec « Voir ce qui manque » ou « Exporter quand même ».
- PDF : nom de l'étudiant et numéro de page en pied (navigateurs de type Chrome ; ignoré sans erreur ailleurs).
- Compatibilité vérifiée : travail saisi sur la version précédente puis rechargé sur la nouvelle (champs, choix, scènes, jauges et jeux identiques) ; ancien fichier de projet rouvert.
- Décision de Pierrick : pas de pause dans le déroulé, les étudiants avancent à leur rythme.
- Non fait, volontairement : lien depuis le portail (les parcours n'y figurent pas), jeu de messages « vente entre professionnels » (réservé à la prochaine promotion), tests Safari et Firefox (navigateurs absents de l'environnement de test).
- Règle pour toute mise à jour pendant qu'un groupe travaille : ne jamais changer les identifiants des champs et des choix, les effets des choix, ni la fabrication des jeux.

## Livraison 1 quater (13 octobre 2026, 11 h 45) : dépôt de fichiers
- Le fichier de projet est mieux expliqué sur la page « Départ » : ce que c'est, à quoi il sert, ce qu'on en fait (enregistrer, ranger, rouvrir) et ce qu'on n'en fait pas (pas de dépôt sur le LMS, pas de collage dans Claude). Même rappel à l'étape « Enregistre ton fichier de projet ».
- Glisser-déposer du fichier de projet n'importe où sur la page, avec la même confirmation que « Ouvrir ». Un fichier de données déposé au mauvais endroit ne fait plus quitter la page : un message explique où le déposer.
- Zone d'essai dans la Fabrique : l'étudiant glisse un .xlsx ou un .csv et voit lignes, colonnes, cellules vides, aperçu de cinq lignes, avec une alerte si des colonnes semblent personnelles. Rien n'est enregistré dans le projet ni envoyé.
- Lecteur `lireTableur` écrit à la main (aucune bibliothèque) : CSV (séparateurs `;`, virgule, tabulation, guillemets), Excel .xlsx (première feuille, dates converties en AAAA-MM-JJ, textes partagés, caractères spéciaux). Testé sur un fichier openpyxl et sur un fichier réenregistré par LibreOffice. Limites : première feuille seulement, .xls ancien et fichiers protégés refusés avec un message, pas de zip64, 15 Mo au plus.
- Case « Mon outil lit un fichier Excel ou CSV que je glisse » à l'étape de construction : si elle est cochée, la consigne ajoute les exigences de la zone de dépôt et le code de `lireTableur` à recopier tel quel. Non applicable à la voie Apps Script.
- Treizième idée : « Préparateur de négociation sur fichier » (elle coche la case de dépôt).
- Rappel de fin de séance (vers 11 h 45 et 16 h 15) : il demande aussi d'envoyer le fichier à sa propre adresse ou de le mettre dans le Drive, même si le fichier est déjà enregistré ; bouton « Copie faite » (silence 90 minutes). Le message après « Enregistrer » le redit.
- Bouton « Retirer cette idée » sur l'idée choisie (Fabrique) : repart d'un cahier de commande vide. Seuls les champs encore identiques au texte de l'idée sont vidés ; ceux que l'étudiant a modifiés sont conservés, et la confirmation les nomme.
- Étape « En équipe : choisis ton idée » : phrase d'entrée pour ceux qui ont déjà une idée (la présenter à l'équipe pour l'éprouver, puis passer au cahier) et note disant que le choix préremplit quatre champs sur huit. La case « Fait » de cette étape ne compte pas dans le taux de remplissage du dossier, seulement dans le pourcentage du parcours.
- Bouton « Télécharger le cahier (.md) » sous le cahier de commande : fichier `cahier-de-commande_<outil>.md` (huit champs, ambition de la version 1, base technique ; « à compléter » pour les vides) à ajouter aux fichiers de contexte du projet Claude. Le cahier reste aussi intégré à la consigne de cadrage, qui fonctionne sans le fichier. Le fichier est à retélécharger et remplacer après chaque modification du cahier.
- Bouton « Effacer tous les champs » sous le cahier de commande : vide les huit champs et retire l'idée choisie, après confirmation. Les choix, les corrections au plan et le reste du projet ne bougent pas.
- Atelier 1 : bloc d'introduction « Avant de commencer » (à quoi sert l'atelier, quelles données utiliser, ce qui est rendu dans le dossier). Ce n'est pas une étape : aucun effet sur le taux de remplissage. Le lien avec le projet du groupe reste indirect : l'atelier est un terrain d'entraînement commun, et l'étudiant fait le lien dans « Ce que tu retiens pour ton application ».
- Obligatoire et facultatif, ateliers 1 et 2 : « Partie 1 : entraînement » (facultatif : jeu de données, analyse, vérification, Segmenteur, messages ; classement, mesure d'erreur et outil de l'atelier 2) et « Partie 2 : pour ton dossier et ton outil » (obligatoire : règles, choix, scène, trace). Étiquettes « Entraînement · facultatif » et « Obligatoire » sur les étapes. Les champs d'entraînement ne sont plus exigés : ils sortent du taux de remplissage, de « Ce qui manque » et des compteurs du menu (les étapes d'entraînement cochées ne comptent plus). Le dossier PDF n'affiche la mesure d'erreur que si elle est renseignée. Rien de ce qui est saisi n'est effacé ; identifiants et effets inchangés.
- Aide contextuelle repliable (menus déroulants, fermés par défaut) : « Comment marche cette page », « Ce qui est noté », « Déroulé indicatif », « Pour progresser : l'entraîneur de consignes », « Avant de commencer » (atelier 1), « Ce que l'IA fait bien, ce qu'elle fait mal », et les six schémas (« Voir le schéma… »). Restent ouverts : les repères juridiques, « Ce que le dossier doit montrer », les consignes. Pictogramme « i » devant chaque aide repliable (dessiné en SVG, aucune ressource externe). L'état ouvert ou fermé est gardé en mémoire pendant la visite, pas dans le projet.
- Navigation et compréhension (cinq ajouts) :
  - bandeau « Ta prochaine étape » en haut de chaque page : première étape obligatoire incomplète du parcours (étape non cochée ou champs manquants, choix ou justification, scène, champ isolé, justification de qualification légale), nombre de points obligatoires restants, bouton « Y aller » qui change de chapitre et se place sur la cible. À la fin : « Tout l'obligatoire est fait » et bouton vers l'export. Cohérent avec « Ce qui manque » du diagnostic (vérifié sur un projet complet simulé) ;
  - aide repliable « Mon écran ne ressemble pas au schéma » (chapitres « Régler Claude » et « Ta fabrique ») : nouveau type de projet Claude, ajout de fichiers impossible, aperçu d'artefact absent, travail perdu sur la page ;
  - glossaire repliable de 19 termes (Départ, ateliers 1 et 2, dossier) ;
  - compteur sur chaque étape à champs obligatoires (« 2 champs à remplir », puis « Rempli »), mis à jour à la saisie. La case « Fait » ne se coche pas toute seule ;
  - étiquette « avec entraînement facultatif » sous les ateliers 1 et 2 dans le menu de gauche.
  Aucun identifiant, choix ni effet modifié : le travail déjà saisi est intact.
- Compatibilité vérifiée : champs, choix, faits et jeux de données identiques après passage de l'ancienne version à la nouvelle. Aucun identifiant ni effet modifié.
- À tester par Pierrick : la zone de dépôt générée par Claude dans l'aperçu d'artefact (la lecture .xlsx dépend de `DecompressionStream` dans le navigateur) ; Safari et Firefox non testés.

## Livraison 1 quinquies (13 octobre 2026) : envoi par e-mail et réglages annuels
- Étape « Envoie ton travail à ton formateur » dans le diagnostic : bouton qui ouvre la messagerie (adresse, objet et corps préremplis avec nom et équipe), liens Gmail et Outlook, copie du message. Le fichier de projet est enregistré au clic. Une page web ne peut pas joindre de fichier : l'étudiant ajoute le PDF et le .json lui-même, et une fenêtre le lui dit.
- Bloc `CONFIG` en tête de `01-donnees.js` : dates des deux séances, horaire, date de vérification juridique, adresse du formateur, mode de remise (`'e-mail'` ou `'LMS'`), intitulé du module. Tous les textes datés s'en déduisent, y compris la date de base des données fictives (séance 1 moins 28 jours) et le titre de la scène « dix jours avant ».
- Testé : rendu 2026 identique, rendu 2027 sans ancienne date, remise LMS sans bouton, compatibilité avec la version en ligne (champs, choix, scènes, jeu identiques).

### Chaque année : à changer
1. Dans `CONFIG` : `seance1`, `seance2`, `horaire` si besoin, `remise`, `formateurMail`.
2. Relire les repères juridiques datés, puis changer `verifieLe` : article 50 du règlement sur l'IA (2 août 2026), démarchage téléphonique (11 août 2026), report des systèmes à haut risque (2 décembre 2027, règlement (UE) 2026/1744), liens des sources dans `SOURCES`. Ces dates ne se mettent pas à jour seules.
3. Relire la page « Départ » (déroulé indicatif) et le texte « Ce qui est noté ».
4. Reconstruire, tester, publier.

## Livraison 1 sexies (13 octobre 2026) : aide sur les règles de calcul, auto-évaluation
- Aide repliable sous « Règles de calcul » du cahier de commande (trois questions, exemples, cas « aucun calcul »).
- Étape « Auto-évalue ton dossier » avant l'export du PDF : six critères (outil clair et borné, outil testé, gain chiffré avec prudence, éthique et cadre légal, choix justifiés, dossier propre et complet), trois niveaux sans chiffre (acquis, à renforcer, pas encore), lien « Reprendre cette partie ». Réponses enregistrées dans le fichier de projet sous `ae1` à `ae6`, non comptées dans la progression.
- Les critères sont un premier jet, sans barème officiel. À recaler quand le barème sera fixé : liste `CRITERES_AE` dans `05-chapitres.js`.

## Livraison 1 septies (13 octobre 2026) : compatibilité Safari et Firefox
- Safari et Firefox n'ont pas pu être lancés dans l'environnement de travail (seul Chromium est installé, téléchargement bloqué). Revue du code : aucune fonction récente à risque repérée (pas de lookbehind, `at`, `replaceAll`, `:has`).
- Lecture des .xlsx : si le navigateur ne sait pas décompresser seul (`DecompressionStream` absent ou sans `deflate-raw`), une décompression écrite à la main prend le relais. Résultat identique au mode natif sur un classeur de 4 000 lignes. Le même code est copié dans la consigne de construction.
- Glisser-déposer : Safari ne renseigne pas `relatedTarget` à la sortie ; le masque de dépôt attend désormais 150 ms sans survol.
- Reste à faire à la main sur un Mac : test de la liste ci-dessous.

## Livraison 2 bis (13 octobre 2026) : correcteur pour le formateur
- Page `atelier-ia-vente/correcteur/index.html`, construite avec le même code que l'application (`build_correcteur.py`, sources 01 à 06 et `08-correcteur.js`). Les fichiers .json glissés restent dans le navigateur, rien n'est envoyé.
- Tableau triable : dossier rempli, éléments manquants, choix, tests, retours d'usage, auto-évaluation (A, R, P), gain en heures, alertes, date d'enregistrement. Doublons fusionnés (le plus récent est gardé), fichiers invalides signalés.
- Détail par étudiant : ce qui manque par chapitre, alertes, auto-évaluation, dossier complet, notes de correction (gardées dans le navigateur du formateur) et export CSV du tableau avec les notes.
- Les calculs reprennent ceux de l'application : si un champ obligatoire change dans l'application, le correcteur doit être reconstruit.

## Livraison 2 ter (13 octobre 2026) : zone d'essai du fichier de données
- Après le dépôt d'un .xlsx ou .csv : tableau « Ce que ton outil recevra » (type de chaque colonne, cellules vides, exemple), aperçu, « Les points d'attention » (cellules vides, unités dans les nombres, virgule et point mélangés, valeurs non numériques, formats de date mélangés, écritures variables, lignes en double, valeurs répétées dans la première colonne, colonnes personnelles) et description prête à coller.
- Le bouton « Copier la description » copie le texte ; rien n'est écrit dans le cahier sans l'étudiant. Un second bouton mène au champ « Données en entrée ».
- Le fichier n'est toujours pas conservé : il n'y a donc pas de bouton d'enregistrement.
- Limites : détection par règles simples sur toutes les lignes, première feuille seulement ; une colonne d'identifiants numériques peut être classée « nombre ».

## Livraison 2 quater (13 octobre 2026) : aide sur la limite d'usage, vérification du PDF
- Aide repliable « Claude me dit que j'ai atteint ma limite » sur les pages Régler Claude, Départ, ateliers 1 et 2, Fabrique et mini-dossier. Source : page d'aide de Claude sur l'usage gratuit (limite par session, remise à zéro toutes les cinq heures, nombre de messages variable selon l'affluence). À relire si Anthropic change ces règles.
- PDF d'export vérifié sur un dossier vide (6 pages) et un dossier saturé de texte (19 pages) : un titre de section restait seul en bas de page, corrigé ; les lignes de tableau et les éléments de liste ne se coupent plus entre deux pages.
- Reste : une cellule de tableau très longue peut encore occuper plusieurs pages ; le texte du pied de page (nom et numéro de page) dépend du navigateur.

## Repères juridiques vérifiés le 12 octobre 2026
- Règlement sur l'IA : pratiques interdites depuis le 2 février 2025, transparence (article 50) depuis le 2 août 2026, haut risque reporté au 2 décembre 2027 par le règlement (UE) 2026/1744. Source : Commission européenne.
- RGPD : profilage et article 22, droit d'opposition. Source : CNIL.
- Prospection par e-mail et SMS : fiche CNIL mise à jour le 10 juin 2026.
- Démarchage téléphonique : consentement préalable depuis le 11 août 2026 (loi du 30 juin 2025, décret du 23 juillet 2026). Source : DGCCRF.
- Point laissé en question aux étudiants : l'analyse d'avis écrits relève-t-elle de la « reconnaissance des émotions » ?
- Non vérifié sur Légifrance même (page inaccessible) : le texte de l'article L151-1 vient d'un document de l'Autorité de la concurrence. Les articles sur la divulgation illicite ne sont pas cités dans la page.

## À vérifier par Pierrick
- Les six schémas, face à l'écran réel de Claude et de Google.
- Le déroulé indicatif du 13 octobre (page « Départ ») : pas de pause prévue l'après-midi.
- Le barème : la page renvoie au formateur.

## Backlog
- Bouton « Je suis bloqué » : e-mail prérempli avec l'étape en cours.
- Aide repliable « Clé API » dans la Fabrique (si validée).
- Livraison 2 avant le 27 novembre : atelier 3 (prévision des ventes, jeu de 24 mois), atelier 4 (évolution du métier, plan de compétences), deuxième fonction de l'application, déroulé de la présentation.
- Ajouter les deux autres outils de la suite (détecteur de biais, simulateur de confidentialité) quand leurs adresses seront connues.
- Tester sur Safari et Firefox, à la main : seuls les tests sur Chromium sont faits (1 440, 1 100 et 390 pixels de large).
- Option : suivi de classe en direct par Google Sheets et Apps Script.
- Pour toute modification, repartir du fichier `atelier-ia-vente/index.html` du dépôt `outils-ia-pedagogie`.

## Livraison 2 quinquies – 21 octobre 2026 (soir) : fenêtre « Bon retour »
- Après 30 minutes d'absence (rechargement ou retour sur l'onglet), une fenêtre rappelle la dernière visite, l'endroit où l'étudiant s'était arrêté, l'avancement du parcours, sa prochaine étape (même calcul que le bandeau « Ta prochaine étape ») et l'état de son fichier de projet. Boutons « Reprendre où je m'étais arrêté », « Aller à la prochaine étape », « Fermer ».
- Code ajouté à la fin du script de `atelier-ia-vente/index.html` (fonction `bonRetour`). Seule écriture : l'heure de la dernière visite sous la clé `atelier-ia-vente-v1-derniere-visite`. Aucun identifiant, choix, effet ni jeu de données modifié ; le correcteur n'est pas touché.
- Testé dans un navigateur (Chromium) : pas de fenêtre sans travail, fenêtre après une absence simulée de deux heures, pas de nouvelle fenêtre au rechargement immédiat, état de l'étudiant identique. Publié (dépôt outils-ia-pedagogie, commit b43912e), avant la séance du 27 novembre.
