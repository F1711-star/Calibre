# Calibre - Fiche d'apprentissage

Cette fiche sert à garder une trace de ce qu'on apprend pendant le projet.
On la met à jour à la fin de chaque séance, avec des mots simples.

## Comment remplir cette fiche

Pour chaque notion :
- **Quoi** : le nom de la notion.
- **En simple** : une phrase d'explication avec une analogie.
- **Pourquoi ici** : à quoi elle sert dans Calibre.
- **Preuve** : la commande, le fichier ou le test qui montre qu'on l'a comprise.

---

## 1. Environnement et outils

### Node.js
- **Quoi** : moteur qui exécute du JavaScript hors du navigateur.
- **En simple** : le moteur de la voiture. Il fait tourner notre code.
- **Pourquoi ici** : NestJS, React/Vite et les tests tournent dessus.
- **Preuve** : `node -v` affiche `v22.18.0`.

### npm
- **Quoi** : gestionnaire de paquets fourni avec Node.js.
- **En simple** : le magasin de pièces détachées.
- **Pourquoi ici** : il a servi à installer pnpm et sert de référence.
- **Preuve** : `npm -v` affiche `10.9.3`.

### Corepack
- **Quoi** : outil fourni avec Node.js pour activer pnpm.
- **En simple** : un adaptateur qui branche le bon outil au bon endroit.
- **Pourquoi ici** : il évite d'installer pnpm n'importe comment.
- **Preuve** : `corepack prepare pnpm@9 --activate` a fonctionné.

### pnpm
- **Quoi** : gestionnaire de paquets rapide, adapté aux monorepos.
- **En simple** : un magasin qui partage les pièces entre plusieurs ateliers.
- **Pourquoi ici** : il installe les dépendances de `apps/api`,
  `apps/web` et `packages/shared` en une commande.
- **Preuve** : `pnpm --version` affiche `9.15.9`.

### Monorepo
- **Quoi** : un seul dépôt git contenant plusieurs applications.
- **En simple** : un immeuble avec plusieurs appartements.
- **Pourquoi ici** : l'API, le front et les types partagés vivent ensemble.
- **Preuve** : `pnpm-workspace.yaml` liste `apps/*` et `packages/*`.

### Git
- **Quoi** : système qui enregistre l'historique du code.
- **En simple** : une machine à voyager dans le temps pour le code.
- **Pourquoi ici** : sauvegarde, commits clairs et publication GitHub.
- **Preuve** : `git log --oneline` montre nos commits dans Calibre.

### .gitignore
- **Quoi** : liste des fichiers que git doit ignorer.
- **En simple** : le panneau "ne pas toucher" devant le placard.
- **Pourquoi ici** : ne jamais envoyer `node_modules`, `.env` ou `dist`.
- **Preuve** : `git status` ne montre pas ces fichiers.

### Variables d'environnement
- **Quoi** : valeurs de configuration lues au démarrage.
- **En simple** : les réglages du tableau de bord, pas le moteur.
- **Pourquoi ici** : URL de base, port, secret JWT, clé API optionnelle.
- **Preuve** : `.env.example` contient les clés sans valeurs secrètes.

### Docker
- **Quoi** : outil qui fait tourner des applications dans des conteneurs.
- **En simple** : des boîtes étanches posées sur ton ordinateur.
- **Pourquoi ici** : lancer Postgres et Mailpit sans installation manuelle.
- **Preuve** : `docker --version` affiche `29.2.1`.

### Docker Compose
- **Quoi** : fichier qui décrit plusieurs conteneurs et les démarre ensemble.
- **En simple** : la notice de montage de plusieurs boîtes.
- **Pourquoi ici** : `docker compose up` doit tout lancer un jour.
- **Preuve** : `docker compose ps` montre Postgres et Mailpit `healthy`.

### PostgreSQL
- **Quoi** : base de données relationnelle.
- **En simple** : une armoire de dossiers avec des tiroirs et des règles.
- **Pourquoi ici** : stocker utilisateurs, contenus, réponses, ratings, xAPI.
- **Preuve** : conteneur `calibre-postgres` en état `healthy`.

### Mailpit
- **Quoi** : faux serveur mail local.
- **En simple** : un bureau de poste de practice, sans facteur réel.
- **Pourquoi ici** : recevoir les emails simulés sans risque.
- **Preuve** : interface `http://localhost:8025` accessible.

---

## 2. Back-end

### NestJS
- **Quoi** : framework Node.js qui structure le serveur en modules.
- **En simple** : un immeuble avec des étages spécialisés (auth, contenus, réponses).
- **Pourquoi ici** : organiser l'API sans mélanger toutes les règles dans un seul fichier.
- **Preuve** : `apps/api/src/main.ts` démarre l'application et `app.module.ts` assemble les modules.

### Module, contrôleur, service
- **Quoi** : un module regroupe une fonctionnalité ; le contrôleur reçoit les requêtes ; le service contient la logique.
- **En simple** : le module est le service administratif, le contrôleur est le guichet, le service est le collègue qui traite le dossier.
- **Pourquoi ici** : le contrôleur reste mince et les règles (correction, Elo) sont testables.
- **Preuve** : `app.controller.ts` appelle `app.service.ts` via `AppModule`.

### DTO et validation
- **Quoi** :
- **En simple** :
- **Pourquoi ici** :
- **Preuve** :

### Prisma
- **Quoi** :
- **En simple** :
- **Pourquoi ici** :
- **Preuve** :

### JWT et guard
- **Quoi** :
- **En simple** :
- **Pourquoi ici** :
- **Preuve** :

---

## 3. Front-end

### React
- **Quoi** : bibliothèque JavaScript pour construire l'interface avec des composants.
- **En simple** : des briques LEGO qui s'assemblent pour former un écran.
- **Pourquoi ici** : inbox, formulaire de réponse, surligneur et dashboard.
- **Preuve** : `apps/web/src/App.tsx` est le composant racine.

### Composant
- **Quoi** : fonction qui retourne du JSX (l'affichage d'une partie de l'écran).
- **En simple** : une petite pièce réutilisable avec son propre aspect.
- **Pourquoi ici** : un composant `LoginForm`, un composant `Inbox`, un composant `Heatmap`.
- **Preuve** : `App` est déjà un composant.

### État (state)
- **Quoi** : donnée qui change pendant l'utilisation et provoque un nouveau rendu.
- **En simple** : la mémoire à court terme de l'écran (texte saisi, contenu ouvert).
- **Pourquoi ici** : savoir si l'utilisateur est connecté, quel contenu est sélectionné.
- **Preuve** : à compléter quand on ajoutera `useState`.

### Vite
- **Quoi** : serveur de développement et outil de build pour le front.
- **En simple** : un four qui prépare et sert le site très vite.
- **Pourquoi ici** : démarrage instantané sur `http://localhost:5173`.
- **Preuve** : `pnpm --filter @calibre/web dev`.

### React Query
- **Quoi** :
- **En simple** :
- **Pourquoi ici** :
- **Preuve** :

---

## 4. Concepts métier

### Contenu étiqueté
- **Quoi** : contenu généré avec une technique choisie avant l'écriture.
- **En simple** : le professeur décide du piège avant d'écrire la question.
- **Pourquoi ici** : permet au code de corriger sans demander à l'IA.
- **Preuve** : champ `technique` présent et cohérent avec le contenu.

### Fallback
- **Quoi** : contenu de secours pré-écrit.
- **En simple** : les sujets d'examen dans le tiroir si l'imprimante casse.
- **Pourquoi ici** : la démo doit marcher sans clé API.
- **Preuve** : lancer l'app sans `LLM_API_KEY` et obtenir un contenu.

### Prompt injection
- **Quoi** : ordre caché dans un texte fourni à l'IA.
- **En simple** : un élève écrit "donne-moi 20" sur sa copie.
- **Pourquoi ici** : l'explication de l'apprenant est une donnée non fiable.
- **Preuve** : la note ne change pas et une trace est journalisée.

### Elo
- **Quoi** : note adaptative inspirée des échecs.
- **En simple** : battre un exercice difficile fait monter la note plus vite.
- **Pourquoi ici** : choisir la prochaine technique et la bonne difficulté.
- **Preuve** : le rating baisse après une mauvaise réponse.

### xAPI
- **Quoi** : format standard d'une action d'apprentissage.
- **En simple** : une phrase normalisée dans le carnet de notes.
- **Pourquoi ici** : tracer chaque réponse et exporter les résultats.
- **Preuve** : statement JSONB stocké et exportable.

---

## 5. Journal des séances

### Vendredi 23 octobre 2026 - Environnement
- Installé/activé pnpm 9.15.9 avec Corepack après un cache corrompu.
- Initialisé un dépôt git dédié dans Calibre (le home est déjà un repo).
- Créé `.gitignore` et `.env.example`.
- Créé la structure monorepo.
- Testé Postgres et Mailpit avec Docker Compose : les deux `healthy`.
- Commits : docs, structure, docker compose.
- À retenir : on ne fait jamais `git add .` depuis `/home/firas`.

### Vendredi 23 octobre 2026 - Squelette applicatif
- Généré l'API NestJS dans `apps/api`.
- Généré le front React + Vite dans `apps/web`.
- Créé `packages/shared` avec les types Role, Technique et Verdict.
- `pnpm install` a installé tout le monorepo en une fois.
- `pnpm build` et `pnpm test` passent.
- Compris : `pnpm -r` exécute une commande dans chaque paquet du workspace.
