#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🧪 Testing FitnessApp MultiUser System...\n');

// Test 1: Build Test
console.log('1️⃣ Testing production build...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build successful');
} catch (error) {
  console.log('❌ Build failed:', error.message);
  process.exit(1);
}

// Test 2: Check key files exist
console.log('\n2️⃣ Checking component files...');
const requiredFiles = [
  'src/App.jsx',
  'src/MultiUserApp.jsx',
  'src/AuthenticatedApp.jsx',
  'src/components/AuthGuard.jsx',
  'src/components/ProtectedRoute.jsx',
  'src/features/auth/hooks/useAuth.js',
  'src/features/auth/services/authService.js',
  'src/features/auth/components/LoginForm.jsx',
  'src/features/auth/components/RegisterForm.jsx',
  'src/features/onboarding/components/OnboardingFlow.jsx',
  'src/firebase.js'
];

let missingFiles = [];
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.log(`\n❌ ${missingFiles.length} files missing!`);
  process.exit(1);
}

// Test 3: Check environment variables
console.log('\n3️⃣ Checking Firebase configuration...');
const envFile = '.env.local';
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  let missingVars = [];
  for (const variable of requiredVars) {
    if (envContent.includes(variable)) {
      console.log(`✅ ${variable}`);
    } else {
      console.log(`❌ ${variable} - MISSING`);
      missingVars.push(variable);
    }
  }

  if (missingVars.length > 0) {
    console.log(`\n⚠️  ${missingVars.length} Firebase variables missing!`);
  }
} else {
  console.log('⚠️  .env.local file missing - Firebase features may not work');
}

// Test 4: Check imports syntax
console.log('\n4️⃣ Checking component imports...');
try {
  // Check main app file
  const appContent = fs.readFileSync('src/App.jsx', 'utf8');
  if (appContent.includes('import MultiUserApp')) {
    console.log('✅ App.jsx imports MultiUserApp correctly');
  } else {
    console.log('❌ App.jsx missing MultiUserApp import');
  }

  // Check MultiUserApp file
  const multiAppContent = fs.readFileSync('src/MultiUserApp.jsx', 'utf8');
  const expectedImports = ['AuthGuard', 'AuthenticatedApp', 'SplashScreen'];
  for (const importName of expectedImports) {
    if (multiAppContent.includes(importName)) {
      console.log(`✅ MultiUserApp imports ${importName} correctly`);
    } else {
      console.log(`❌ MultiUserApp missing ${importName} import`);
    }
  }
} catch (error) {
  console.log('❌ Error reading component files:', error.message);
}

// Test 5: Package.json scripts
console.log('\n5️⃣ Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['dev', 'build', 'preview'];
for (const script of requiredScripts) {
  if (packageJson.scripts[script]) {
    console.log(`✅ Script "${script}" available`);
  } else {
    console.log(`❌ Script "${script}" missing`);
  }
}

// Test 6: Bundle analysis
console.log('\n6️⃣ Analyzing build output...');
try {
  const distFiles = fs.readdirSync('dist/assets');
  const jsFiles = distFiles.filter(f => f.endsWith('.js'));
  const cssFiles = distFiles.filter(f => f.endsWith('.css'));

  console.log(`✅ Generated ${jsFiles.length} JS files`);
  console.log(`✅ Generated ${cssFiles.length} CSS files`);

  // Check file sizes
  for (const file of [...jsFiles, ...cssFiles]) {
    const stats = fs.statSync(`dist/assets/${file}`);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`   ${file}: ${sizeKB}KB`);
  }
} catch (error) {
  console.log('⚠️  Could not analyze dist folder');
}

console.log('\n🎉 Component structure test complete!');
console.log('\n📱 To test the app manually:');
console.log('   1. Visit http://localhost:5173/');
console.log('   2. Check browser console for errors');
console.log('   3. Test login/registration forms');
console.log('   4. Test onboarding flow');
console.log('   5. Test authenticated app features');

console.log('\n✨ App should be running at: http://localhost:5173/');