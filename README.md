Progetto 80 – App Fitness (Vite + React + Firebase)

Setup locale
- Requisiti: Node 18+ (consigliato 20), npm
- Installazione: `npm install`
- Variabili env: copia `.env.example` in `.env.local` e compila con i valori Firebase (Vite usa prefisso `VITE_`)
- Sviluppo: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Emulazione (Hosting + Firestore Rules): `npm run emulate`

Firebase
- Abilita Authentication → Anonymous
- Firestore: crea il DB in modalità produzione
- Hosting: crea il sito (es. <project-id>.web.app)
- Regole Firestore: deploy con `npx firebase deploy --only firestore:rules`

Configurazione deploy automatico (GitHub Actions)
1) Crea il repository su GitHub e push del codice
2) In GitHub → Settings → Secrets and variables → Actions → New repository secret, aggiungi:
   - FIREBASE_PROJECT_ID: ID del progetto Firebase
   - FIREBASE_SERVICE_ACCOUNT: JSON della chiave di un Service Account con ruoli minimi:
     - Firebase Hosting Admin (deploy hosting)
     - Firebase Rules Admin (deploy rules)
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID (uguale a FIREBASE_PROJECT_ID)
   - VITE_FIREBASE_STORAGE_BUCKET
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID
3) Il workflow `.github/workflows/firebase-hosting.yml`:
   - Allinea le env in `.env.production`
   - Esegue build
   - Su PR: deploy su canale preview temporaneo
   - Su push su `main`: deploy Firestore rules + Hosting canale `live`

Script npm
- `dev`: avvia Vite
- `build`: build produzione
- `preview`: anteprima produzione
- `deploy`: build + deploy hosting (richiede firebase CLI e accesso locale)
- `emulate`: avvia emulatori hosting+firestore

Struttura Firestore
- Progress giornaliero: `users/{user.name}/progress/{YYYY-MM-DD}`
- Stati persistenti generici: `users/{user.name}/state/{key}` con `{ value: any, updatedAt }`

Note sicurezza
- In produzione è consigliabile usare `request.auth.uid` anziché `user.name` per partizionare i dati.
- Le regole attuali consentono accesso a utenti autenticati (anonimi inclusi); raffinarle per ownership per UID.

