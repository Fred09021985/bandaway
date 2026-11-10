# 🏔️ Bandaway

**Les escapades entre potes, sans le chaos du groupe WhatsApp.**

Bandaway permet d'organiser des vacances ou un week-end prolongé à plusieurs :

- 📅 **Dates** — on définit une période, chacun coche ses jours (dispo / peut-être / pas dispo), et l'app calcule automatiquement **le meilleur créneau** pour la bande.
- 🏡 **Logements** — on colle des liens Airbnb, Booking, Abritel… avec le prix ; l'app calcule le **coût par personne** et chacun vote ❤️. Le favori remonte en tête.
- 👥 **Bande** — on invite ses amis avec un **code à 6 caractères** (comme Tricount), on voit qui a rempli ses dispos.

Design sombre néon (glassmorphism, aurore animée), 100 % mobile, fonctionne hors ligne.

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
   - dans l'onglet **Releases** → `Bandaway.apk` ✅
   - ou dans le run Actions → section **Artifacts**.
5. Sur ton téléphone Android : télécharge `Bandaway.apk`, ouvre-le et autorise « Installer des applis inconnues ».

Chaque `git push` sur `main` recompile une nouvelle version.

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
