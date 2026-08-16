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

| Élément | Détail |
|---|---|
| Inscription | Email/mot de passe **ou** réseau social (Facebook / Google) |
| Liaison de compte | Lier un compte social après inscription |
| Validation email | Obligatoire si inscription mail/password |
| Mot de passe oublié | Procédure de réinitialisation |
| Profil | 4 niveaux de visibilité : **public**, **amis**, **privé**, **préférences musicales** |

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

| Bonus | Description |
|---|---|
| Multi-plateforme | Version web responsive en plus du mobile |
| IoT | iBeacon : notification auto à l'approche d'un événement public |
| Freemium | Abonnement gratuit limité vs payant illimité (ex. Playlist Editor payant) |
| Mode hors-ligne | Usage offline + synchronisation (conflits, données obsolètes) |

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