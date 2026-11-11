# 🔴🔵 Tripizi

**Les escapades entre potes, sans le chaos du groupe WhatsApp.** (anciennement Mes Cons, ex-Bandaway)

Tripizi permet d'organiser des vacances ou un week-end prolongé à plusieurs :

- 📅 **Dates** — on définit une période, chacun coche ses jours (dispo / peut-être / pas dispo), et l'app calcule automatiquement **le meilleur créneau** pour la bande.
- 🏡 **Logements** — on colle des liens Airbnb, Booking, Abritel… avec le prix ; l'app calcule le **coût par personne** et chacun vote ❤️. Le favori remonte en tête.
- 💶 **Dépenses** — comme Tricount : qui a payé, pour qui (parts égales), soldes de chacun et liste simplifiée de « qui rembourse qui » ; bouton *Réglé* pour enregistrer un remboursement.
- 👥 **Bande** — on invite ses amis avec un **code à 6 caractères** (comme Tricount), on voit qui a rempli ses dispos.

Thème bleu marine / rouge / blanc (couleurs PSG), glassmorphism, 100 % mobile, fonctionne hors ligne.

---

## 📲 Obtenir l'APK via GitHub (sans rien installer)

1. Crée un dépôt vide sur [github.com/new](https://github.com/new) (ex. `bandaway`).
2. Envoie ce dossier dans le dépôt :
   ```bash
   cd bandaway
   git init && git add . && git commit -m "Bandaway v1"
   git branch -M main
   git remote add origin https://github.com/TON-PSEUDO/bandaway.git
   git push -u origin main
   ```
   *(ou, sur le site GitHub : « Add file › Upload files » et glisse tout le contenu du dossier, y compris le dossier caché `.github`)*
3. Va dans l'onglet **Actions** : le workflow **Build Android APK** se lance tout seul (~5 min).
4. Une fois terminé, l'APK est disponible :
   - dans l'onglet **Releases** → `Tripizi.apk` ✅
   - ou dans le run Actions → section **Artifacts**.
5. Sur ton téléphone Android : télécharge `Tripizi.apk`, ouvre-le et autorise « Installer des applis inconnues ».

Chaque `git push` sur `main` recompile une nouvelle version.

---

## 🍏 iPhone (version web installable)

Tripizi tourne aussi sur iPhone, sans App Store : **https://fred09021985.github.io/bandaway/app/**

1. Ouvre le lien dans **Safari**.
2. Touche **Partager** ⬆️ puis **Sur l'écran d'accueil** → l'icône Tripizi apparaît, l'app s'ouvre en plein écran.
3. Mêmes données (Firestore) que la version Android : Android et iPhone partagent les mêmes escapades.

À chaque push sur `main`, GitHub Actions recopie l'app dans `docs/app` : les iPhone ont la nouvelle version au prochain lancement. Les liens d'invitation détectent l'iPhone et proposent la version web.

---

## 🔄 Mises à jour automatiques (sans réinstaller)

L'app intègre [Capgo](https://github.com/Cap-go/capacitor-updater) en mode **auto-hébergé** (aucun compte, aucun serveur tiers) :

1. Tu modifies le code et tu pousses sur `main`.
2. GitHub Actions compile l'APK **et** publie `update.zip` (le contenu de `www/`) dans la release `build-N`.
3. Au lancement, chaque téléphone interroge la dernière release GitHub ; si `N` est plus grand que sa version, il télécharge `update.zip` et affiche **« Nouvelle version prête — Redémarrer »** (sinon la mise à jour s'applique au prochain lancement).
4. Si une version plante au démarrage, l'app revient automatiquement à la précédente.

⚠️ Seul le **code web** (écrans, couleurs, calculs, textes) se met à jour ainsi. Changer le **nom**, l'**icône** ou ajouter un **module natif** nécessite que chacun réinstalle l'APK.

---

## 💬 Avis des utilisateurs

Dans l'app : **« Une idée pour améliorer Tripizi ? »** (accueil) ou **Mon profil → Donner mon avis**. Trois types : 💡 Idée, 🐞 Bug, ❤️ J'aime.

Les avis arrivent dans Firestore, collection **`feedback`** (type, message, pseudo, version de l'app, date). Les utilisateurs peuvent seulement en **envoyer** ; pour les **lire** : [console Firebase → Firestore → Données → feedback](https://console.firebase.google.com/project/bandaway/firestore/databases/-default-/data/~2Ffeedback).

---

## ☁️ Activer la synchronisation entre amis (gratuit, 5 min)

Par défaut l'app tourne en **mode démo local** (données sur un seul téléphone). Pour que chaque ami voie les dispos et les logements des autres **en temps réel**, branche une base Firebase gratuite :

1. Va sur [console.firebase.google.com](https://console.firebase.google.com) → **Ajouter un projet** (Analytics inutile).
2. Menu **Build › Firestore Database** → **Créer une base de données** → mode production → région `europe-west`.
3. Onglet **Règles**, colle ceci puis **Publier** :
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /trips/{code} {
         allow get, create, update: if code.size() == 6;
         allow list, delete: if false;
       }
       match /feedback/{id} {
         allow create: if request.resource.data.keys().hasOnly(['type', 'message', 'name', 'uid', 'version', 'at'])
           && request.resource.data.type in ['idea', 'bug', 'love']
           && request.resource.data.message is string
           && request.resource.data.message.size() >= 3
           && request.resource.data.message.size() <= 1000
           && request.resource.data.name is string
           && request.resource.data.name.size() <= 20
           && request.resource.data.at == request.time;
         allow read, update, delete: if false;
       }
     }
   }
   ```
   *(Les voyages ne sont accessibles qu'à ceux qui connaissent le code ; personne ne peut lister ni supprimer les voyages.)*
4. **⚙️ Paramètres du projet › Vos applications** → icône **Web `</>`** → enregistre l'app → copie l'objet `firebaseConfig`.
5. Colle-le dans [`www/js/config.js`](www/js/config.js) à la place de `null`, commit et push → GitHub recompile l'APK avec la synchro activée.

---

## 🛠️ Développement

```bash
npm install
npm run serve          # aperçu dans le navigateur : http://localhost:8080
npm run icons          # régénère l'icône et le splash (assets/)
npm run build:vendor   # rebundle Firebase
```

Compiler l'APK en local (nécessite Android Studio / SDK + Java 21) :
```bash
npx cap add android
npx capacitor-assets generate --android
npx cap sync android
cd android && ./gradlew assembleDebug
```

**Stack :** HTML/CSS/JS sans framework · Capacitor 8 (Android) · Firebase Firestore (optionnel) · GitHub Actions.

| Fichier | Rôle |
|---|---|
| `www/js/app.js` | Écrans, logique (meilleur créneau, prix par personne, votes) |
| `www/js/store.js` | Données : Firestore temps réel ou stockage local |
| `www/js/config.js` | Ta config Firebase |
| `www/css/app.css` | Design néon / glassmorphism |
| `.github/workflows/android.yml` | Compilation automatique de l'APK |
