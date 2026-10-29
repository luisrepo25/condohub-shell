export type Tema = 'claro' | 'oscuro';

const CLAVE = 'condohub.tema';

/** Solo la preferencia de apariencia: nunca datos de la sesión (el token no se guarda en el navegador). */
type Almacen = Pick<Storage, 'getItem' | 'setItem'>;

/** El tema es claro siempre, salvo que la persona haya elegido el oscuro: el modo oscuro del sistema NO lo activa solo. */
export function leerTema(almacen: Almacen = window.localStorage): Tema {
  try {
    return almacen.getItem(CLAVE) === 'oscuro' ? 'oscuro' : 'claro';
  } catch {
    return 'claro';
  }
}

export function guardarTema(tema: Tema, almacen: Almacen = window.localStorage): void {
  try {
    almacen.setItem(CLAVE, tema);
  } catch {
    // Navegación privada o almacenamiento bloqueado: el tema vale solo para esta visita.
  }
}

/** Las variables `--ch-*` cambian con `data-tema="oscuro"` en `<html>`; en claro el atributo no existe. */
export function aplicarTema(tema: Tema, raiz: HTMLElement = document.documentElement): void {
  if (tema === 'oscuro') raiz.setAttribute('data-tema', 'oscuro');
  else raiz.removeAttribute('data-tema');
}
