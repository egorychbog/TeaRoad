# TeaRoad

TeaRoad is the React storefront frontend. The Node.js backend is maintained separately in [egorychbog/deploy](https://github.com/egorychbog/deploy) and loaded by Docker Compose from that repository. Supabase provides authentication and the primary catalog.

## Local Docker deployment

Docker Compose loads and runs three containers:

- `frontend`: builds the React app and serves its static production files.
- `backend`: loaded from `egorychbog/deploy`; serves `/api/health` and a demo catalog at `/api/products`.
- `nginx`: provides the local HTTP/HTTPS entry point, serves the frontend, and proxies `/api/*` to `backend`.

The backend catalog is the fallback when Supabase is not configured or unavailable. With Supabase configured, the storefront uses Supabase for authentication and its primary catalog.

Create `.env` from `.env.example` and set values from the intended Supabase project. Never put a Supabase secret/service role key in a `VITE_*` variable.

```powershell
Copy-Item .env.example .env
# Edit .env with the Supabase URL and publishable key.
docker compose up --build -d
docker compose ps
```

The local site is served at `https://tearoad.localhost`. TLS certificates under `certs/` are local development files and are excluded from Git. See [docs/local-docker.md](docs/local-docker.md) for certificate setup, troubleshooting, and shutdown instructions.

Project background notes and visual references are kept in [project-notes/](project-notes/README.md).

## GitHub Actions

`.github/workflows/build.yml` builds the frontend on pushes and pull requests. Set repository variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SITE_URL` for frontend image builds.
