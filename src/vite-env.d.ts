/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_KEYCLOAK_ISSUER?: string;
  readonly VITE_KEYCLOAK_CLIENT_ID?: string;
  readonly VITE_REMOTE_ADMIN?: string;
  readonly VITE_REMOTE_RESIDENTE?: string;
  readonly VITE_REMOTE_GUARDIA?: string;
}