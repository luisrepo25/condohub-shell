# CLAUDE.md — condohub-shell

**Shell** de los micro frontends de CondoHub: hace el login SSO, carga los remotos y da la navegación común. Responsable: **Erick**.

## Stack

React 18 · Vite · TypeScript · `@originjs/vite-plugin-federation` (Module Federation) · oidc-client-ts (Keycloak, Authorization Code + PKCE) · React Router · Vitest.

## Qué hace y qué no

- Hace: login/logout OIDC contra el realm `condohub`, refresco de token, menú según rol (`ADMIN`, `RESIDENTE`, `GUARDIA`), carga de remotos y página de error si un remoto no responde.
- No hace: ninguna pantalla de negocio. Si una tarea pide lógica de finanzas, reservas o portería aquí, va en el remoto que corresponde.

## Remotos

| Remoto | Repo | URL dev | Rol |
|---|---|---|---|
| `admin` | condohub-admin (Angular, expuesto como Web Component) | http://localhost:4200/remoteEntry.js | `ADMIN` |
| `residente` | condohub-residente | http://localhost:5174/assets/remoteEntry.js | `RESIDENTE` |
| `guardia` | condohub-guardia | http://localhost:5175/assets/remoteEntry.js | `GUARDIA` |

URLs por variable de entorno (`VITE_REMOTE_*`). Contrato con cada remoto: exporta `mount(el, { getToken, user })` y `unmount(el)`. El shell **no** comparte stores de estado con los remotos; solo les pasa `getToken` y el usuario.

## Estructura

```
src/
├── auth/            # cliente OIDC, guardas de ruta por rol
├── remotes/         # carga dinámica y contrato mount/unmount
├── layout/          # barra, menú
└── main.tsx
```

## Comandos

```bash
npm install
npm run dev        # puerto 5173
npm run build && npm run preview
npm run test
npm run lint
```

## Convenciones

- El token nunca se guarda en `localStorage`; vive en memoria (y `sessionStorage` solo si oidc-client-ts lo requiere).
- Las dependencias compartidas por federation (`react`, `react-dom`) se declaran `singleton`.

## Estado (esqueleto, 14/10/2026)

- Login real contra Keycloak (Authorization Code + PKCE, cliente público `condohub-spa`); sin sesión redirige a Keycloak. El token vive solo en memoria; recargar vuelve a pasar por Keycloak (SSO sin pedir contraseña).
- Menú e inicio por rol: ADMIN → `/admin`, GUARDIA → `/guardia`, RESIDENTE → `/residente` (con varios roles: ADMIN > GUARDIA > RESIDENTE). Los roles de la interfaz se leen del access token solo para decidir qué mostrar; la seguridad real está en los servicios.
- `RemoteHost` monta cada remoto con `mount(el, { getToken, user })`; si no responde, muestra un error y el shell sigue vivo.
- Renovación silenciosa del token (16/10/2026): `automaticSilentRenew` con el refresh token de Keycloak; `getToken()` siempre devuelve el access token vigente. Si la renovación falla, al vencer vuelve a Keycloak.
- Remotos (16/10/2026): `admin`, `residente` y `guardia` tienen esqueleto (React + Vite, módulo ES con `mount`/`unmount`, consulta `miPerfil`). Se sirven con `npm run dev` en sus puertos.
- Module Federation real (30/10/2026): cada remoto es un contenedor federado que expone `./remote` (`mount`/`unmount`): residente y guardia con `@originjs/vite-plugin-federation` (`assets/remoteEntry.js`) y admin (Angular) con `init`/`get` en `remoteEntry.ts`. El shell los declara en `vite.config.ts` (activa el modo host) y los carga por la URL de `VITE_REMOTE_*` en tiempo de ejecución con `src/remotes/federacion.ts` (si un remoto sigue siendo un módulo ES simple, cae a `import()`). Cada remoto lleva su propio React y monta su raíz aislada: compartir `react-dom/client` y `react/jsx-runtime` con este plugin dio el error #321 (dos copias de React). Pendiente: estilos.
- PWA (31/10/2026): `public/manifest.webmanifest` e iconos (instalable; Chrome no reporta errores de instalabilidad) y `public/sw.js`, un service worker sin dependencias registrado por `src/pwa/registrar.ts` solo en producción. Estrategias: navegación y `remoteEntry.js` (sin hash) con red primero y último guardado como respaldo; estáticos con hash, WASM y módulos del OCR con guardado primero y refresco en segundo plano; **nunca** intercepta escrituras, Keycloak ni las rutas del gateway (`/gestion`, `/reservas`, `/acceso`, `/ia`, `/agentes`). Probado en Chrome: tras iniciar sesión el SW queda activo y el OCR del residente funciona sin red. Límite conocido: el motor WASM de Tesseract lo pide un worker que el SW no controla, así que offline depende de la caché HTTP del navegador; para garantizarlo habría que alojar el motor y el idioma en el propio origen. Tras recargar sin red no hay sesión (el token vive solo en memoria, a propósito): la PWA offline cubre la sesión ya abierta.
- `npm test` (14 tests), `npm run lint`, `npm run typecheck`, `npm run build`. Variables en `.env.example`.

## Código funcional protegido (obligatorio)

Código en `main` con tests en verde **no se reescribe, refactoriza, renombra ni reformatea** si la tarea no lo pide explícitamente. Lo nuevo se agrega extendiendo (clases, métodos o archivos nuevos). Si es inevitable tocar código funcional, **detente antes de editar**, explica qué archivo/líneas y por qué, y espera confirmación; luego haz el mínimo diff. Nunca edites tests existentes para que pase código nuevo. Corre los tests antes y después: todo lo que pasaba debe seguir pasando. En el resumen, lista cada archivo existente que modificaste.
