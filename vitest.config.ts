import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'vue'
  },
  test: {
    include: ['tests/**/*.test.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    }
  }
});
