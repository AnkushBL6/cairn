import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@cairn/core': fileURLToPath(new URL('./packages/core/src/index.ts', import.meta.url)),
      '@cairn/studio': fileURLToPath(new URL('./packages/studio/src/index.ts', import.meta.url)),
    },
  },
  test: {
    include: ['packages/*/test/**/*.test.ts', 'packages/*/src/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.ts'],
      exclude: [
        'packages/*/src/**/*.test.ts',
        'packages/*/src/index.ts',
        'packages/cli/src/cli.ts', // trivial bin shim: just calls runCli + sets exit code
      ],
      reporter: ['text', 'html'],
    },
  },
});
