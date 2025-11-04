# WiiCare

Plataforma social para cuidadores y personas con discapacidades o necesidades especiales. Monorepo con Frontend (React + Vite) y Backend (Node.js + Express + MongoDB).

## Requisitos
- Node.js 18+ (recomendado 20)
- MongoDB 6+ (local o remoto)

## Estructura
- `Frontend/` — SPA en React (Vite, React Router, Tailwind, Vitest, Cypress)
- `Backend/` — API REST en Express (Mongoose, JWT, Jest)
- `postman/` — Colección de endpoints
- `.github/workflows/ci.yml` — CI con GitHub Actions

## Variables de entorno
Copia `.env.example` a `.env` en la raíz del repo o en `Backend/.env` y ajusta:

- `PORT` — Puerto del backend (por defecto 4000)
- `MONGODB_URI` — Cadena de conexión a MongoDB
- `JWT_SECRET` — Secreto para firmar JWT
- `CLIENT_URL` — URL del frontend (por defecto Vite 5173)

## Primeros pasos
1. Instalar dependencias en monorepo:
   ```bash
   npm install
   ```
2. Iniciar backend y frontend en dos terminales:
   ```bash
   npm run start:backend
   npm run start:frontend
   ```
3. Abrir `http://localhost:5173`.

## Scripts útiles
- `npm run test` — Ejecuta pruebas de Backend (Jest) y Frontend (Vitest)
- `npm run lint` — Lint combinado
- `npm run coverage:report` — Reportes de cobertura

## QA
- Cypress para flujos UI: ver `Frontend/cypress` y `cypress.config.js`.
- Postman: importar `postman/WiiCare.postman_collection.json`.

## Arquitectura y buenas prácticas
- Separación de capas: modelos, controladores, rutas y middleware.
- Principios SOLID en diseño de controladores/utilidades.
- Endpoints REST con códigos y errores consistentes.

## CI/CD
- GitHub Actions ejecuta: instalación, lint, pruebas unitarias con cobertura y artefactos.
- Extender con despliegue a tu plataforma preferida (Vercel/Render/Fly/Heroku/K8s).

## Roadmap
- Videollamada (WebRTC + signaling)
- Notificaciones en tiempo real (Socket.IO)
- Panel admin avanzado y reportes

## Licencia
MIT