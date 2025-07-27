// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Suppress React act() warnings in test environment
// These warnings are common in async component testing and don't affect functionality
const originalError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (
      args[0].includes('was not wrapped in act') ||
      args[0].includes('Warning: An update to') ||
      args[0].includes('When testing, code that causes React state updates')
    )
  ) {
    return; // Suppress React act() warnings
  }
  originalError.call(console, ...args);
};
