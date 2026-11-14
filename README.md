# TeaRoad

TeaRoad is the React storefront frontend. Authentication and the primary catalog are provided by Supabase. The deployment repository is [egorychbog/deploy](https://github.com/egorychbog/deploy); it contains the Compose stack, nginx gateway configuration, and deployment instructions, and builds this frontend as the `app` container.

## Local Docker deployment

For local Docker deployment, follow the README in [egorychbog/deploy](https://github.com/egorychbog/deploy). It runs only the `app` and `nginx` containers; Supabase remains the managed database and authentication service.

Project background notes and visual references are kept in [project-notes/](project-notes/README.md).

## GitHub Actions

`.github/workflows/build.yml` builds the frontend on pushes and pull requests. Set repository variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SITE_URL` for frontend image builds.
