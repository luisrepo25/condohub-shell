import type { Rol } from '@/auth/roles';

/** Saludo según la hora local de quien mira. */
export function saludo(ahora: Date): string {
  const h = ahora.getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** «jueves 29 de octubre», sin depender de la configuración regional del navegador. */
export function fechaLarga(d: Date): string {
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

/** Iniciales para el avatar: «Luis Fernando Blanco» → «LF». Nunca vacío. */
export function iniciales(nombre: string): string {
  const letras = nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase());
  return letras.join('') || '?';
}

export function primerNombre(nombre: string): string {
  return nombre.trim().split(/\s+/)[0] ?? '';
}

const ETIQUETA_ROL: Record<Rol, string> = { ADMIN: 'Administración', RESIDENTE: 'Residente', GUARDIA: 'Guardia' };

export function etiquetaRol(rol: Rol): string {
  return ETIQUETA_ROL[rol];
}
