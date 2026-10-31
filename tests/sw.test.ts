import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

type Manejador = (evento: Record<string, unknown>) => void;

/** Ejecuta public/sw.js en un contexto aislado con un `self` y un Cache Storage falsos. */
function cargarSw() {
  const manejadores: Record<string, Manejador> = {};
  const almacen = new Map<string, Response>();
  const cache = {
    match: async (r: Request | string) => almacen.get(typeof r === 'string' ? r : r.url),
    put: async (r: Request | string, v: Response) => void almacen.set(typeof r === 'string' ? r : r.url, v),
    addAll: async () => undefined,
  };
  const red = vi.fn(async () => new Response('de la red', { status: 200 }));
  const contexto = {
    self: { addEventListener: (n: string, f: Manejador) => (manejadores[n] = f), skipWaiting: vi.fn(), clients: { claim: vi.fn() }, location: { origin: 'http://shell' } },
    caches: { open: async () => cache, keys: async () => [], delete: async () => true },
    fetch: red,
    Response, Request, URL, Promise,
  };
  runInNewContext(readFileSync('public/sw.js', 'utf8'), contexto);
  const pedir = async (url: string, opciones: { method?: string; mode?: string } = {}) => {
    let respuesta: Promise<Response> | undefined;
    const peticion = { url, method: opciones.method ?? 'GET', mode: opciones.mode ?? 'cors', clone: () => peticion };
    manejadores['fetch']?.({ request: peticion, respondWith: (p: Promise<Response>) => (respuesta = p), waitUntil: () => undefined });
    return respuesta ? await respuesta : undefined;
  };
  return { pedir, red, almacen };
}

describe('service worker de la PWA (O2, F)', () => {
  it('no_intercepta_escrituras_ni_el_login_de_Keycloak_ni_las_APIs', async () => {
    const { pedir } = cargarSw();
    expect(await pedir('http://gw/gestion/graphql', { method: 'POST' })).toBeUndefined();
    expect(await pedir('http://kc/realms/condohub/protocol/openid-connect/certs')).toBeUndefined();
    expect(await pedir('http://gw/reservas/api/reservas')).toBeUndefined();
    expect(await pedir('http://gw/agentes/misiones/123')).toBeUndefined();
  });

  it('los_estaticos_se_sirven_de_cache_despues_de_la_primera_vez_aunque_no_haya_red', async () => {
    const { pedir, red } = cargarSw();
    const url = 'https://cdn/tesseract-core.wasm';

    expect(await (await pedir(url))!.text()).toBe('de la red');
    await new Promise((r) => setTimeout(r, 5));
    red.mockRejectedValue(new TypeError('sin red'));

    expect(await (await pedir(url))!.text()).toBe('de la red');
  });

  it('remoteEntry_js_va_primero_a_la_red_para_no_servir_un_remoto_viejo', async () => {
    const { pedir, red } = cargarSw();
    const url = 'http://remoto/assets/remoteEntry.js';
    await pedir(url);
    red.mockResolvedValue(new Response('version nueva', { status: 200 }));

    expect(await (await pedir(url))!.text()).toBe('version nueva');
  });

  it('remoteEntry_js_sin_red_cae_al_ultimo_guardado', async () => {
    const { pedir, red } = cargarSw();
    const url = 'http://remoto/assets/remoteEntry.js';
    await pedir(url);
    red.mockRejectedValue(new TypeError('sin red'));

    expect(await (await pedir(url))!.text()).toBe('de la red');
  });

  it('una_navegacion_sin_red_devuelve_el_index_guardado', async () => {
    const { pedir, red, almacen } = cargarSw();
    await pedir('http://shell/', { mode: 'navigate' });
    expect(almacen.has('/') || [...almacen.keys()].some((k) => k.endsWith('/'))).toBe(true);
    red.mockRejectedValue(new TypeError('sin red'));

    expect(await (await pedir('http://shell/residente', { mode: 'navigate' }))!.text()).toBe('de la red');
  });

  it('no_guarda_respuestas_con_error', async () => {
    const { pedir, red, almacen } = cargarSw();
    red.mockResolvedValue(new Response('no existe', { status: 404 }));

    await pedir('http://shell/assets/app.js');

    expect(almacen.size).toBe(0);
  });
});
