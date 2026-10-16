import { render, screen } from '@testing-library/react';
import type { User } from 'oidc-client-ts';
import { describe, expect, it } from 'vitest';
import { AuthProvider, useSesion, type Sesion } from '@/auth/AuthProvider';
import { gestorFalso, tokenConRoles, usuarioFalso } from './helpers';

describe('renovación silenciosa del token', () => {
  it('getToken devuelve el access token renovado sin recargar la página', async () => {
    let alRenovar: (user: User) => void = () => undefined;
    let sesion: Sesion | undefined;
    const gestor = gestorFalso(usuarioFalso('RESIDENTE'), {
      events: {
        addAccessTokenExpired: () => undefined,
        addUserLoaded: (cb) => {
          alRenovar = cb;
        },
      },
    });
    function Captura() {
      sesion = useSesion();
      return <p>listo</p>;
    }

    render(
      <AuthProvider gestor={gestor}>
        <Captura />
      </AuthProvider>,
    );
    await screen.findByText('listo');
    expect(sesion?.getToken()).toBe(tokenConRoles('RESIDENTE'));

    const renovado = tokenConRoles('RESIDENTE', 'renovado');
    alRenovar({ ...usuarioFalso('RESIDENTE'), access_token: renovado } as User);

    expect(sesion?.getToken()).toBe(renovado);
  });
});
