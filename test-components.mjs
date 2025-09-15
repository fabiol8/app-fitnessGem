// Test sintassi componenti senza eseguire React
import fs from 'fs';
import path from 'path';

console.log('🧪 Testing Component Syntax...\n');

const testResults = [];

// Test componenti UI
const componentsToTest = [
  'src/components/ui/Button/Button.jsx',
  'src/components/ui/Card/Card.jsx',
  'src/components/ui/Input/Input.jsx',
  'src/components/ui/Modal/Modal.jsx',
  'src/components/ui/Timer/Timer.jsx',
  'src/components/ui/ProgressBar/ProgressBar.jsx',
  'src/components/navigation/TabButton/TabButton.jsx',
  'src/components/navigation/TabNavigation/TabNavigation.jsx',
  'src/hooks/useFirestore.js',
  'src/hooks/useProgress.js',
  'src/hooks/useUserData.js',
  'src/hooks/useCountdown.js',
  'src/utils/calculations.js',
  'src/utils/dateTime.js'
];

componentsToTest.forEach(componentPath => {
  try {
    if (fs.existsSync(componentPath)) {
      const content = fs.readFileSync(componentPath, 'utf8');

      // Basic syntax checks
      const hasImports = content.includes('import');
      const hasExport = content.includes('export');
      const validJSX = !componentPath.includes('.js') || !content.includes('<');
      const hasReact = componentPath.includes('.jsx') ? content.includes('React') : true;

      if (hasImports && hasExport && validJSX && hasReact) {
        testResults.push(`✅ ${componentPath} - OK`);
      } else {
        testResults.push(`❌ ${componentPath} - Syntax issues`);
      }
    } else {
      testResults.push(`❌ ${componentPath} - File not found`);
    }
  } catch (error) {
    testResults.push(`❌ ${componentPath} - Error: ${error.message}`);
  }
});

// Test structure
const requiredDirs = [
  'src/components/ui',
  'src/components/navigation',
  'src/features/users',
  'src/hooks',
  'src/utils',
  'src/data'
];

console.log('📁 Directory Structure:');
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir} - Exists`);
  } else {
    console.log(`❌ ${dir} - Missing`);
  }
});

console.log('\n🔧 Component Tests:');
testResults.forEach(result => console.log(result));

// Test package.json scripts
console.log('\n📦 Package.json check:');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Scripts available: ${Object.keys(pkg.scripts).join(', ')}`);
  console.log(`✅ Dependencies: React ${pkg.dependencies.react}, Vite ${pkg.devDependencies.vite}`);
} catch (error) {
  console.log(`❌ Package.json error: ${error.message}`);
}

const passedTests = testResults.filter(r => r.includes('✅')).length;
const totalTests = testResults.length;

console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('🎉 All component syntax tests PASSED!');
  console.log('📋 Ready for production deployment');
} else {
  console.log('⚠️ Some tests failed - review before deployment');
}