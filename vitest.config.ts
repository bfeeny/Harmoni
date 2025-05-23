import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    testTimeout: 20000, // Increase timeout to 20 seconds
  },
});