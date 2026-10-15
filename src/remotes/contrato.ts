import type { Sesion } from '@/auth/AuthProvider';

/** Contrato con cada remoto: exporta mount(el, contexto) y unmount(el). El shell no comparte stores con ellos. */
export interface ContextoRemoto {
  getToken: () => string;
  user: Sesion['usuario'];
}

export interface Remoto {
  mount(el: HTMLElement, contexto: ContextoRemoto): void | Promise<void>;
  unmount(el: HTMLElement): void;
}