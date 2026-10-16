import { InMemoryWebStorage, UserManager, WebStorageStateStore } from 'oidc-client-ts';

export function crearUserManager(): UserManager {
  const issuer = import.meta.env.VITE_KEYCLOAK_ISSUER ?? 'http://localhost:8180/realms/condohub';
  return new UserManager({
    authority: issuer,
    client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'condohub-spa',
    redirect_uri: `${window.location.origin}/callback`,
    post_logout_redirect_uri: `${window.location.origin}/`,
    response_type: 'code', // Authorization Code + PKCE (S256)
    scope: 'openid profile email',
    // El token vive solo en memoria. El estado temporal del login (PKCE) usa sessionStorage porque debe
    // sobrevivir a la redirección a Keycloak.
    userStore: new WebStorageStateStore({ store: new InMemoryWebStorage() }),
    automaticSilentRenew: true, // renueva el access token antes de que venza (15 min) con el refresh token de Keycloak
  });
}