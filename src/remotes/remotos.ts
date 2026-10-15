import type { Rol } from '@/auth/roles';

export interface DefinicionRemoto {
  nombre: string;
  rol: Rol;
  ruta: string;
  url: string;
}

/** URLs por variable de entorno (VITE_REMOTE_*), con los puertos de desarrollo por defecto. */
export const REMOTOS: DefinicionRemoto[] = [
  { nombre: 'admin', rol: 'ADMIN', ruta: '/admin', url: import.meta.env.VITE_REMOTE_ADMIN ?? 'http://localhost:4200/remoteEntry.js' },
  { nombre: 'residente', rol: 'RESIDENTE', ruta: '/residente', url: import.meta.env.VITE_REMOTE_RESIDENTE ?? 'http://localhost:5174/assets/remoteEntry.js' },
  { nombre: 'guardia', rol: 'GUARDIA', ruta: '/guardia', url: import.meta.env.VITE_REMOTE_GUARDIA ?? 'http://localhost:5175/assets/remoteEntry.js' },
];