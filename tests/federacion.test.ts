import { beforeEach, describe, expect, it, vi } from 'vitest';

const fakes = vi.hoisted(() => ({ setRemote: vi.fn(), getRemote: vi.fn() }));
vi.mock('virtual:__federation__', () => ({
  __federation_method_setRemote: fakes.setRemote,
  __federation_method_getRemote: fakes.getRemote,
}));

import { cargarFederado } from '@/remotes/federacion';

describe('cargarFederado (Module Federation)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registra el remoto por su URL y pide el módulo expuesto ./remote', async () => {
    const remoto = { mount: vi.fn(), unmount: vi.fn() };
    fakes.getRemote.mockResolvedValue(remoto);
    const url = 'http://localhost:5174/assets/remoteEntry.js';

    await expect(cargarFederado(url)).resolves.toBe(remoto);

    expect(fakes.setRemote).toHaveBeenCalledWith(url, expect.objectContaining({ format: 'esm', from: 'vite' }));
    expect(fakes.getRemote).toHaveBeenCalledWith(url, './remote');
  });

  it('propaga el fallo si el contenedor no responde', async () => {
    fakes.getRemote.mockRejectedValue(new Error('sin red'));
    await expect(cargarFederado('http://x/remoteEntry.js')).rejects.toThrow('sin red');
  });
});
