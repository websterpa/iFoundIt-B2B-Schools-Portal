import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/._*']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname)
    }
  }
})
