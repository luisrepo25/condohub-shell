# condohub-shell

Shell de los micro frontends de CondoHub: login SSO, menú por rol y host de remotos. React 18 · Vite · TypeScript · oidc-client-ts.

```bash
npm install
npm run dev      # http://localhost:5173 (puerto fijo: es el redirect URI registrado en Keycloak)
npm test
```

Requiere Keycloak (`docker compose -f infra/docker-compose.yml up -d keycloak`). Estado, usuarios de prueba y pendientes: `CLAUDE.md`.