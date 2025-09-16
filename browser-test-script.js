// Browser CTA Testing Script
// Copy and paste this into the browser console at http://localhost:5173/

console.log('🧪 TESTING CTAs - Starting Browser Tests');
console.log('=====================================');

// Wait for DOM to be ready
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

// Test 1: Check if splash screen appears and transitions
async function testSplashScreen() {
  console.log('\n1️⃣ Testing Splash Screen...');

  try {
    // Check if splash screen exists
    const splash = document.querySelector('[data-testid="splash-screen"], .splash-screen, [class*="splash"]');
    if (splash) {
      console.log('✅ Splash screen found');
      console.log('   Element:', splash);

      // Wait for transition (splash screen should disappear after 2.5s)
      setTimeout(() => {
        const splashStillVisible = document.querySelector('[data-testid="splash-screen"], .splash-screen, [class*="splash"]');
        if (!splashStillVisible || splashStillVisible.style.display === 'none') {
          console.log('✅ Splash screen transition completed');
        } else {
          console.log('⚠️ Splash screen still visible after 3s');
        }
      }, 3000);

    } else {
      console.log('ℹ️ No splash screen found - app may have already loaded');
    }
  } catch (error) {
    console.log('❌ Error testing splash screen:', error);
  }
}

// Test 2: Check for JavaScript errors
function testConsoleErrors() {
  console.log('\n2️⃣ Checking for JavaScript Errors...');

  // Override console.error to catch errors
  const originalError = console.error;
  const errors = [];

  console.error = function(...args) {
    errors.push(args);
    originalError.apply(console, args);
  };

  setTimeout(() => {
    if (errors.length === 0) {
      console.log('✅ No JavaScript errors detected');
    } else {
      console.log(`❌ Found ${errors.length} JavaScript errors:`);
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.join(' ')}`);
      });
    }

    // Restore original console.error
    console.error = originalError;
  }, 1000);
}

// Test 3: Find and test login form buttons
async function testLoginFormButtons() {
  console.log('\n3️⃣ Testing Login Form Buttons...');

  try {
    // Wait for login form to appear
    await waitForElement('form, [class*="login"], [class*="auth"]', 10000);

    // Find all buttons
    const buttons = document.querySelectorAll('button');
    console.log(`Found ${buttons.length} buttons on page`);

    buttons.forEach((button, index) => {
      console.log(`\n   Button ${index + 1}:`);
      console.log(`   Text: "${button.textContent.trim()}"`);
      console.log(`   Type: ${button.type}`);
      console.log(`   Disabled: ${button.disabled}`);
      console.log(`   Classes: ${button.className}`);
      console.log(`   onClick: ${!!button.onclick}`);
      console.log(`   Event listeners: ${getEventListeners ? Object.keys(getEventListeners(button)).length : 'Unknown'}`);

      // Check CSS that might block clicks
      const style = window.getComputedStyle(button);
      const pointerEvents = style.pointerEvents;
      const position = style.position;
      const zIndex = style.zIndex;
      const display = style.display;
      const visibility = style.visibility;

      console.log(`   CSS - pointer-events: ${pointerEvents}, position: ${position}, z-index: ${zIndex}, display: ${display}, visibility: ${visibility}`);

      if (pointerEvents === 'none') {
        console.log('   ⚠️ WARNING: pointer-events is set to none!');
      }
      if (visibility === 'hidden') {
        console.log('   ⚠️ WARNING: visibility is hidden!');
      }
      if (display === 'none') {
        console.log('   ⚠️ WARNING: display is none!');
      }
    });

  } catch (error) {
    console.log('❌ Error finding login form:', error);
  }
}

// Test 4: Try to simulate button clicks
async function testButtonClicks() {
  console.log('\n4️⃣ Testing Button Click Simulation...');

  try {
    const buttons = document.querySelectorAll('button');

    buttons.forEach((button, index) => {
      if (button.textContent.includes('Accedi') || button.textContent.includes('Login')) {
        console.log(`\n   Testing login button: "${button.textContent.trim()}"`);

        try {
          // Try different click events
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });

          console.log('   Dispatching click event...');
          const result = button.dispatchEvent(clickEvent);
          console.log(`   Click event result: ${result}`);

          // Check if any validation errors appear
          setTimeout(() => {
            const errors = document.querySelectorAll('[class*="error"], .text-red-500, .text-red-700');
            if (errors.length > 0) {
              console.log(`   Found ${errors.length} validation errors after click:`);
              errors.forEach(error => {
                console.log(`     - ${error.textContent.trim()}`);
              });
            } else {
              console.log('   No validation errors appeared');
            }
          }, 500);

        } catch (clickError) {
          console.log('   ❌ Error simulating click:', clickError);
        }
      }
    });

  } catch (error) {
    console.log('❌ Error testing button clicks:', error);
  }
}

// Test 5: Check React DevTools
function testReactDevTools() {
  console.log('\n5️⃣ Checking React DevTools...');

  if (window.React) {
    console.log('✅ React is loaded');
    console.log(`   React version: ${window.React.version || 'Unknown'}`);
  } else {
    console.log('ℹ️ React not found in global scope (normal in production)');
  }

  // Check for React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools detected');
  } else {
    console.log('ℹ️ React DevTools not detected');
  }
}

// Test 6: Check Firebase initialization
function testFirebaseInit() {
  console.log('\n6️⃣ Testing Firebase Initialization...');

  // Try to access Firebase from window
  if (window.firebase) {
    console.log('✅ Firebase found in global scope');
  } else {
    console.log('ℹ️ Firebase not in global scope (normal with modules)');
  }

  // Check for auth errors in localStorage
  try {
    const authError = localStorage.getItem('firebase:authError');
    if (authError) {
      console.log('⚠️ Firebase auth error in localStorage:', authError);
    } else {
      console.log('✅ No Firebase auth errors in localStorage');
    }
  } catch (e) {
    console.log('ℹ️ Could not check localStorage');
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting all CTA tests...\n');

  testSplashScreen();
  testConsoleErrors();
  testReactDevTools();
  testFirebaseInit();

  // Wait a bit for page to load, then test buttons
  setTimeout(async () => {
    await testLoginFormButtons();
    await testButtonClicks();

    console.log('\n✅ All tests completed!');
    console.log('\n📋 Next steps if issues found:');
    console.log('1. Fix any JavaScript errors shown above');
    console.log('2. Check CSS issues (pointer-events: none)');
    console.log('3. Verify Firebase configuration');
    console.log('4. Test form validation manually');
  }, 2000);
}

// Auto-run tests
runAllTests();

// Provide manual test functions
console.log('\n🛠️ Manual test functions available:');
console.log('- testSplashScreen()');
console.log('- testConsoleErrors()');
console.log('- testLoginFormButtons()');
console.log('- testButtonClicks()');
console.log('- testReactDevTools()');
console.log('- testFirebaseInit()');
console.log('- runAllTests()');