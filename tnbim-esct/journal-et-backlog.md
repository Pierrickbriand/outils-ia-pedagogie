# Journal et backlog – application TNBIM ESCT Nantes

Adresse publiée : https://pierrickbriand.github.io/outils-ia-pedagogie/tnbim-esct/
Sources dans `src/` ; assemblage : `python3 src/build.py` depuis ce dossier.

## Livraison 1 – 13 octobre 2026
Page unique `tnbim-esct/index.html`, même structure technique que l'atelier IA et vente (sources assemblées par `build.py`, sauvegarde locale, fichier de projet .json, export PDF), sans Apps Script ni Gmail.

Contenu : départ, chantier fictif Rive Nord (onze lots, jalons, aléas, fiche .md et .csv), réglage de Claude, choix du projet parmi quatre, cadrage initial sans IA, journal de bord IA aux colonnes du modèle ESCT, fiche de contrôle des références (exacte, inexacte, introuvable, périmée), bilan, scène du jour du dépôt, diagnostic, export PDF, dépôt sur Teams.

## Livraison 1 bis – 13 octobre 2026
Les dates ne sont plus dans le code : chaque étudiant saisit la classe et la date des deux sessions à la page « Départ ».

## Livraison 2 – 13 octobre 2026
Étape « 4. Travail du projet », qui n'affiche que le projet choisi, avec les calculs faits par la page (grille pondérée et test de sensibilité, valeur acquise simplifiée par lot, fiches de veille, charge mensuelle des effectifs). Plan du support de dix diapositives généré depuis le travail, repris en annexe du PDF.

## Livraison 3 – 13 octobre 2026
Recentrage sur les objectifs du module (stratégie de transition numérique : cadrage, benchmarking, cadre juridique, organisation ; la modélisation Revit est enseignée par un autre formateur) :
- les quatre projets deviennent : comparateur de scénarios de transition numérique (critères : coût et délai de mise en place, risque, gain attendu, compétences) ; tableau de bord numérique de chantier (mêmes calculs, plus l'origine numérique des données et ce que le numérique change) ; veille juridique de la transition numérique (six cas : convention BIM, propriété de la maquette, mise à jour de la maquette, chantier connecté et données personnelles, avenant rédigé par une IA, cyberattaque) ; compétences et organisation de la transition numérique (charge, compétences numériques, mesures RH, changements de métiers) ;
- chaque projet reçoit un champ « forces et faiblesses » et un champ sur l'apport aux autres missions ;
- Départ : bloc « Ce que vous allez faire » (travail en groupe, page et projet Claude individuels, trois remises), bloc « La transition numérique du BTP, en bref » (définition, enjeux, impacts métiers et processus, BIM, IoT, IA, technologies émergentes ; le module se consacre à l'IA), sessions sans dates ni horaires, champ « Vous, qui tenez cette page » (Prénom NOM), rôles avec « Prénom NOM », classe avec l'exemple MP2-gpC3 ;
- grille de la soutenance (20 points, sept critères, quatre niveaux, 20 minutes par groupe : 12 d'exposé, 8 de questions), affichée au départ, au dépôt et en annexe du PDF ; réglable dans CONFIG.soutenance ;
- lecture de la fiche du chantier : pourquoi, quelles questions se poser, à quoi sert « ce qui manque à la fiche » (hypothèses, reprises dans le dossier) ;
- Régler Claude : chaque étudiant crée son projet avec les mêmes instructions ; menu « format d'écriture » ; champs « qui nous sommes et notre façon de travailler » et « ce que Claude ne doit jamais faire » préremplis avec des accolades à compléter ; consigne de vérification en huit points ; texte de la fiche en secours si le fichier ne se charge pas ;
- Votre projet : fiche complète de chaque projet ; bloc « Les mêmes objectifs pour tous les groupes » ; explication du plan en cinq lignes ;
- justification des choix en trois phrases guidées ; comparateur expliqué avec trois exemples de scénarios, colonnes au nom des scénarios ; journal : bloc « À quoi sert le journal, et comment le remplir » ;
- noms de fichiers : TNBIM_G3_prenom-nom_… ; le PDF porte le nom de l'étudiant.

## Livraison 3 bis – 13 octobre 2026 (186 Ko), publiée sur GitHub
- Le dépôt n'affiche plus de date : « la veille de la dernière session », partout (bandeau, départ, dépôt, PDF, scène).
- « Entraîneur de prompt » intégré : étape « Entraînez votre consigne de démarrage » dans « 3. Votre projet », avec l'outil affiché dans la page (cadre), un bouton pour l'ouvrir dans un nouvel onglet et un champ pour la consigne améliorée, reprise dans le PDF. L'affichage dans le cadre n'a pas pu être vérifié depuis l'environnement de test (réseau fermé) : à contrôler sur la page publiée.
- Publication dans le dépôt `outils-ia-pedagogie`, dossier `tnbim-esct/` (index.html, journal, sources).
Tests : six écrans, quatre projets, export, sans erreur dans un navigateur de test.

## Réglages (bloc CONFIG de src/01-donnees.js)
- nbGroupes : 6 (aide à la saisie).
- soutenance : 20 minutes par groupe (12 + 8).
- verifieLe : vide. Aucune référence juridique n'est vérifiée.
- Dates connues : gpC3 les 14 octobre et 4 novembre 2026 ; gpC1 les 20 janvier et 3 février 2027 ; gpC2 les 17 et 30 juin 2027. Les étudiants les saisissent.

## Hypothèses prises, à confirmer
- Chaque étudiant tient sa page, son projet Claude, son journal et dépose son propre PDF et son fichier ; le support est commun au groupe.
- « On se consacre à cette dernière » a été lu comme « à l'IA ».
- Grille de la soutenance proposée par Claude, à aligner avec la consigne d'oral existante (critères C1 à C7).

## Chaque année : à changer
nbGroupes, soutenance, verifieLe après relecture des sources officielles, éventuellement le chantier fictif.

## Règle de compatibilité
Ne pas changer les identifiants de champs et de choix pendant qu'un groupe travaille (préfixes : ps_, pc_, pk_ avec ck, pr_ avec rc, jb, fc, cad_, bi_, ip_, id_, p_).

## Backlog
1. Livraison 4 : page correcteur adaptée (lecture des .json par étudiant, journal, fiche de contrôle, grille de notation, export CSV).
2. Relire et vérifier les liens et thèmes juridiques sur les sources officielles, puis renseigner verifieLe.
3. Aligner la grille avec la consigne d'oral C1 à C7 de l'école.
4. Vérifier que l'entraîneur s'affiche bien dans le cadre sur la page publiée ; sinon garder le bouton « nouvel onglet ».
5. Ajouter l'outil à la page d'accueil du dépôt (index.html à la racine), si souhaité.
6. Option : autres fichiers du chantier (planning détaillé, extraits de contrat fictifs).
7. Option : profil de charge des effectifs plus réaliste que l'effectif maximal constant.
