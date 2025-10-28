import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true, // permite usar "describe", "it", "expect" sem importar
    environment: 'node', // ideal para backend
    include: ['src/**/*.test.ts'], // onde estão os testes
    coverage: {
      provider: 'v8', // usa o novo sistema de cobertura nativo
      reportsDirectory: './coverage',
      reporter: ['text', 'html'],
    },
  },
})
