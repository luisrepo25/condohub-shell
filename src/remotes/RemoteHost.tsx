import { useEffect, useRef, useState } from 'react';
import { useSesion } from '@/auth/AuthProvider';
import type { Remoto } from './contrato';
import { cargarRemoto } from './federacion';

export type CargarRemoto = (url: string) => Promise<Remoto>;

/** Carga dinámica del módulo remoto por URL. */
const cargarPorDefecto: CargarRemoto = cargarRemoto;

/** Monta un micro frontend remoto; si no responde, muestra una página de error en vez de romper el shell. */
export function RemoteHost({ nombre, url, cargar = cargarPorDefecto }: { nombre: string; url: string; cargar?: CargarRemoto }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const sesion = useSesion();
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    let remoto: Remoto | undefined;
    let cancelado = false;
    setError(false);
    setCargando(true);
    cargar(url)
      .then(async (modulo) => {
        if (cancelado) return;
        remoto = modulo;
        await modulo.mount(el, { getToken: sesion.getToken, user: sesion.usuario });
        if (!cancelado) setCargando(false);
      })
      .catch(() => !cancelado && setError(true));
    return () => {
      cancelado = true;
      remoto?.unmount(el);
    };
  }, [url, cargar, sesion, intento]);

  if (error) {
    return (
      <div role="alert">
        <p>El módulo «{nombre}» no está disponible en este momento. Intenta de nuevo más tarde.</p>
        <button onClick={() => setIntento((n) => n + 1)}>Reintentar</button>
      </div>
    );
  }
  return (
    <>
      {cargando && <p role="status">Cargando…</p>}
      <div ref={contenedor} data-remoto={nombre} />
    </>
  );
}