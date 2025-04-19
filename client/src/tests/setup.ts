import '@testing-library/jest-dom'; // Import jest-dom matchers
import { vi } from 'vitest';

// Optional: Add any other global test setup here
// For example, mocking global browser APIs if needed

// Example: Mock matchMedia (often needed for responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
