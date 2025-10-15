Quick deployment notes for Coolify

1. Build process
   - Coolify will build using the provided Dockerfile. The Dockerfile builds the client (Vite) and server (esbuild bundle) then copies the built `dist/` into a runtime image.

2. Environment variables
   - Set `DATABASE_URL`, `PORT`, `SESSION_SECRET`, `SUPER_ADMIN_USERNAME`, `SUPER_ADMIN_PASSWORD` in Coolify application settings (Environment variables section).

3. Migrations
   - If you want Coolify to run migrations automatically before start, set the start command to `npm run start:migrate` in Coolify's Build & Run configuration. Otherwise, run migrations manually once via `npm run db:push`.

4. File uploads
   - The application writes to `/app/uploads` inside the container. Configure a persistent volume in Coolify to mount to `/app/uploads` if you need uploads to persist across deployments.

5. Healthcheck
   - Coolify uses `/health` endpoint. Ensure `PORT` is set and reachable.

6. Ports
   - The container exposes 3000 by default. Coolify will set `PORT` automatically.
