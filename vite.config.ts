/// <reference types="vitest" />
import federation from '@originjs/vite-plugin-federation';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Module Federation: el shell es el host. Los remotos (admin, residente, guardia) se cargan en tiempo de
// ejecución desde las URL de VITE_REMOTE_* (ver src/remotes); por eso `remotes` queda vacío aquí.
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {},
      shared: { react: { requiredVersion: false }, 'react-dom': { requiredVersion: false } },
    }),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5173, strictPort: true },
  build: { target: 'esnext' },
  test: { environment: 'jsdom', include: ['tests/**/*.test.{ts,tsx}'], setupFiles: ['tests/setup.ts'] },
});