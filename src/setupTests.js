import '@testing-library/jest-dom/vitest';

// Silence window.alert calls during tests
beforeAll(() => {
  if (!window.alert) {
    window.alert = () => {};
  }
});
