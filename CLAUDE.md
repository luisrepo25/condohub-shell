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
- Pendiente: Module Federation real (`remotes` vacío en `vite.config.ts`; hoy se cargan por URL con `import()`), estilos. Probar a mano en el navegador con los remotos.
- `npm test` (14 tests), `npm run lint`, `npm run typecheck`, `npm run build`. Variables en `.env.example`.

## Código funcional protegido (obligatorio)

Código en `main` con tests en verde **no se reescribe, refactoriza, renombra ni reformatea** si la tarea no lo pide explícitamente. Lo nuevo se agrega extendiendo (clases, métodos o archivos nuevos). Si es inevitable tocar código funcional, **detente antes de editar**, explica qué archivo/líneas y por qué, y espera confirmación; luego haz el mínimo diff. Nunca edites tests existentes para que pase código nuevo. Corre los tests antes y después: todo lo que pasaba debe seguir pasando. En el resumen, lista cada archivo existente que modificaste.
