# 🔧 Configurazione Google Auth - Guida Completa

## PASSO 1: OAuth Consent Screen

**URL:** https://console.cloud.google.com/apis/credentials/consent?project=app-fitness-fabio-iarno

### Configurazione OAuth Consent Screen:
```
User Type: External
App name: App Fitness Fabio & Iarno
User support email: [IL TUO EMAIL]
Developer contact information: [IL TUO EMAIL]

App domain (opzionale):
- Application home page: https://app-fitness-fabio-iarno.web.app
- Application privacy policy: https://app-fitness-fabio-iarno.web.app/privacy
- Application terms of service: https://app-fitness-fabio-iarno.web.app/terms

Scopes: (mantieni quelli di default)
- ../auth/userinfo.email
- ../auth/userinfo.profile
- openid

Test users: [AGGIUNGI IL TUO EMAIL]
```

## PASSO 2: OAuth Credentials

**URL:** https://console.cloud.google.com/apis/credentials?project=app-fitness-fabio-iarno

### Crea OAuth 2.0 Client ID:
```
Application type: Web application
Name: App Fitness Web Client

Authorized JavaScript origins:
https://app-fitness-fabio-iarno.web.app
http://localhost:3000
http://localhost:5173

Authorized redirect URIs:
https://app-fitness-fabio-iarno.web.app/__/auth/handler
http://localhost:3000/__/auth/handler
http://localhost:5173/__/auth/handler
```

## PASSO 3: Firebase Authorized Domains

**URL:** https://console.firebase.google.com/project/app-fitness-fabio-iarno/authentication/settings

### Verifica domini autorizzati:
```
✅ localhost
✅ app-fitness-fabio-iarno.web.app
```

## PASSO 4: Test

1. Vai su: https://app-fitness-fabio-iarno.web.app
2. Click "Continua con Google"
3. Dovrebbe aprire popup Google senza errori
4. Seleziona account e autorizza
5. Dovrebbe completare login

## 🚨 RISOLUZIONE PROBLEMI

### Errore "unauthorized-domain":
- Verifica domini autorizzati in Firebase Console
- Controlla JavaScript origins in Google Cloud

### Errore "redirect_uri_mismatch":
- Verifica redirect URIs in Google Cloud Console
- Deve includere /__/auth/handler

### Errore "access_blocked":
- OAuth Consent Screen deve essere configurato
- User Type deve essere "External"
- App deve essere in stato "Testing" o "Production"

## 📝 CHECKLIST COMPLETO

- [ ] OAuth Consent Screen configurato
- [ ] OAuth 2.0 Client ID creato
- [ ] JavaScript origins configurati
- [ ] Redirect URIs configurati
- [ ] Firebase authorized domains verificati
- [ ] Test Google login funzionante

## 🎯 RISULTATO ATTESO

Dopo la configurazione, il Google login dovrebbe funzionare senza errori:
- Click su "Continua con Google"
- Popup Google si apre
- Selezione account
- Autorizzazione app
- Login completato
- Onboarding o dashboard mostrati