import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '@/auth/AuthProvider';
import { RemoteHost } from '@/remotes/RemoteHost';
import { gestorFalso, usuarioFalso } from './helpers';

const envolver = (nodo: React.ReactNode) =>
  render(<AuthProvider gestor={gestorFalso(usuarioFalso('ADMIN'))}>{nodo}</AuthProvider>);

describe('RemoteHost', () => {
  it('monta el remoto pasándole el token y el usuario, y lo desmonta al salir', async () => {
    const mount = vi.fn();
    const unmount = vi.fn();
    const { unmount: cerrar } = envolver(<RemoteHost nombre="admin" url="x" cargar={() => Promise.resolve({ mount, unmount })} />);
    await waitFor(() => expect(mount).toHaveBeenCalledTimes(1));
    const contexto = mount.mock.calls[0]?.[1] as { getToken: () => string; user: { nombre: string } };
    expect(contexto.getToken()).toContain('.firma');
    expect(contexto.user.nombre).toBe('Persona Demo');
    cerrar();
    expect(unmount).toHaveBeenCalledTimes(1);
  });

  it('si el remoto no responde muestra una página de error y el shell sigue vivo', async () => {
    envolver(<RemoteHost nombre="guardia" url="x" cargar={() => Promise.reject(new Error('404'))} />);
    expect((await screen.findByRole('alert')).textContent).toContain('«guardia» no está disponible');
  });
});