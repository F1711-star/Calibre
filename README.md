# Calibre

Plateforme d'entraînement adaptatif à la détection de désinformation et de contenu manipulé.

## Problème

Les employés reçoivent chaque jour des contenus qui peuvent être faux ou manipulés. Les formations classiques ne mesurent pas leur capacité réelle à détecter une manipulation. Calibre propose un entraînement pratique, progressif et mesurable, sur des contenus fictifs.

## Fonctionnalités

- **Boîte mail simulée** : l'apprenant analyse des messages fictifs (70 % manipulés, 30 % fiables).
- **Analyse guidée** : verdict (fiable/suspect), technique de manipulation, explication et surlignage des passages suspects.
- **Correction déterministe** : le code compare verdict et technique avec la vérité du contenu. L'IA ne décide jamais.
- **Notation de l'explication** : notée par un correcteur (local si pas de clé LLM), avec points forts/faiblesses et une **explication modèle** affichée uniquement après la correction.
- **Protection contre l'injection** : l'explication est traitée comme une donnée, les tentatives d'injection sont détectées et journalisées.
- **Adaptatif** : difficulté Elo par technique, le prochain contenu cible la technique la plus faible.
- **xAPI** : chaque réponse génère un statement xAPI stocké en JSONB, exportable.
- **Tableau de bord manager** : heatmap par équipe/technique, top contributeurs, score de maturité masqué si < 5 apprenants.
- **Fonctionne sans clé API** : banque de secours intégrée, démarrage possible hors ligne.

## Stack

- **API** : NestJS + TypeScript + Prisma
- **Front** : React + Vite + TypeScript
- **Base** : PostgreSQL 16
- **Emails** : Mailpit
- **Infra** : Docker Compose
- **Validation** : Zod/class-validator
- **Tests** : Vitest + Supertest

## Comptes de démonstration

Tous avec le mot de passe `password123` :

| Email | Rôle | Équipe |
|---|---|---|
| `learner.a1@calibre.test` | Apprenant | team-a |
| `learner.a2@calibre.test` | Apprenant | team-a |
| `learner.a3@calibre.test` | Apprenant | team-a |
| `learner.a4@calibre.test` | Apprenant | team-a |
| `learner.a5@calibre.test` | Apprenant | team-a |
| `learner.a6@calibre.test` | Apprenant | team-a |
| `manager.alpha@calibre.test` | Manager | team-a |

## Démarrage rapide

```bash
# 1) Cloner et configurer
git clone <repo> calibre
cd calibre
cp .env.example .env

# 2) Installer les dépendances
corepack enable && corepack prepare pnpm@latest --activate
pnpm install

# 3) Lancer l'infrastructure + app
docker compose up --build
```

Services disponibles :

- **Front** : http://localhost:5173
- **API** : http://localhost:3000
- **Mailpit** : http://localhost:8025
- **Postgres** : localhost:5432

> L'API peuple automatiquement la banque de secours au premier démarrage s'il n'y a pas de contenus. Tout fonctionne sans clé LLM.

## Développement local (sans docker complet)

```bash
docker compose up -d postgres mailpit
pnpm --filter @calibre/api prisma migrate deploy
pnpm --filter @calibre/api prisma db seed
pnpm dev
```

## Tests

```bash
pnpm test
pnpm -r build
```

## Architecture

```text
apps/
  api/       API NestJS (auth, contents, answers, xapi, stats)
  web/       Front React (login, inbox, dashboard)
packages/
  shared/    Types partagés
docker/
docs/
  appris.md
  decisions.md
docker-compose.yml
```

## Limites

- SCORM 1.2 : prévu, non implémenté dans ce MVP.
- LLM optionnel : uniquement pour noter l'explication et proposer une version améliorée.
- Données 100 % fictives.

Voir `docs/appris.md` pour le journal d'apprentissage et `docs/decisions.md` pour les choix d'architecture.
