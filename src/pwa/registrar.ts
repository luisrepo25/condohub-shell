function registrar(): void {
  navigator.serviceWorker.register('/sw.js').catch(() => undefined);
}

/**
 * Registra el service worker de la PWA (public/sw.js). Solo en el build de producción: en desarrollo cachearía módulos
 * que cambian a cada guardado. Si el navegador no lo soporta o el registro falla, el shell sigue funcionando en línea.
 */
export function registrarServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  if (document.readyState === 'complete') registrar();
  else window.addEventListener('load', registrar, { once: true });
}
