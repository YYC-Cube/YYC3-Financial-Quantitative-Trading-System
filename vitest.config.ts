import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/vitest.d.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/app/**/*.{ts,tsx}'],
      exclude: ['src/app/**/*.test.{ts,tsx}', 'src/app/HANDOFF_*.ts', 'src/app/types/**'],
      reportsDirectory: 'coverage',
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
