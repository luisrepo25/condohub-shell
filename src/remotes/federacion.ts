import { __federation_method_getRemote, __federation_method_setRemote } from 'virtual:__federation__';
import type { Remoto } from './contrato';

/** Carga un micro frontend como contenedor de Module Federation (expone './remote' y comparte React con el shell). */
export async function cargarFederado(url: string): Promise<Remoto> {
  // Las URL salen de VITE_REMOTE_* en tiempo de ejecución, así que el remoto se registra con su URL como nombre.
  __federation_method_setRemote(url, { url: () => Promise.resolve(url), format: 'esm', from: 'vite' });
  return (await __federation_method_getRemote(url, './remote')) as Remoto;
}

/** Federado primero; si el remoto aún es un módulo ES simple (sin contenedor), se importa directo. */
export async function cargarRemoto(url: string): Promise<Remoto> {
  try {
    return await cargarFederado(url);
  } catch {
    return (await import(/* @vite-ignore */ url)) as Remoto;
  }
}
