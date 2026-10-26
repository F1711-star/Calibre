# Décisions techniques

## Architecture

- **Monorepo (pnpm workspaces)** : partage des types et schémas entre API et front, installation unique, déploiement cohérent.
- **NestJS** : structure modulaire (Auth, Contents, Answers, Xapi, Stats), guards/roles natifs, facile à tester et à faire évoluer.
- **React + Vite** : rapide en dev, build léger, parfait pour un MVP.
- **Prisma + PostgreSQL** : schéma clair, typage fort, JSONB pour les statements xAPI.

## Règles métier

- **Le code décide, pas l'IA** : `verdictCorrect` et `techniqueCorrect` sont calculés côté serveur en comparant la réponse avec le contenu réel. L'IA n'évalue que l'explication.
- **Explication traitée comme donnée** : délimitation dans le prompt, détection d'injection, validation de la sortie JSON, score plafonné entre 0-100.
- **App fonctionne sans clé API** : banque de 15 contenus de secours (70 % manipulés / 30 % fiables) + correcteur local.
- **Tous les contenus fictifs** : pas de vraies marques/personnes, contenus écrits à la main pour la banque de secours.
- **Rôles côté serveur** : les guards vérifient systématiquement le rôle (apprenant ne peut pas poster en tant que manager, etc.).

## Adaptation & analytics

- **Elo par technique** : initialisé à 1000, K=24, difficulté convertie en rating. Prochain contenu cible la technique la plus faible.
- **xAPI** : statement `answered` par réponse, stocké en JSONB pour traçabilité.
- **Confidentialité** : score de maturité masqué si l'équipe a < 5 apprenants.
- **Sélection du contenu** : ~30 % de fiables, sinon cible la faiblesse de l'apprenant avec repli vers d'autres techniques si indisponible.

## Ce qu'on a coupé / prévu

- **SCORM 1.2** : déclaré prévu, hors périmètre du MVP actuel.
- **Génération LLM en temps réel** : remplacée par une banque de secours fiable pour garantir la démo sans clé.
- **Microservices / Redis** : surdimensionné pour un MVP de 5 jours.
