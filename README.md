# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

---

# Installation

> Le résumé du projet et le cahier des charges suivent cette section, plus bas.

## Prérequis

| Outil      | Version | Remarque                            |
| ---------- | ------- | ----------------------------------- |
| Node.js    | 22 LTS  | `node -v`                           |
| npm        | 10+     | fourni avec Node                    |
| PostgreSQL | 14+     | voir « Base de données » ci-dessous |

## Démarrage depuis un clone

```bash
git clone <url> music-room
cd music-room

make install     # npm ci dans backend/ et frontend/
make env         # copie les .env.example en .env
```

Puis, dans l'ordre :

```bash
make db-migrate  # applique les migrations Prisma
make seed        # jeu de données de démo, idempotent
make dev         # backend sur :3000 + app Expo
```

`make help` liste toutes les cibles. Les trois ci-dessus sont les seules qui doivent être
lancées dans l'ordre : le seed écrit en base, donc après les migrations.

## Configuration

| Fichier         | Rôle                                                                 |
| --------------- | -------------------------------------------------------------------- |
| `backend/.env`  | secrets serveur : `DATABASE_URL`, `SESSION_SECRET`, clés OAuth, SMTP |
| `frontend/.env` | **uniquement** `EXPO_PUBLIC_API_URL`                                 |

Les deux fichiers sont ignorés par Git. Les `.env.example` documentent chaque variable.

Côté mobile, seule la valeur de `EXPO_PUBLIC_API_URL` change selon la cible :

| Cible             | Valeur                      |
| ----------------- | --------------------------- |
| simulateur iOS    | `http://localhost:3000/api` |
| émulateur Android | `http://10.0.2.2:3000/api`  |
| appareil physique | `http://<ip-lan>:3000/api`  |

Les identifiants OAuth ne vont **pas** dans `frontend/.env` : l'application appelle
`POST /auth/oauth/start` et le serveur construit l'URL du fournisseur. Seul `EXPO_PUBLIC_*`
est lu par l'application, et Expo l'inclue dans le bundle au build.

## Base de données

Le projet fonctionne avec n'importe quel PostgreSQL ; la seule variable requise est :

```
DATABASE_URL="postgres://user:password@host:5432/musicroom?sslmode=disable"
```

Point important pour le développement local : la base fournie par l'environnement de démo
est un PostgreSQL **WASM embarqué**, qui n'accepte qu'un seul client à la fois. Avec cette
base :

- garder `DATABASE_POOL_MAX=1` (valeur par défaut de `.env.example`), sinon le serveur
  répond `501` sur chaque requête ;
- **arrêter le serveur** avant toute commande qui ouvre sa propre connexion
  (`npm run seed`, `prisma studio`, `npm test`) ;
- ne pas lancer deux serveurs en parallèle.

Sur un PostgreSQL réel, `DATABASE_POOL_MAX` se règle librement (10 ou plus) et ces
restrictions disparaissent.

## Jeu de données de démonstration

`make seed` est idempotent : le relancer ne duplique rien. Il crée 4 comptes, tous avec le
mot de passe `Password123!` :

| Compte             | État dans la démo                                           |
| ------------------ | ----------------------------------------------------------- |
| `alice@demo.local` | propriétaire des 2 playlists, de l'event et du device       |
| `bob@demo.local`   | a voté sur l'event, délégation `VIEW` sur le device         |
| `chloe@demo.local` | `VIEWER` de la playlist privée                              |
| `dave@demo.local`  | invitation à l'event **non acceptée** (donc non modifiable) |

Le jeu de données contient aussi une playlist publique, une playlist privée, l'event
`Demo Listening Party` avec 4 pistes et un vote réel, et le device `Demo Speaker` en état
`IDLE`. Ces états existent pour que les règles de permission soient vérifiables dès la
première connexion, sans rien écrire à la main.

Le seed appelle l'API Deezer pour récupérer les aperçus des pistes ; sans réseau il
s'interrompt. Les données déjà présentes en base ne sont pas modifiées.

## Vérifier l'installation

| Commande                     | Résultat attendu                                    |
| ---------------------------- | --------------------------------------------------- |
| `make lint-api`              | document OpenAPI valide, 0 avertissement            |
| `make typecheck`             | aucune erreur TypeScript (backend + frontend)       |
| `make test`                  | backend et frontend passent                         |
| `make lint`                  | ESLint + Prettier propres                           |
| `curl localhost:3000/health` | `{"status":"ok","timestamp":...}`                   |
| `make bench`                 | rapport de charge écrit dans `backend/BENCHMARK.md` |

## Documentation de l'API

- Swagger UI : <http://localhost:3000/api/docs>
- Document brut : <http://localhost:3000/api/openapi.yaml>

Le document décrit les **67 opérations** réellement enregistrées par le routeur (53 paths),
pas une liste théorique. `make lint-api` le valide, et toute route ou `$ref` cassé échoue
à cet endroit plutôt que dans l'interface.

## Performance

`make bench` mesure la charge avec autocannon et écrit `backend/BENCHMARK.md` : débit,
latences p50/p95/p97.5/p99, répartition 2xx/4xx/5xx, CPU et pic de mémoire.

Mesure sur cette machine (12 cœurs, 15 Go de RAM, Node 22, base PostgreSQL WASM embarquée,
pool de 1 connexion) :

| Scénario              | Connexions | Débit      | p50     | p95     | p99     | 2xx   | 4xx | 5xx | CPU   |
| --------------------- | ---------- | ---------- | ------- | ------- | ------- | ----- | --- | --- | ----- |
| `/health` (référence) | 20         | 1963 req/s | 10 ms   | 20 ms   | 27 ms   | 29442 | 0   | 0   | 106 % |
| lecture event         | 20         | 18,7 req/s | 1013 ms | 1198 ms | 1219 ms | 280   | 0   | 0   | 47 %  |
| lecture playlist      | 20         | 20 req/s   | 973 ms  | 1129 ms | 1170 ms | 300   | 0   | 0   | 37 %  |
| vote concurrent       | 20         | 14,7 req/s | 1250 ms | 1590 ms | 1740 ms | 220   | 0   | 0   | 32 %  |
| ajout de piste        | 4          | 2 req/s    | 1027 ms | 1067 ms | 1067 ms | 1     | 3   | 0   | 12 %  |
| déplacement de piste  | 20         | 16 req/s   | 1194 ms | 1396 ms | 1458 ms | 240   | 0   | 0   | 29 %  |
| délégation device     | 20         | 15 req/s   | 1052 ms | 1152 ms | 1166 ms | 20    | 10  | 0   | 21 %  |
| état device délégué   | 20         | 37,3 req/s | 535 ms  | 643 ms  | 668 ms  | 560   | 0   | 0   | 36 %  |
| login                 | 5          | 5 req/s    | 754 ms  | 816 ms  | 816 ms  | 5     | 0   | 0   | 83 %  |

Ce que ces chiffres disent :

- **La base de données est le goulot, pas le HTTP.** `/health` encaisse 1963 req/s et
  sature exactement un cœur (106 %), alors que tout scénario touchant la base est 50 à 100
  fois plus lent. Le coût est dans l'accès aux données, pas dans la couche web.
- **Les latences montent avec la concurrence parce que le pool vaut 1** : chaque requête
  attend son tour en file. p50 est déjà à ~1 s à 20 connexions.
- **Aucune erreur 5xx.** C'est le résultat de la correction du pool : avec un pool plus
  grand, la base WASM renvoyait `P1017 ConnectionClosed` et le serveur répondait `501` sur
  la majorité des requêtes (jusqu'à 323 par série). Les 4xx restants sont des
  `409 Conflict` attendus sur les scénarios d'écriture concurrente, et non des pannes.
- **Ces chiffres ne sont pas une capacité de production.** La base est un PostgreSQL
  embarqué qui n'accepte qu'un client ; il faut rejouer le même script sur un PostgreSQL
  réel avant d'en tirer un nombre d'utilisateurs simultanés. Le rapport
  `backend/BENCHMARK.md` le dit explicitement.

---

# Architecture et choix techniques

## Choix et justification

| Décision          | Choix retenu                | Pourquoi                                                                                                                                                                                                                                                   |
| ----------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Style d'API       | **REST + JSON**             | Le backend est la source de vérité et l'app n'est qu'une télécommande : des ressources nommées (`/user/playlist`) et des verbes HTTP standards suffisent. REST est lisible dans `curl` et générable automatiquement, là où GraphQL n'apporterait rien ici. |
| Base de données   | **PostgreSQL**              | Les votes et les positions de piste doivent garantir l'unicité sous concurrence. Postgres le fait nativement par contrainte d'unicité, alors qu'un choix NoSQL aurait imposé de recoder ce contrôle à la main.                                             |
| Accès aux données | **Prisma**                  | Le schéma est la source de vérité, les migrations sont versionnées, et le client est typé de bout en bout : un changement de schéma casse la compilation plutôt que la production.                                                                         |
| Mobile            | **Expo / React Native**     | Un même code pour iOS et Android, et le web responsive devient un export du même projet.                                                                                                                                                                   |
| Temps réel        | **SSE** unidirectionnel     | Le serveur notifie, le client déclenche les écritures par REST. SSE suffit, tient dans une connexion HTTP standard et se reconnecte seul, là où WebSocket exigerait un protocole bidirectionnel pour un besoin qui n'existe pas.                           |
| Authentification  | **Cookie `HttpOnly` + JWT** | Le cookie n'est pas lisible par le JavaScript de l'app, ce qui ferme le vol de token par XSS. Le JWT permet ensuite à un client mobile de rejouer le même token en `Authorization: Bearer`.                                                                |

## Concurrence

Les trois services concurrentiels sont traités au niveau de la base, et non dans le code
applicatif, pour que la garantie tienne même avec plusieurs instances du serveur :

- **Votes** : contrainte d'unicité sur `(event, user, track)`. Voter deux fois la même
  piste met à jour la ligne au lieu d'en créer une deuxième, et le tri par nombre de votes
  fait remonter la piste la plus votée.
- **Positions de piste** : une version entière par playlist. Une écriture porte
  `expectedVersion` ; si la version a changé entre la lecture et l'écriture, la requête est
  rejetée en `409 Conflict` au lieu d'écraser le travail de l'autre. C'est de
  l'optimistic locking, choisi parce qu'un verrou pessimiste bloquerait un éditeur pendant
  toute la durée de son interaction.
- **Déplacements concurrents** : l'absence de `expectedVersion` reste possible et vaut
  dernier-écrit-gagnant, ce qui est le comportement attendu quand deux personnes déplacent
  la même piste simultanément.

## Sécurité

- Mots de passe hachés avec bcrypt, jamais stockés en clair ni journalisés.
- Session dans un cookie `HttpOnly` + `SameSite`, avec révocation possible côté serveur.
- Token CSRF sur toutes les écritures, comparé en temps constant.
- Rate limiting et anti-bruteforce sur le login, avec journalisation des échecs.
- Un utilisateur n'accède qu'à ses données et à celles qu'il a explicitement acceptées ;
  chaque contrôle est vérifié côté serveur, jamais sur la seule vérité du client.
- Secrets uniquement dans les `.env`, ignorés par Git, avec des `.env.example` documentés.

## Routes implémentées

L'API expose **67 opérations sur 53 paths** :

| Préfixe                | Service                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `/api/auth/*`          | inscription, validation email, reset password, OAuth (42 et Google), échange de session |
| `/api/user/event/*`    | events, pistes suggérées, votes, membres et invitations                                 |
| `/api/user/playlist/*` | playlists, versions, pistes, partage                                                    |
| `/api/user/device/*`   | appareils, délégations, état et contrôle de lecture                                     |
| `/api/user/*`          | profil, visibilité, followers, likes, historique                                        |
| `/api/deezer/*`        | recherche et métadonnées musicales                                                      |
| `/health`              | état du service                                                                         |

La liste exacte, avec méthodes, schémas et exemples, est dans le document OpenAPI
(<http://localhost:3000/api/docs>). Ce document est **généré à partir de la table de routes
réelle** et validé en CI : une route ajoutée sans être documentée, ou un `$ref` cassé, fait
échouer la CI.

## Limites connues

Ces points sont assumés et non masqués :

- **La base de développement est un PostgreSQL embarqué** qui n'accepte qu'un client à la
  fois. Cela contraint le pool à 1 et interdit de lancer deux serveurs en parallèle. Sur un
  PostgreSQL réel, ces restrictions disparaissent et le pool se règle librement.
- **Les chiffres de charge de ce dépôt ne sont pas représentatifs** d'une production : ils
  mesurent la base embarquée. Le protocole est reproductible, pas le résultat.
- **Le SSE ne couvre que la notification de changement.** L'état est relu par REST ; il
  n'y a pas de patch de message ni de reprise de version par événement.
- **Les parcours OAuth, SMTP et la publication en store n'ont pas été validés** dans un
  environnement réel : ils sont couverts par leurs contrats, pas bout en bout.
- **Le hors-ligne n'est pas implémenté** : ni file d'opérations, ni résolution de conflits
  côté client.

## Utilisation de l'IA

L'IA a servi d'assistant de code, pas d'auteur de l'architecture. Concrètement : la structure
du projet, le modèle de données, le choix REST/PostgreSQL/Prisma et les règles de permission
ont été décidés par l'équipe et doivent rester explicables en soutenance. L'IA a produit ou
accéléré des rédactions de tests unitaires, des corrections de types et des suggestions
d'implémentation, qui ont été relues, corrigées et jugées avant d'être conservées.

Ont été refusés après relecture : du code qui fonctionnait mais contournait une règle de
permission, et des suggestions qui déplaçaient la responsabilité vers le client au lieu de
vérifier côté serveur.

---

# Music Room — Résumé du projet

## 🎯 Objectif global

Créer une **solution mobile complète, connectée et collaborative** autour de la musique, avec les contraintes d'un vrai produit :

- Architecture **client/serveur**
- Choix et justification du **stockage de données**
- **API** documentée comme canal de communication
- Gestion de la **montée en charge** et de la **sécurité**
- Intégration de **SDK tiers** (⚠️ le SDK ne doit pas faire le travail à ta place)

---

## 🧩 Périmètre fonctionnel (Mandatory)

### 1. Gestion utilisateur

| Élément             | Détail                                                                               |
| ------------------- | ------------------------------------------------------------------------------------ |
| Inscription         | Email/mot de passe **ou** réseau social (Facebook / Google)                          |
| Liaison de compte   | Lier un compte social après inscription                                              |
| Validation email    | Obligatoire si inscription mail/password                                             |
| Mot de passe oublié | Procédure de réinitialisation                                                        |
| Profil              | 4 niveaux de visibilité : **public**, **amis**, **privé**, **préférences musicales** |

### 2. Les 3 services (⚠️ **2 sur 3 minimum** requis)

**A. Music Track Vote** — Playlist live avec votes

- Suggérer / voter pour la prochaine piste
- Plus de votes = remonte dans la file = jouée plus tôt
- **Visibilité** : public (défaut) / privé (invités seulement)
- **Licences** :
  - Défaut : tout le monde vote
  - Restreint aux invités
  - Restreint **géographiquement + temporellement** (ex. dans un lieu, entre 16h et 18h)
- ⚠️ Gérer la **concurrence** (votes simultanés)

**B. Music Control Delegation** — Délégation du contrôle

- Licence **par device** rattaché au compte
- L'utilisateur délègue le contrôle de la musique à des amis

**C. Music Playlist Editor** — Édition collaborative temps réel

- Création de playlists à plusieurs en live
- **Visibilité** : public (défaut) / privé (invités)
- **Licences** : tout le monde édite (défaut) / invités seulement
- ⚠️ Gérer la **concurrence** (déplacements simultanés de pistes)

### 3. Serveur

- Détient **la vérité** : toutes les données de service y sont stockées
- Techno libre (Node.js, PHP, Go, Firebase…) mais **justifiable**

### 4. API

- Style **REST** conseillé (justifier le choix)
- Format **JSON** conseillé (justifier le choix)
- **Documentation obligatoire** : méthodes, entrées, sorties (ex. Swagger auto-généré)

### 5. Application mobile

- Android **ou** iOS, techno libre
- Doit être une **simple télécommande** du back-end
- **Adresse du back-end configurable** (pour les tests)
- Auth sociale (Facebook/Google) intégrée

### 6. Sécurité

- Un utilisateur authentifié accède **uniquement à ses données**
- Anticiper : bruteforce d'API, vol de session…
- Implémenter des protections **+ identifier et expliquer** les autres risques
- **Logs back-end pour chaque action** : plateforme, device, version d'app
- 🚫 **Aucun credential/clé API dans Git** → `.env` local + `.gitignore` (sinon **échec direct**)

### 7. Montée en charge

- Mesurer et justifier le nombre d'utilisateurs simultanés supportés
- Outils : AB, Gatling, Siege, Tsung, JMeter
- Spécifier les caractéristiques serveur (CPU, RAM, Cloud/On-premise)
- Cohérence attendue : dizaines sur Raspberry, milliers sur petit serveur

### 8. Agilité, qualité, CI

- Travail en équipe, remise en question des décisions
- **Tests spécifiques pour chaque couche**
- Dépendances téléchargeables automatiquement depuis un clone (Makefile ou équivalent)
- 🚫 Pas de librairies non écrites par vous commitées dans le repo

---

## 🌟 Bonus (⚠️ évalués **uniquement si le mandatory est PARFAIT**)

| Bonus            | Description                                                               |
| ---------------- | ------------------------------------------------------------------------- |
| Multi-plateforme | Version web responsive en plus du mobile                                  |
| IoT              | iBeacon : notification auto à l'approche d'un événement public            |
| Freemium         | Abonnement gratuit limité vs payant illimité (ex. Playlist Editor payant) |
| Mode hors-ligne  | Usage offline + synchronisation (conflits, données obsolètes)             |

---

## 🤖 Volet IA

L'IA est un **partenaire de code**, pas un décideur :

- ✅ Bon usage : faire générer des tests unitaires, les **relire et adapter** avec un pair
- ❌ Mauvais usage : faire générer toute l'architecture sans pouvoir l'expliquer → **perte de crédibilité = échec**
- Rester **transparent** sur ce qui a été généré par IA
- Garder le **leadership intellectuel** et privilégier l'intelligence collective de l'équipe

---

## 🗺️ Schéma d'architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENTS                                │
│                                                                 │
│  ┌────────────────────┐        ┌────────────────────┐           │
│  │  APP MOBILE        │        │  WEB RESPONSIVE    │           │
│  │  (Android / iOS)   │        │  (BONUS)           │           │
│  │                    │        │                    │           │
│  │  • Auth sociale    │        │                    │           │
│  │  • "Télécommande"  │        │                    │           │
│  │  • URL back-end    │        │                    │           │
│  │    configurable    │        │                    │           │
│  └─────────┬──────────┘        └─────────┬──────────┘           │
└────────────┼─────────────────────────────┼──────────────────────┘
             │                             │
             │   HTTPS / REST + JSON       │   WebSocket (temps réel)
             │   (Swagger documenté)       │
             ▼                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     COUCHE SÉCURITÉ / GATEWAY                   │
│   Auth (JWT/Session) • Rate limiting • Anti-bruteforce          │
│   Contrôle d'accès (mes données ≠ données des autres)           │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACK-END  (la "vérité")                    │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐        │
│  │ MODULE USER   │  │ MODULE        │  │ MODULE        │        │
│  │               │  │ LICENCES      │  │ LOGS          │        │
│  │ • Inscription │  │               │  │               │        │
│  │ • Valid. mail │  │ • Visibilité  │  │ • Plateforme  │        │
│  │ • Reset MDP   │  │   pub/privé   │  │ • Device      │        │
│  │ • Profil 4    │  │ • Invités     │  │ • Version app │        │
│  │   niveaux     │  │ • Géo + Heure │  │               │        │
│  │ • Link social │  │ • Par device  │  │               │        │
│  └───────────────┘  └───────────────┘  └───────────────┘        │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐        │
│  │ TRACK VOTE    │  │ CONTROL       │  │ PLAYLIST      │        │
│  │               │  │ DELEGATION    │  │ EDITOR        │        │
│  │ • Suggestion  │  │               │  │               │        │
│  │ • Vote        │  │ • Délégation  │  │ • Édition     │        │
│  │ • Tri par     │  │   à des amis  │  │   temps réel  │        │
│  │   votes       │  │ • Licence par │  │ • Multi-user  │        │
│  │ ⚠ CONCURRENCE │  │   device      │  │ ⚠ CONCURRENCE │        │
│  └───────────────┘  └───────────────┘  └───────────────┘        │
└──────────┬─────────────────────────────────────┬────────────────┘
           │                                     │
           ▼                                     ▼
┌────────────────────────┐         ┌──────────────────────────────┐
│   BASE DE DONNÉES      │         │      SDK / API TIERS         │
│                        │         │                              │
│  Users • Profils       │         │  • Facebook Login            │
│  Events • Playlists    │         │  • Google Login              │
│  Votes • Licences      │         │  • Fournisseur musique       │
│  Devices • Logs        │         │    (Deezer/Spotify...)       │
└────────────────────────┘         └──────────────────────────────┘

           ┌─────────────────────────────────────────┐
           │      QUALITÉ & OUTILLAGE (transverse)   │
           │  Makefile • .env + .gitignore           │
           │  Tests par couche • CI                  │
           │  Load testing (AB/Gatling/JMeter)       │
           │  Swagger                                │
           └─────────────────────────────────────────┘
```

---

## ✅ Checklist de rendu

- [ ] Tout dans le repo Git (seul le contenu du repo est évalué)
- [ ] Noms de dossiers/fichiers vérifiés
- [ ] `.env` ignoré par Git, aucun secret exposé
- [ ] Dépendances installables via `make` depuis un clone frais
- [ ] Documentation API accessible
- [ ] Mandatory 100 % fonctionnel avant de toucher aux bonus
