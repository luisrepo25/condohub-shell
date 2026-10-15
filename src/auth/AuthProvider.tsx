import type { User } from 'oidc-client-ts';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { crearUserManager } from './config';
import { rolesDelToken, type Rol } from './roles';

/** Lo mínimo que el shell necesita del cliente OIDC (permite probarlo sin Keycloak). */
export interface GestorSesion {
  getUser(): Promise<User | null>;
  signinRedirect(): Promise<void>;
  signinRedirectCallback(): Promise<User>;
  signoutRedirect(): Promise<void>;
  events: { addAccessTokenExpired(cb: () => void): void };
}

export interface Sesion {
  usuario: { sub: string; nombre: string; email: string };
  roles: Rol[];
  /** Access token vigente, para pasarlo a los remotos. Nunca se guarda en localStorage. */
  getToken(): string;
  cerrarSesion(): Promise<void>;
}

type Estado = { tipo: 'cargando' } | { tipo: 'error'; mensaje: string } | { tipo: 'autenticado'; sesion: Sesion };

const Contexto = createContext<Sesion | null>(null);

export function useSesion(): Sesion {
  const sesion = useContext(Contexto);
  if (!sesion) throw new Error('useSesion se usa dentro de <AuthProvider>');
  return sesion;
}

function aSesion(user: User, gestor: GestorSesion): Sesion {
  return {
    usuario: {
      sub: user.profile.sub,
      nombre: user.profile.name ?? user.profile.preferred_username ?? user.profile.sub,
      email: user.profile.email ?? '',
    },
    roles: rolesDelToken(user.access_token),
    getToken: () => user.access_token,
    cerrarSesion: () => gestor.signoutRedirect(),
  };
}

export function AuthProvider({ children, gestor }: { children: ReactNode; gestor?: GestorSesion }) {
  const gestorActual = useMemo<GestorSesion>(() => gestor ?? crearUserManager(), [gestor]);
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });
  const iniciado = useRef(false); // StrictMode ejecuta los efectos dos veces; el código del login solo sirve una vez

  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;
    const alAutenticar = (user: User) => setEstado({ tipo: 'autenticado', sesion: aSesion(user, gestorActual) });
    const fallar = (e: unknown) =>
      setEstado({ tipo: 'error', mensaje: e instanceof Error ? e.message : 'No se pudo iniciar sesión' });

    gestorActual.events.addAccessTokenExpired(() => void gestorActual.signinRedirect());

    if (window.location.pathname === '/callback') {
      gestorActual
        .signinRedirectCallback()
        .then((user) => {
          window.history.replaceState({}, '', '/');
          alAutenticar(user);
        })
        .catch(fallar);
    } else {
      gestorActual
        .getUser()
        .then((user) => (user && !user.expired ? alAutenticar(user) : gestorActual.signinRedirect()))
        .catch(fallar);
    }
  }, [gestorActual]);

  if (estado.tipo === 'cargando') return <p role="status">Iniciando sesión…</p>;
  if (estado.tipo === 'error') return <p role="alert">No se pudo iniciar sesión: {estado.mensaje}</p>;
  return <Contexto.Provider value={estado.sesion}>{children}</Contexto.Provider>;
}