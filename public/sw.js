/* Service worker de CondoHub (PWA). Sin dependencias: cachea la carcasa de la app, los micro frontends y los módulos del OCR
   local para que se abran y funcionen sin conexión. Nunca toca Keycloak, las APIs ni las escrituras: la seguridad y la
   idempotencia (O1–O4) siguen siendo del servidor y de las colas locales de cada remoto. */
const VERSION = 'condohub-pwa-v1';
const CARCASA = '/';
const ESTATICOS = /\.(?:js|mjs|css|wasm|png|svg|ico|woff2?|webmanifest|gz|traineddata)(?:\?.*)?$/i;
const SERVICIOS = /\/(?:realms|protocol|gestion|reservas|acceso|ia|agentes)\//;
const SIN_HASH = /\/remoteEntry\.js(?:\?.*)?$/;

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(VERSION).then((cache) => cache.addAll([CARCASA, '/manifest.webmanifest'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nombres) => Promise.all(nombres.filter((n) => n !== VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

async function guardar(peticion, respuesta) {
  if (respuesta && respuesta.status === 200) await (await caches.open(VERSION)).put(peticion, respuesta.clone());
  return respuesta;
}

/** Red primero; sin red, lo último guardado. Para la navegación y para lo que no lleva hash en el nombre. */
async function redPrimero(peticion, claveCache) {
  try {
    return await guardar(claveCache ?? peticion, await fetch(peticion));
  } catch (error) {
    const guardada = await (await caches.open(VERSION)).match(claveCache ?? peticion);
    if (guardada) return guardada;
    throw error;
  }
}

/** Lo guardado al instante y se refresca en segundo plano: el OCR y los módulos con hash abren sin red. */
async function guardadoYRefrescar(peticion) {
  const cache = await caches.open(VERSION);
  const guardada = await cache.match(peticion);
  const actualizacion = fetch(peticion).then((respuesta) => guardar(peticion, respuesta));
  if (guardada) {
    actualizacion.catch(() => undefined);
    return guardada;
  }
  return actualizacion;
}

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;
  if (peticion.method !== 'GET') return;
  const url = new URL(peticion.url);
  if (SERVICIOS.test(url.pathname)) return;
  if (peticion.mode === 'navigate') return evento.respondWith(redPrimero(peticion, CARCASA));
  if (SIN_HASH.test(url.pathname)) return evento.respondWith(redPrimero(peticion));
  if (ESTATICOS.test(url.pathname)) return evento.respondWith(guardadoYRefrescar(peticion));
});
