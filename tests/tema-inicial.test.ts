import { describe, expect, it } from 'vitest';
import { temaInicial } from '@/tema/tema';

const almacenEn = (valor: string | null) => ({ getItem: () => valor, setItem: () => undefined });

describe('tema inicial', () => {
  it('arranca en azul noche si la persona no eligió nada', () => {
    expect(temaInicial(almacenEn(null))).toBe('oscuro');
  });

  it('respeta a quien eligió el tema claro', () => {
    expect(temaInicial(almacenEn('claro'))).toBe('claro');
  });

  it('si el almacenamiento está bloqueado usa azul noche sin romper', () => {
    const roto = {
      getItem: () => {
        throw new Error('bloqueado');
      },
      setItem: () => undefined,
    };
    expect(temaInicial(roto)).toBe('oscuro');
  });
});
