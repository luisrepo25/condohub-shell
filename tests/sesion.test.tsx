import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useSesion } from '@/auth/AuthProvider';
import { RutaProtegida } from '@/auth/RutaProtegida';
import { gestorFalso, usuarioFalso } from './helpers';

afterEach(() => window.history.replaceState({}, '', '/'));

function Quien() {
  const s = useSesion();
  return <p>{`${s.usuario.nombre}|${s.roles.join(',')}`}</p>;
}

describe('sesión OIDC', () => {
  it('con sesión vigente expone usuario y roles', async () => {
    render(
      <AuthProvider gestor={gestorFalso(usuarioFalso('RESIDENTE'))}>
        <Quien />
      </AuthProvider>,
    );
    expect(await screen.findByText('Persona Demo|RESIDENTE')).toBeTruthy();
  });

  it('sin sesión redirige a Keycloak y no muestra contenido', async () => {
    const signinRedirect = vi.fn(() => Promise.resolve());
    render(
      <AuthProvider gestor={gestorFalso(null, { signinRedirect })}>
        <Quien />
      </AuthProvider>,
    );
    await waitFor(() => expect(signinRedirect).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(/Persona Demo/)).toBeNull();
  });

  it('en /callback completa el login con el código y limpia la URL', async () => {
    window.history.replaceState({}, '', '/callback?code=abc&state=xyz');
    const signinRedirectCallback = vi.fn(() => Promise.resolve(usuarioFalso('GUARDIA')));
    render(
      <AuthProvider gestor={gestorFalso(null, { signinRedirectCallback })}>
        <Quien />
      </AuthProvider>,
    );
    expect(await screen.findByText('Persona Demo|GUARDIA')).toBeTruthy();
    expect(window.location.pathname).toBe('/');
  });

  it('si el login falla muestra el error', async () => {
    const getUser = () => Promise.reject(new Error('Keycloak caído'));
    render(
      <AuthProvider gestor={gestorFalso(null, { getUser })}>
        <Quien />
      </AuthProvider>,
    );
    expect((await screen.findByRole('alert')).textContent).toContain('Keycloak caído');
  });
});

describe('RutaProtegida', () => {
  it('muestra el contenido a quien tiene el rol', async () => {
    render(
      <AuthProvider gestor={gestorFalso(usuarioFalso('ADMIN'))}>
        <RutaProtegida roles={['ADMIN']}>
          <p>consola</p>
        </RutaProtegida>
      </AuthProvider>,
    );
    expect(await screen.findByText('consola')).toBeTruthy();
  });

  it('oculta el contenido y avisa a quien no lo tiene', async () => {
    render(
      <AuthProvider gestor={gestorFalso(usuarioFalso('RESIDENTE'))}>
        <RutaProtegida roles={['ADMIN']}>
          <p>consola</p>
        </RutaProtegida>
      </AuthProvider>,
    );
    expect((await screen.findByRole('alert')).textContent).toContain('No tienes permiso');
    expect(screen.queryByText('consola')).toBeNull();
  });
});