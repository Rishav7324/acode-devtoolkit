import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    exclude: ['tests/ui/**'],
    globals: true,
    coverage: {
      include: ['src/**'],
      exclude: [
        'src/ui/**',
        'src/pages/**',
        'src/index.js',
      ],
    },
    testTimeout: 15000,
    setupFiles: ['./tests/setup.js'],
  },
});
