# Calibre

Plateforme d'entraînement adaptatif à la détection de désinformation et de
contenu manipulé.

## Problème

Les employés reçoivent chaque jour des contenus qui peuvent être faux ou
manipulés. Les formations classiques ne mesurent pas leur capacité réelle à
détecter une manipulation. Calibre propose un entraînement pratique, progressif
et mesurable, sur des contenus fictifs.

## Fonctionnalités prévues

- Boîte mail simulée avec contenus fiables et manipulés.
- Verdict, technique, explication et surlignage des passages suspects.
- Correction du verdict et de la technique par le code.
- Notation de l'explication par LLM, avec version améliorée.
- Difficulté adaptative de type Elo par technique.
- Statements xAPI stockés en JSONB et exportables.
- Tableau de bord manager : équipe x technique.

## Stack

- API : NestJS + TypeScript + Prisma
- Front : React + Vite + TypeScript
- Base : PostgreSQL 16
- Emails : Mailpit
- Infra : Docker Compose

## Démarrage

À compléter au fil du projet.

```bash
cp .env.example .env
pnpm install
docker compose up -d
```

- API : http://localhost:3000
- Front : http://localhost:5173
- Mailpit : http://localhost:8025

## Structure

```text
apps/
  api/       API NestJS
  web/       Front React
packages/
  shared/    Types et schémas partagés
docs/
  appris.md  Fiche d'apprentissage
  decisions.md
docker-compose.yml
plan.txt
```

## Tests

```bash
pnpm test
```

## Statut

Projet en construction. Voir `plan.txt` pour la feuille de route complète.
