/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Use Vitest global APIs (describe, it, etc.)
    environment: 'jsdom', // Simulate browser environment for React components
    setupFiles: './src/tests/setup.ts', // Optional: Setup file for tests (e.g., import jest-dom matchers)
    // You might want to enable CSS processing if your components import CSS directly
    // css: true,
  },
  resolve: {
    // Replicate the path alias from tsconfig.json for Vitest
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
