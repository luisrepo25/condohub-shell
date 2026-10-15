import type { User } from 'oidc-client-ts';
import type { GestorSesion } from '@/auth/AuthProvider';

function base64url(obj: object): string {
  return btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Access token con la forma de Keycloak (sin firma real: el shell nunca verifica, solo lee roles para la UI). */
export function tokenConRoles(...roles: string[]): string {
  return `${base64url({ alg: 'RS256' })}.${base64url({ realm_access: { roles: [...roles, 'offline_access'] } })}.firma`;
}

export function usuarioFalso(...roles: string[]): User {
  return {
    access_token: tokenConRoles(...roles),
    expired: false,
    profile: { sub: 'sub-1', name: 'Persona Demo', email: 'demo@condohub.test' },
  } as unknown as User;
}

export function gestorFalso(usuario: User | null, sobre: Partial<GestorSesion> = {}): GestorSesion {
  return {
    getUser: () => Promise.resolve(usuario),
    signinRedirect: () => Promise.resolve(),
    signinRedirectCallback: () => Promise.resolve(usuario as User),
    signoutRedirect: () => Promise.resolve(),
    events: { addAccessTokenExpired: () => undefined },
    ...sobre,
  };
}