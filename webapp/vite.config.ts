import { defineConfig } from 'vitest/config' 
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}', 
        'src/recursos/**',
        // ARCHIVOS DE CONFIGURACIÓN Y ENTRADA
        'src/main.tsx',
        'src/App.tsx',
        'src/env.d.ts',
        'src/Routes.tsx',
        // PÁGINAS ESTÁTICAS (Informativas)
        'src/pages/About.tsx',
        'src/pages/Help.tsx',
        'src/pages/Home.tsx',
        // COMPONENTES DE PRUEBA / INTERNOS
        'src/components/BotTester.tsx',
        // SERVICIOS de Configuración pura
        'src/services/socket.service.ts',
        'src/services/api.ts',
        'src/context/**'
      ]
    }
  }
})