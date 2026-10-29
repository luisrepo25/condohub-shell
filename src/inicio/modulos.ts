import type { Rol } from '@/auth/roles';

export interface Modulo {
  ruta: string;
  titulo: string;
  descripcion: string;
  rol: Rol;
  icono: string;
}

/** Los portales de CondoHub, con una línea de lo que hace cada uno. Las rutas son las de `auth/roles.ts`. */
const MODULOS: Modulo[] = [
  { ruta: '/admin', titulo: 'Administración', descripcion: 'Consola del administrador: expensas, pagos y reportes.', rol: 'ADMIN', icono: '⚙' },
  { ruta: '/residente', titulo: 'Mi unidad', descripcion: 'Tu unidad y las visitas que anuncias con un pase QR.', rol: 'RESIDENTE', icono: '⌂' },
  { ruta: '/guardia', titulo: 'Portería', descripcion: 'Lectura de placas, rostros y alertas de visitantes.', rol: 'GUARDIA', icono: '⛨' },
];

/** Solo los portales a los que la persona tiene acceso por sus roles (comodidad de UI; la seguridad está en los servicios). */
export function modulosPara(roles: readonly Rol[]): Modulo[] {
  return MODULOS.filter((m) => roles.includes(m.rol));
}
