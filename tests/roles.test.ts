import { describe, expect, it } from 'vitest';
import { menuPara, rolesDelToken, rutaInicial } from '@/auth/roles';
import { tokenConRoles } from './helpers';

describe('roles del token', () => {
  it('lee solo los roles de CondoHub y descarta el resto', () => {
    expect(rolesDelToken(tokenConRoles('ADMIN', 'inventado'))).toEqual(['ADMIN']);
  });

  it('un token ilegible no da roles (y no rompe la interfaz)', () => {
    expect(rolesDelToken('basura')).toEqual([]);
    expect(rolesDelToken('a.%%%.c')).toEqual([]);
  });
});

describe('menú e inicio por rol', () => {
  it('cada rol ve solo su sección', () => {
    expect(menuPara(['RESIDENTE']).map((i) => i.ruta)).toEqual(['/residente']);
    expect(menuPara(['GUARDIA']).map((i) => i.ruta)).toEqual(['/guardia']);
    expect(menuPara(['ADMIN']).map((i) => i.ruta)).toEqual(['/admin']);
  });

  it('quien no tiene rol no ve nada y va a /sin-rol', () => {
    expect(menuPara([])).toEqual([]);
    expect(rutaInicial([])).toBe('/sin-rol');
  });

  it('con varios roles manda ADMIN > GUARDIA > RESIDENTE', () => {
    expect(rutaInicial(['RESIDENTE', 'ADMIN'])).toBe('/admin');
    expect(rutaInicial(['RESIDENTE', 'GUARDIA'])).toBe('/guardia');
  });
});