# TeaRoad

TeaRoad is a React storefront with a Node.js backend and Supabase authentication and data access. This repository contains the complete site, Docker setup, and GitHub Actions workflow.

## Local Docker deployment

Docker runs three containers:

- `frontend`: builds the React app and serves its static production files.
- `backend`: Node.js API serving `/api/health` and a demo catalog at `/api/products`.
- `nginx`: provides the local HTTP/HTTPS entry point, serves the frontend, and proxies `/api/*` to `backend`.

The backend catalog is the fallback when Supabase is not configured or unavailable. With Supabase configured, the storefront uses Supabase for authentication and its primary catalog.

Create `deploy/.env` from `deploy/.env.example` and set values from a dedicated test Supabase project. Do not use a production project or put a Supabase `service_role` key in any `VITE_*` variable.

```powershell
Copy-Item deploy/.env.example deploy/.env
# Edit deploy/.env with the test project URL and publishable key.
docker compose --env-file deploy/.env up --build -d
docker compose ps
```

The local site is served at `https://tearoad.localhost`. TLS certificates under `deploy/certs/` are local development files and are excluded from Git. See [deploy/README.md](deploy/README.md) for certificate setup, troubleshooting, and shutdown instructions.

Project background notes and visual references are kept in [project-notes/](project-notes/README.md).

## GitHub Actions

`.github/workflows/build.yml` builds the site and Docker images on pushes and pull requests. To enable the workflow, set repository variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SITE_URL`. Pushes to `main` publish images to GHCR. The workflow does not deploy to a live server.
