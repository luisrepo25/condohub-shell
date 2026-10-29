import { afterEach, describe, expect, it } from 'vitest';
import { modulosPara } from '@/inicio/modulos';
import { etiquetaRol, fechaLarga, iniciales, primerNombre, saludo } from '@/inicio/presentacion';
import { aplicarTema, guardarTema, leerTema } from '@/tema/tema';

const almacenEn = (valor: string | null) => ({ getItem: () => valor, setItem: () => undefined });

describe('tema', () => {
  afterEach(() => document.documentElement.removeAttribute('data-tema'));

  it('el_tema_es_claro_por_defecto_aunque_el_sistema_este_en_modo_oscuro', () => {
    expect(leerTema(almacenEn(null))).toBe('claro');
    expect(leerTema(almacenEn('cualquier-cosa'))).toBe('claro');
  });

  it('solo_es_oscuro_si_la_persona_lo_eligio', () => {
    expect(leerTema(almacenEn('oscuro'))).toBe('oscuro');
  });

  it('si_el_almacenamiento_falla_no_rompe_y_queda_claro', () => {
    const roto = { getItem: () => { throw new Error('bloqueado'); }, setItem: () => { throw new Error('bloqueado'); } };
    expect(leerTema(roto)).toBe('claro');
    expect(() => guardarTema('oscuro', roto)).not.toThrow();
  });

  it('aplicar_el_tema_oscuro_marca_html_y_el_claro_lo_quita', () => {
    aplicarTema('oscuro');
    expect(document.documentElement.getAttribute('data-tema')).toBe('oscuro');
    aplicarTema('claro');
    expect(document.documentElement.hasAttribute('data-tema')).toBe(false);
  });

  it('la_eleccion_se_guarda', () => {
    const guardado: string[] = [];
    guardarTema('oscuro', { getItem: () => null, setItem: (_k, v) => void guardado.push(v) });
    expect(guardado).toEqual(['oscuro']);
  });
});

describe('bienvenida', () => {
  it('saluda_segun_la_hora', () => {
    expect(saludo(new Date(2026, 9, 29, 9))).toBe('Buenos días');
    expect(saludo(new Date(2026, 9, 29, 15))).toBe('Buenas tardes');
    expect(saludo(new Date(2026, 9, 29, 21))).toBe('Buenas noches');
  });

  it('la_fecha_sale_en_espanol_sin_depender_del_navegador', () => {
    expect(fechaLarga(new Date(2026, 9, 29))).toBe('jueves 29 de octubre');
  });

  it('las_iniciales_y_el_primer_nombre_toleran_nombres_raros', () => {
    expect(iniciales('Luis Fernando Blanco')).toBe('LF');
    expect(iniciales('  ana  ')).toBe('A');
    expect(iniciales('')).toBe('?');
    expect(primerNombre('Luis Fernando Blanco')).toBe('Luis');
  });

  it('cada_persona_ve_solo_los_portales_de_sus_roles', () => {
    expect(modulosPara(['RESIDENTE']).map((m) => m.ruta)).toEqual(['/residente']);
    expect(modulosPara(['ADMIN', 'GUARDIA']).map((m) => m.ruta)).toEqual(['/admin', '/guardia']);
    expect(modulosPara([])).toEqual([]);
  });

  it('los_roles_tienen_una_etiqueta_legible', () => {
    expect(etiquetaRol('GUARDIA')).toBe('Guardia');
  });
});
