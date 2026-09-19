# SRMA Academy

SRMA Academy is a TypeScript-based academic research platform. The repository contains a web frontend and a Node.js/Express API service, with authentication provided through Clerk.

## Repository layout

- `artifacts/rspf-academia/` — Vite/React frontend application.
- `artifacts/api-server/` — Express API service.
- `lib/` — shared repository libraries or configuration.
- `scripts/` — repository automation scripts.
- `exports/` — generated export assets; do not place secrets here.

## Requirements

- Node.js 20 or newer
- pnpm (the repository includes `pnpm-lock.yaml`)
- Access to the required Clerk, database, and deployment-service configuration

## Install

From the repository root:

```bash
pnpm install
```

Use the scripts declared in each workspace `package.json`. The frontend and API server have independent package definitions under `artifacts/rspf-academia/` and `artifacts/api-server/`.

## Environment configuration

1. Copy `.env.example` to `.env` or create the environment variables in the relevant hosting platform.
2. Replace every placeholder with the correct value for the target environment.
3. Never commit `.env`, credentials, API keys, database URLs, Clerk secrets, or deployment tokens.
4. Keep production values only in your hosting provider's encrypted environment-variable settings.

The frontend may use `VITE_API_URL` to identify the API base URL. Any variable prefixed with `VITE_` is bundled into frontend code, so it must never contain a secret.

## Local development

Start the frontend from its workspace using the scripts in `artifacts/rspf-academia/package.json`. The Vite configuration supports a default development port of `5173` when `PORT` is not set.

Start the API server from `artifacts/api-server/` using its package scripts. Set `FRONTEND_ORIGIN` to the local frontend origin when testing cross-origin requests, for example `http://localhost:5173`.

Before testing authenticated workflows, configure the necessary Clerk publishable and secret keys in your local environment.

## Deployment

- Deploy the frontend from `artifacts/rspf-academia/` to the configured static-hosting service.
- Deploy the API server from `artifacts/api-server/` to the configured Node.js hosting service.
- Set the frontend's `VITE_API_URL` to the deployed API base URL.
- Set the API server's `FRONTEND_ORIGIN` to a comma-separated allow-list of trusted frontend origins.
- Confirm the production frontend supports SPA fallback so direct visits to client routes continue to load the application.
- Confirm the API health endpoint responds after each deployment, if `/health` is enabled on the deployed branch.

## Production verification

After a deployment, verify:

1. The frontend loads at the intended production domain.
2. Direct navigation and browser refresh work on application routes.
3. Authentication and sign-out flows work in a private browser session.
4. Frontend API requests reach the intended API URL and are not blocked by CORS.
5. The API health endpoint returns an expected success response.
6. No secrets, tokens, database URLs, or private keys appear in browser bundles, logs, commits, or pull-request diffs.

## Git workflow

- Create a focused branch for every change.
- Use pull requests before merging into `main`.
- Do not merge a pull request with failed required deployment or CI checks.
- Keep commits small and use descriptive messages, for example `fix(api): allow trusted frontend origin` or `docs: update deployment guide`.
- Review changed files and deployment checks before merge.

## Security guidance

- Do not commit `.env` files or secret-bearing configuration.
- Rotate any credential immediately if it is accidentally exposed.
- Keep CORS restricted to known frontend origins in production.
- Treat all `VITE_*` variables as public values.
- Enable repository secret scanning or equivalent provider-based secret detection when available.
- Review dependency and deployment alerts regularly.

## Current pull-request policy

Review deployment checks and source diffs before merging production changes. In particular, resolve any failed Cloudflare Workers build before merging the related pull request.
