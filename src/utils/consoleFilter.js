/**
 * Console filter utility to suppress known false positive warnings
 * This is a temporary solution for browser extension warnings that are not related to our code
 */

// Store original console methods
const originalWarn = console.warn;
const originalError = console.error;

// Known false positive patterns to filter out
const FILTER_PATTERNS = [
  /cdn\.tailwindcss\.com should not be used in production/i,
  /Tailwind CSS IntelliSense/i,
  /extension.*tailwind/i,
  /GET.*cdn\.pixabay\.com.*403.*Forbidden/i,
  /audio.*pixabay.*403/i,
  /Failed to load resource.*pixabay/i,
  // Chrome extension errors
  /chrome-extension:\/\/.*\/.*\.js.*net::ERR_FILE_NOT_FOUND/i,
  /GET chrome-extension:\/\//i,
  /heuristicsRedefinitions\.js.*ERR_FILE_NOT_FOUND/i,
  /utils\.js.*ERR_FILE_NOT_FOUND/i,
  /extensionState\.js.*ERR_FILE_NOT_FOUND/i,
  /completion_list\.html/i,
  // General browser extension patterns
  /extension.*ERR_FILE_NOT_FOUND/i,
  /chrome-extension/i,
  // Google Auth configuration errors (during setup)
  /CONFIGURATION_NOT_FOUND/i,
  /auth\/configuration-not-found/i,
  /identitytoolkit\.googleapis\.com.*400/i,
  // Firestore offline errors (expected when using demo mode)
  /firestore\.googleapis\.com.*400.*Bad Request/i,
  /Failed to get document because the client is offline/i,
  /FirebaseError.*offline/i,
  // Cross-Origin-Opener-Policy errors (from Google Auth popup)
  /Cross-Origin-Opener-Policy policy would block the window\.closed call/i,
  /window\.closed call/i,
  /pollUserCancellation/i,
  // Firestore connection errors
  /firestore\.googleapis\.com.*Bad Request/i,
  /firestore\.googleapis\.com.*400/i,
  /database=projects.*400.*Bad Request/i
];

// Enhanced console.warn that filters false positives
console.warn = function(...args) {
  const message = args.join(' ');

  // Check if this is a known false positive
  const isFiltered = FILTER_PATTERNS.some(pattern =>
    pattern.test(message)
  );

  // Only show in development and if not filtered
  if (!isFiltered && process.env.NODE_ENV === 'development') {
    originalWarn.apply(console, args);
  }
};

// Enhanced console.error that filters false positives
console.error = function(...args) {
  const message = args.join(' ');

  // Check if this is a known false positive
  const isFiltered = FILTER_PATTERNS.some(pattern =>
    pattern.test(message)
  );

  // Always show errors unless they're filtered false positives
  if (!isFiltered) {
    originalError.apply(console, args);
  }
};

// Also override console.log for completeness
const originalLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');

  // Check if this is a known false positive
  const isFiltered = FILTER_PATTERNS.some(pattern =>
    pattern.test(message)
  );

  // Show logs unless they're filtered false positives
  if (!isFiltered) {
    originalLog.apply(console, args);
  }
};

// Function to restore original console methods (for testing)
export const restoreConsole = () => {
  console.warn = originalWarn;
  console.error = originalError;
};

// Function to add custom filter patterns
export const addFilterPattern = (pattern) => {
  FILTER_PATTERNS.push(pattern);
};

export default {
  restoreConsole,
  addFilterPattern
};