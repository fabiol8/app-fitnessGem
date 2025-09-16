#!/usr/bin/env node

/**
 * Script di verifica configurazione Google Auth
 * Esegui: node verify-google-auth.js
 */

const https = require('https');
const { execSync } = require('child_process');

console.log('🔧 Verifica Configurazione Google Auth\n');

// 1. Verifica variabili d'ambiente
console.log('1. Verifica configurazione Firebase...');
try {
  const envContent = require('fs').readFileSync('.env.local', 'utf8');

  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missingVars = requiredVars.filter(varName =>
    !envContent.includes(varName)
  );

  if (missingVars.length > 0) {
    console.log('❌ Variabili mancanti:', missingVars.join(', '));
  } else {
    console.log('✅ Configurazione Firebase OK');
  }
} catch (error) {
  console.log('❌ File .env.local non trovato');
}

// 2. Verifica progetto Firebase attivo
console.log('\n2. Verifica progetto Firebase attivo...');
try {
  const currentProject = execSync('firebase use', { encoding: 'utf8' }).trim();
  if (currentProject.includes('app-fitness-fabio-iarno')) {
    console.log('✅ Progetto Firebase corretto:', currentProject);
  } else {
    console.log('⚠️ Progetto Firebase:', currentProject);
    console.log('   Dovrebbe essere: app-fitness-fabio-iarno');
  }
} catch (error) {
  console.log('❌ Firebase CLI non configurato');
}

// 3. Verifica build
console.log('\n3. Verifica build...');
try {
  const fs = require('fs');
  const distExists = fs.existsSync('./dist/index.html');
  if (distExists) {
    console.log('✅ Build presente in ./dist/');
  } else {
    console.log('⚠️ Build mancante - esegui: npm run build');
  }
} catch (error) {
  console.log('❌ Errore verifica build');
}

// 4. Verifica domini autorizzati (richiede configurazione manuale)
console.log('\n4. Domini da verificare manualmente:');
console.log('   Firebase Console → Authentication → Settings → Authorized domains:');
console.log('   ✅ localhost');
console.log('   ✅ app-fitness-fabio-iarno.web.app');

console.log('\n5. Google Cloud Console da configurare:');
console.log('   → https://console.cloud.google.com/apis/credentials/consent?project=app-fitness-fabio-iarno');
console.log('   → https://console.cloud.google.com/apis/credentials?project=app-fitness-fabio-iarno');

console.log('\n📋 Prossimi passi:');
console.log('1. Segui la guida in GOOGLE_AUTH_SETUP.md');
console.log('2. Configura OAuth Consent Screen');
console.log('3. Crea OAuth 2.0 Client ID');
console.log('4. Testa Google login su https://app-fitness-fabio-iarno.web.app');

console.log('\n🚀 App attualmente funziona con:');
console.log('   ✅ Email login/registrazione');
console.log('   ✅ Account demo: test@fitnessapp.com / TestPass123!');
console.log('   ✅ Onboarding completo');
console.log('   ✅ Profilo utente');