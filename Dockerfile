# shell (se compila con Vite y se sirve con nginx). Construir: docker build -t condohub-shell frontends/shell
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_KEYCLOAK_ISSUER=http://localhost:8180/realms/condohub
ARG VITE_KEYCLOAK_CLIENT_ID=condohub-spa
ARG VITE_REMOTE_ADMIN=http://localhost:4200/remoteEntry.js
ARG VITE_REMOTE_RESIDENTE=http://localhost:5174/assets/remoteEntry.js
ARG VITE_REMOTE_GUARDIA=http://localhost:5175/assets/remoteEntry.js
ENV VITE_KEYCLOAK_ISSUER=$VITE_KEYCLOAK_ISSUER VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID VITE_REMOTE_ADMIN=$VITE_REMOTE_ADMIN VITE_REMOTE_RESIDENTE=$VITE_REMOTE_RESIDENTE VITE_REMOTE_GUARDIA=$VITE_REMOTE_GUARDIA
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s --retries=5 CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1