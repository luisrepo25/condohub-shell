import { useEffect, useRef, useState } from 'react';
import { useSesion } from '@/auth/AuthProvider';
import type { Remoto } from './contrato';

export type CargarRemoto = (url: string) => Promise<Remoto>;

/** Carga dinámica del módulo remoto por URL. */
const cargarPorDefecto: CargarRemoto = (url) => import(/* @vite-ignore */ url) as Promise<Remoto>;

/** Monta un micro frontend remoto; si no responde, muestra una página de error en vez de romper el shell. */
export function RemoteHost({ nombre, url, cargar = cargarPorDefecto }: { nombre: string; url: string; cargar?: CargarRemoto }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const sesion = useSesion();
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    let remoto: Remoto | undefined;
    let cancelado = false;
    setError(false);
    cargar(url)
      .then(async (modulo) => {
        if (cancelado) return;
        remoto = modulo;
        await modulo.mount(el, { getToken: sesion.getToken, user: sesion.usuario });
      })
      .catch(() => !cancelado && setError(true));
    return () => {
      cancelado = true;
      remoto?.unmount(el);
    };
  }, [url, cargar, sesion]);

  if (error) {
    return (
      <p role="alert">
        El módulo «{nombre}» no está disponible en este momento. Intenta de nuevo más tarde.
      </p>
    );
  }
  return <div ref={contenedor} data-remoto={nombre} />;
}