#!/bin/bash

# Script di configurazione automatica Google OAuth
# Esegui: chmod +x setup-google-oauth.sh && ./setup-google-oauth.sh

echo "🔧 Setup Google OAuth per App Fitness"
echo "======================================"

PROJECT_ID="app-fitness-fabio-iarno"
APP_URL="https://app-fitness-fabio-iarno.web.app"

echo ""
echo "🔗 LINK DIRETTI PER CONFIGURAZIONE:"
echo ""

echo "1. OAuth Consent Screen:"
echo "   https://console.cloud.google.com/apis/credentials/consent?project=$PROJECT_ID"
echo ""

echo "2. Crea OAuth 2.0 Client ID:"
echo "   https://console.cloud.google.com/apis/credentials/create/oauth-client-id?project=$PROJECT_ID"
echo ""

echo "3. Verifica Firebase Authorized Domains:"
echo "   https://console.firebase.google.com/project/$PROJECT_ID/authentication/settings"
echo ""

echo "📋 CONFIGURAZIONI DA COPIARE:"
echo ""

echo "OAuth Consent Screen:"
echo "---------------------"
echo "App name: App Fitness Fabio & Iarno"
echo "User support email: [IL TUO EMAIL]"
echo "Developer contact: [IL TUO EMAIL]"
echo "User Type: External"
echo ""

echo "OAuth 2.0 Client ID:"
echo "--------------------"
echo "Application type: Web application"
echo "Name: App Fitness Web Client"
echo ""
echo "Authorized JavaScript origins:"
echo "$APP_URL"
echo "http://localhost:3000"
echo "http://localhost:5173"
echo ""
echo "Authorized redirect URIs:"
echo "$APP_URL/__/auth/handler"
echo "http://localhost:3000/__/auth/handler"
echo "http://localhost:5173/__/auth/handler"
echo ""

echo "Firebase Authorized Domains (verifica che ci siano):"
echo "---------------------------------------------------"
echo "localhost"
echo "app-fitness-fabio-iarno.web.app"
echo ""

echo "🧪 TEST FINALE:"
echo "Dopo la configurazione, testa su: $APP_URL"
echo "Click 'Continua con Google' - dovrebbe funzionare senza errori!"
echo ""

echo "📁 File di riferimento creati:"
echo "- GOOGLE_AUTH_SETUP.md (guida dettagliata)"
echo "- verify-google-auth.cjs (script di verifica)"
echo ""

# Apri automaticamente i link se su macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    read -p "Aprire i link automaticamente nel browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Apertura link..."
        open "https://console.cloud.google.com/apis/credentials/consent?project=$PROJECT_ID"
        sleep 2
        open "https://console.cloud.google.com/apis/credentials/create/oauth-client-id?project=$PROJECT_ID"
        sleep 2
        open "https://console.firebase.google.com/project/$PROJECT_ID/authentication/settings"
    fi
fi

echo "✅ Setup completato! Segui le istruzioni sopra."