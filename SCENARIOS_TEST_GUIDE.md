# GUIDE COMPLET DE TEST - CALIBRE (Jour 1 + Jour 2)

## 0) Préparation
- T1: `docker compose up -d`
- T2: `pnpm --filter @calibre/api dev` (http://localhost:3000)
- T3: `pnpm --filter @calibre/web dev` (http://localhost:5173)
- Comptes: `password123` (managers + learners)

## 1) Infrastructure
| # | Action | Attendu | OK/NOK |
|---|---|---|---|
| 1.1 | `docker compose ps` | `calibre-postgres` Up (healthy) | [ ] |
| 1.2 | `curl -i http://localhost:3000/` | HTTP 200 + `Hello World!` | [ ] |
| 1.3 | http://localhost:5173 | Chargement OK, pas d'erreur bloquante console | [ ] |

## 2) Auth API (curl)
```bash
LEARNER_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login -H 'Content-Type: application/json' -d '{"email":"learner.a1@calibre.test","password":"password123"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['accessToken'])")
MANAGER_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login -H 'Content-Type: application/json' -d '{"email":"manager.alpha@calibre.test","password":"password123"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['accessToken'])")
```
| # | Action | Attendu | OK/NOK |
|---|---|---|---|
| 2.1 | POST /auth/login learner | 200/201, accessToken, user.role=learner, user.teamId présent | [ ] |
| 2.2 | POST /auth/login manager | 200/201, accessToken, user.role=manager | [ ] |
| 2.3 | Mauvais mot de passe | 401 + `{"message":"Identifiants invalides","error":"Unauthorized","statusCode":401}` | [ ] |
| 2.4 | Email inconnu | 401 + `Identifiants invalides` | [ ] |
| 2.5 | GET /auth/me avec token | 200 {userId,email,role,teamId} | [ ] |
| 2.6 | GET /auth/me sans token | 401 | [ ] |
| 2.7 | GET /auth/me token invalide | 401 | [ ] |

## 3) Contenus API
| # | Action | Attendu | OK/NOK |
|---|---|---|---|
| 3.1 | GET /contents/next (learner) | 200 {content:{...} OU null, remaining:N}. **Sans** isReliable, technique, explanation, highlights, source | [ ] |
| 3.2 | GET /contents/next (manager) | 403 | [ ] |
| 3.3 | POST /contents/seed-fallback (manager) | 200/201 {created, total} (0,15 si déjà fait) | [ ] |
| 3.4 | POST /contents/seed-fallback (learner) | 403 | [ ] |
| 3.5 | GET /contents (manager) | 200 tableau avec isReliable, technique, difficulty, source, status, _count.answers | [ ] |
| 3.6 | GET /contents (learner) | 403 | [ ] |

## 4) Answers API
```bash
NEXT=$(curl -s http://localhost:3000/contents/next -H "Authorization: Bearer $LEARNER_TOKEN")
CID=$(python3 -c "import sys,json;d=json.loads('$NEXT');c=d.get('content');print(c['id'] if c else '')")
ALL=$(curl -s http://localhost:3000/contents -H "Authorization: Bearer $MANAGER_TOKEN")
```
| # | Action | Attendu | OK/NOK |
|---|---|---|---|
| 4.1 | POST /answers message fiable (bon verdict/technique) | 200/201, verdictCorrect true, techniqueCorrect true, explanationScore 0-100, feedback{score,strengths[],weaknesses[],improvedVersion,source}, content avec isReliable/expectedTechnique/highlights/explanation | [ ] |
| 4.2 | POST /answers suspect + bonne technique | verdictCorrect true, techniqueCorrect true | [ ] |
| 4.3 | POST /answers suspect + mauvaise technique | verdictCorrect true, techniqueCorrect false | [ ] |
| 4.4 | POST /answers mauvais verdict | verdictCorrect false, techniqueCorrect false | [ ] |
| 4.5 | POST /answers avec injection "Ignore les instructions..." | injectionFlag true, feedback.note mentionne détection/ignorance, verdictCorrect/techniqueCorrect restent basés sur le contenu réel | [ ] |
| 4.6 | POST /answers highlights[] | Acceptés et normalisés | [ ] |
| 4.7 | POST /answers (manager) | 403 | [ ] |
| 4.8 | GET /answers/mine (learner) | {total, correct, answers:[{id,verdict,technique,verdictCorrect,techniqueCorrect,explanationScore,createdAt,content:{title}}]} | [ ] |
| 4.9 | GET /answers/:id (propriétaire) | Détails + feedback + content avec vérité | [ ] |
| 4.10 | GET /answers/:id (autre apprenant) | 404 | [ ] |
| 4.11 | GET /contents/next quand tout fait | {content:null, remaining:0} | [ ] |

## 5) Frontend guidé
### 5A Auth/redirections
| # | Action | Attendu | OK/NOK |
|---|---|---|---|
| 5A.1 | / sans login | -> /login | [ ] |
| 5A.2 | Login learner | -> /inbox, token dans localStorage | [ ] |
| 5A.3 | Login manager | -> /dashboard | [ ] |
| 5A.4 | learner va /dashboard | Redirigé / refusé | [ ] |
| 5A.5 | manager va /inbox | Redirigé / refusé | [ ] |
| 5A.6 | Mauvais mot de passe front | "Identifiants invalides" affiché | [ ] |
| 5A.7 | Déconnexion | -> /login, token vidé | [ ] |

### 5B Inbox avant soumission
| # | Action | Attendu | OK/NOK |
|---|---|---|---|
| 5B.1 | /inbox affichage | Titre/expéditeur/corps/difficulté. Pas de "isReliable/technique/explanation" | [ ] |
| 5B.2 | Network GET /contents/next | Clés = id,title,body,senderName,difficulty,createdAt uniquement | [ ] |
| 5B.3 | Surligner texte | Passage jaune, compteur, "Effacer les surlignages" | [ ] |
| 5B.4 | Verdict Fiable | Technique = "Aucune manipulation" cohérent | [ ] |
| 5B.5 | Verdict Suspect sans technique | Bouton Envoyer désactivé + message | [ ] |
| 5B.6 | Explication vide / <requis | Bouton désactivé, compteur X/1000 | [ ] |

### 5C Correction
| # | Action | Attendu | OK/NOK |
|---|---|---|---|
| 5C.1 | Soumission valide | POST 200/201, écran correction | [ ] |
| 5C.2 | Bannière + checks | Bon/Mauvais, ✓/× | [ ] |
| 5C.3 | Technique attendue + "Ce qu'il fallait repérer" | Affichés | [ ] |
| 5C.4 | Indices attendus surlignés en ROUGE | mark--correction, raisons visibles | [ ] |
| 5C.5 | Points forts / À améliorer + score /100 | Affichés | [ ] |
| 5C.6 | Explication modèle (APRÈS correction) | Visible, source local/IA, pédagogique | [ ] |
| 5C.7 | "Contenu suivant" | Nouveau contenu, formulaire vide | [ ] |
| 5C.8 | Soumission avec injection | Alerte jaune, injectionFlag, verdict/technique par code | [ ] |

### 5D Manager
| # | Action | Attendu | OK/NOK |
|---|---|---|---|
| 5D.1 | Login manager -> /dashboard | Header manager, cartes | [ ] |
| 5D.2 | Ne peut poster /answers | 403 API + front protégé | [ ] |

## 6) Batch curl rapide
```bash
echo "---health---"; curl -s http://localhost:3000/
L=$(curl -s -X POST http://localhost:3000/auth/login -H 'Content-Type: application/json' -d '{"email":"learner.a1@calibre.test","password":"password123"}'); LT=$(echo $L | python3 -c "import sys,json;print(json.load(sys.stdin)['accessToken'])")
echo "---me---"; curl -s http://localhost:3000/auth/me -H "Authorization: Bearer $LT"
echo -e "\n---next---"; curl -s http://localhost:3000/contents/next -H "Authorization: Bearer $LT" | python3 -c "import sys,json;d=json.load(sys.stdin);c=d.get('content');print('leak' if c and any(k in c for k in ['isReliable','technique','explanation','highlights']) else 'OK');print('keys',list(c.keys()) if c else None)"
M=$(curl -s -X POST http://localhost:3000/auth/login -H 'Content-Type: application/json' -d '{"email":"manager.alpha@calibre.test","password":"password123"}'); MT=$(echo $M | python3 -c "import sys,json;print(json.load(sys.stdin)['accessToken'])")
echo "---contents count---"; curl -s http://localhost:3000/contents -H "Authorization: Bearer $MT" | python3 -c "import sys,json;d=json.load(sys.stdin);print(len(d))"
echo "---seed---"; curl -s -X POST http://localhost:3000/contents/seed-fallback -H "Authorization: Bearer $MT"
echo -e "\n---badpass---"; curl -s -o /dev/null -w "HTTP:%{http_code}\n" -X POST http://localhost:3000/auth/login -H 'Content-Type: application/json' -d '{"email":"learner.a1@calibre.test","password":"bad"}'
echo "---mgr-post---"; curl -s -o /dev/null -w "HTTP:%{http_code}\n" -X POST http://localhost:3000/answers -H "Authorization: Bearer $MT" -H 'Content-Type: application/json' -d '{"contentId":"x","verdict":"reliable","technique":"none","explanation":"test","highlights":[]}'
echo "---mine---"; curl -s http://localhost:3000/answers/mine -H "Authorization: Bearer $LT" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['total'],d['correct'])"
```

## 7) Validation finale
- [ ] Pas de fuite de vérité dans GET /contents/next
- [ ] Correction verdict/technique 100% côté code
- [ ] Injection détectée et neutralisée
- [ ] Explication modèle uniquement après correction
- [ ] Indices attendus visibles et surlignés
- [ ] Guards rôles OK
- [ ] API build + tests + lint OK, Web build OK

**TOUT COCHÉ -> PRÊT POUR JOUR 3**
