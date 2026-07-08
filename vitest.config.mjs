import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
    globals: true,
    coverage: {
      include: ['src/**'],
      exclude: [
        'src/ui/**',
        'src/pages/**',
        'src/index.js',
      ],
    },
    setupFiles: [],
  },
});
