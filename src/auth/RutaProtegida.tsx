import type { ReactNode } from 'react';
import { useSesion } from './AuthProvider';
import type { Rol } from './roles';

/** Muestra el contenido solo a quien tenga alguno de los roles. Es comodidad de UI; la seguridad está en los servicios. */
export function RutaProtegida({ roles, children }: { roles: Rol[]; children: ReactNode }) {
  const sesion = useSesion();
  if (!roles.some((rol) => sesion.roles.includes(rol))) {
    return <p role="alert">No tienes permiso para ver esta sección.</p>;
  }
  return <>{children}</>;
}