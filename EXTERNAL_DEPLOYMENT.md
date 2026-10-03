# SRMA external deployment

Production is hosted externally. Replit is used only to prepare the project; no Replit database, hosting, or managed authentication connection is required.

- Cloudflare Worker + Static Assets: React frontend and same-origin `/api/*` proxy
- Render Web Service: Express API
- Existing Render PostgreSQL: application database, connected to the Render API through `DATABASE_URL`
- Cloudflare R2: private research images
- External Clerk: owner authentication

Coordinator access codes remain in PostgreSQL and do not use Clerk.

## 1. Render

1. Push this repository to GitHub.
2. In Render, create a Blueprint from `render.yaml`.
3. In the existing Render web service, set `DATABASE_URL` to the **Internal Database URL** copied directly from the restored Render PostgreSQL database's connection settings. Use the internal URL only when the API and database share the appropriate private network/region. Otherwise use that database's External Database URL. Do not manually substitute the display name for the database name in the URL. This Blueprint does not create a database or inject that value automatically.
4. Use the external Clerk instance's publishable and secret keys. Do not copy Replit-managed Clerk keys.
5. Wait for `/api/readyz` on the Render service URL to return `{"status":"ready","database":"connected"}`.

No migrations run during build, startup, or post-merge setup. The existing database and schema are used as-is. Keep the connection string only in Render's environment settings; never commit it or send it in chat.

For an existing Render service, check its saved commands explicitly; updating this file alone does not guarantee those dashboard settings change:

- Build Command: `pnpm install --no-frozen-lockfile && pnpm --filter @workspace/api-server run build`
- Start Command: `node --enable-source-maps artifacts/api-server/dist/index.mjs`
- Health Check Path: `/api/readyz`
- `NODE_ENV=production`

Do not use `run-migrate.mjs`, `drizzle-kit push`, or `drizzle-kit migrate` in these commands. Do not bypass readiness failures: `503` means the API cannot confirm database connectivity. A `database ... does not exist` error means the configured connection URL references a nonexistent database; correct the URL rather than creating tables or guessing another name.

Copy the database URL unchanged. Legacy TLS modes such as `sslmode=require` are normalized to `verify-full`, preserving the installed pg driver's current certificate-verification behavior. Do not disable verification to silence an SSL warning.

The Blueprint's existing compute plan is not changed by this preparation. Keep your selected Render service/database plans in the dashboard.

## 2. Cloudflare R2

Create a private bucket named `srma-research-images`, then create an R2 API token limited to Object Read & Write for that bucket. Copy these values into Render:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET=srma-research-images`
- `R2_PRIVATE_PREFIX=production`

When all four required R2 values exist, the API uses R2. `R2_BUCKET` by itself does not enable R2. Development may use the local fallback; production rejects uploads without R2 credentials rather than saving a broken image reference. Render's filesystem is not durable across redeploys, so configure all three R2 credentials on the Render service for production image persistence.

## 3. Cloudflare Worker and frontend

Build the frontend with the external Clerk publishable key:

```bash
PORT=19514 BASE_PATH=/ VITE_CLERK_PUBLISHABLE_KEY=pk_live_REPLACE_ME \
  pnpm --filter @workspace/srma-research-academy run build
```

Do not set `VITE_CLERK_PROXY_URL` for the external deployment.

Edit `deploy/cloudflare/wrangler.jsonc` and replace `API_ORIGIN` with the HTTPS Render service origin. Then deploy:

```bash
pnpm dlx wrangler@latest deploy --config deploy/cloudflare/wrangler.jsonc
```

Attach `srmaacademy.com` and `www.srmaacademy.com` as Worker custom domains. Remove old Cloudflare Pages projects, Workers routes, redirects, or DNS records that still serve the previous static build.

## 4. Clerk

Keep the existing external Clerk instance:

- Add `https://srmaacademy.com/sign-in/sso-callback` to allowed redirect URLs.
- Add `https://srmaacademy.com` to allowed origins.
- Put the external `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in Render.
- Put the same publishable key in the Cloudflare frontend build as `VITE_CLERK_PUBLISHABLE_KEY`.

The owner row in PostgreSQL must use the same verified email as the external Clerk owner. On first successful sign-in, the app binds that owner row to the external Clerk user ID.

Do not reset owner bindings, copy data, migrate schema, or move existing image objects as part of deployment preparation. Such changes require a separate explicit request.

## 5. Verify the existing deployment

After you apply the saved commands and corrected database URL in Render and redeploy:

1. Confirm the log contains no migration execution.
2. Confirm `/api/readyz` returns HTTP 200 and reports the database connected.
3. Confirm existing opportunities and images load.
4. Confirm existing owner and coordinator sign-in still work.

If the database schema is missing a field, report the exact error and stop; do not apply a migration automatically.