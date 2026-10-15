/** Roles del realm `condohub` de Keycloak. No hay otros. */
export const ROLES = ['ADMIN', 'RESIDENTE', 'GUARDIA'] as const;
export type Rol = (typeof ROLES)[number];

export function esRol(valor: unknown): valor is Rol {
  return typeof valor === 'string' && (ROLES as readonly string[]).includes(valor);
}

/**
 * Lee los roles de `realm_access.roles` del access token. Es solo para decidir qué muestra la interfaz:
 * NO es seguridad. Cada servicio vuelve a validar el token y autoriza por rol.
 */
export function rolesDelToken(accessToken: string): Rol[] {
  try {
    const carga = accessToken.split('.')[1];
    if (!carga) return [];
    const json = atob(carga.replace(/-/g, '+').replace(/_/g, '/'));
    const claims = JSON.parse(json) as { realm_access?: { roles?: unknown } };
    const nombres = claims.realm_access?.roles;
    return Array.isArray(nombres) ? nombres.filter(esRol) : [];
  } catch {
    return [];
  }
}

export interface ItemMenu {
  etiqueta: string;
  ruta: string;
  rol: Rol;
}

const TODOS_LOS_ITEMS: ItemMenu[] = [
  { etiqueta: 'Administración', ruta: '/admin', rol: 'ADMIN' },
  { etiqueta: 'Mi unidad', ruta: '/residente', rol: 'RESIDENTE' },
  { etiqueta: 'Portería', ruta: '/guardia', rol: 'GUARDIA' },
];

export function menuPara(roles: readonly Rol[]): ItemMenu[] {
  return TODOS_LOS_ITEMS.filter((item) => roles.includes(item.rol));
}

/** Pantalla de inicio de cada persona: la del rol de mayor responsabilidad (ADMIN > GUARDIA > RESIDENTE). */
export function rutaInicial(roles: readonly Rol[]): string {
  if (roles.includes('ADMIN')) return '/admin';
  if (roles.includes('GUARDIA')) return '/guardia';
  if (roles.includes('RESIDENTE')) return '/residente';
  return '/sin-rol';
}