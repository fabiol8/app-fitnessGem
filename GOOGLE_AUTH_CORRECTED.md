# 🔧 Configurazione Google Auth - VERSIONE CORRETTA

## ⚠️ CONFIGURAZIONE CORRETTA OAUTH 2.0 CLIENT ID

Google NON accetta `http://localhost:3000`. Usa solo questi:

### Authorized JavaScript origins:
```
https://app-fitness-fabio-iarno.web.app
http://localhost:5173
```

### Authorized redirect URIs:
```
https://app-fitness-fabio-iarno.web.app/__/auth/handler
http://localhost:5173/__/auth/handler
```

## ❌ NON INCLUDERE:
- `http://localhost:3000` (INVALIDO)
- Altri domini localhost

## ✅ MOTIVO:
- Google OAuth richiede HTTPS per domini pubblici
- Per localhost accetta solo porte specifiche (5173 è la porta Vite)
- Port 3000 non è supportata da Google OAuth

## 🎯 CONFIGURAZIONE FINALE:

1. **OAuth Consent Screen:**
   - App name: `App Fitness Fabio & Iarno`
   - User Type: `External`
   - User support email: [TUO EMAIL]
   - Developer contact: [TUO EMAIL]

2. **OAuth 2.0 Client ID:**
   - Application type: `Web application`
   - Name: `App Fitness Web Client`
   - JavaScript origins: SOLO i 2 domini sopra
   - Redirect URIs: SOLO i 2 URI sopra

3. **Firebase Authorized Domains:**
   - `localhost` ✅
   - `app-fitness-fabio-iarno.web.app` ✅

## 🧪 TEST:
Dopo configurazione: https://app-fitness-fabio-iarno.web.app
Click "Continua con Google" - dovrebbe funzionare!