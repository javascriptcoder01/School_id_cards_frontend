import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Increase asyncUtilTimeout for robust parallel execution with React.lazy and Suspense
configure({ asyncUtilTimeout: 5000 });

// Polyfill localStorage if needed in test environment
if (typeof window !== 'undefined' && !window.localStorage) {
  const store = {};
  window.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
  };
}
