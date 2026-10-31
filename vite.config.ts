/// <reference types="vitest" />
import federation from '@originjs/vite-plugin-federation';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

// Module Federation: el shell es el host. Los remotos (admin, residente, guardia) exponen './remote' y se declaran aquí
// para que el plugin active el modo host (comparte React y su ámbito); la carga real usa la URL de VITE_REMOTE_* en
// tiempo de ejecución (src/remotes/federacion.ts). Los valores por defecto son los de src/remotes/remotos.ts.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_REMOTE_');
  const remoto = (url: string) => ({ external: url, externalType: 'url' as const, format: 'esm' as const, from: 'vite' as const });
  return {
    plugins: [
      react(),
      federation({
        name: 'shell',
        remotes: {
          admin: remoto(env.VITE_REMOTE_ADMIN ?? 'http://localhost:4200/remoteEntry.js'),
          residente: remoto(env.VITE_REMOTE_RESIDENTE ?? 'http://localhost:5174/assets/remoteEntry.js'),
          guardia: remoto(env.VITE_REMOTE_GUARDIA ?? 'http://localhost:5175/assets/remoteEntry.js'),
        },
        shared: { react: { requiredVersion: false }, 'react-dom': { requiredVersion: false } },
      }),
    ],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: { port: 5173, strictPort: true },
    build: { target: 'esnext' },
    test: { environment: 'jsdom', include: ['tests/**/*.test.{ts,tsx}'], setupFiles: ['tests/setup.ts'] },
  };
});
