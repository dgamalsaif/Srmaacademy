# SRMA external deployment

This setup keeps the Replit deployment intact and adds an independent deployment:

- Cloudflare Worker + Static Assets: React frontend and same-origin `/api/*` proxy
- Render Web Service: Express API
- Render PostgreSQL: application database
- Cloudflare R2: private research images
- External Clerk: owner authentication

Coordinator access codes remain in PostgreSQL and do not use Clerk.

## 1. Render

1. Push this repository to GitHub.
2. In Render, create a Blueprint from `render.yaml`.
3. Set the unsynced environment variables in the Render dashboard.
4. Use the external Clerk instance's publishable and secret keys. Do not copy Replit-managed Clerk keys.
5. Wait for `/api/healthz` on the Render service URL to return `{"status":"ok"}`.

The database migrations run during the Render build. `DATABASE_URL` is injected from the Render PostgreSQL service.

## 2. Cloudflare R2

Create a private bucket named `srma-research-images`, then create an R2 API token limited to Object Read & Write for that bucket. Copy these values into Render:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET=srma-research-images`
- `R2_PRIVATE_PREFIX=production`

When all four required R2 values exist, the API uses R2. When none exist, it continues to use Replit Object Storage.

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

Use the external Clerk instance connected for this migration:

- Add `https://srmaacademy.com/sign-in/sso-callback` to allowed redirect URLs.
- Add `https://srmaacademy.com` to allowed origins.
- Put the external `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in Render.
- Put the same publishable key in the Cloudflare frontend build as `VITE_CLERK_PUBLISHABLE_KEY`.

The owner row in PostgreSQL must use the same verified email as the external Clerk owner. On first successful sign-in, the app binds that owner row to the external Clerk user ID.

The production owner email already matches the connected external Clerk user. After importing the database into Render, clear only the old Replit-managed Clerk binding in the **Render database**:

```sql
UPDATE owner_accounts
SET clerk_user_id = NULL, updated_at = NOW()
WHERE email = 'srmaacademy@gmail.com';
```

Do not run this against the Replit database. The first verified owner sign-in on the external deployment will bind the Render row to the external Clerk user ID.

## 5. Data copy

Copy PostgreSQL data only during a planned maintenance window:

1. Stop writes to the current site.
2. Export the Replit production PostgreSQL database.
3. Import it into Render PostgreSQL.
4. Clear the old Clerk user ID in Render using the one-row SQL statement above.
5. Copy existing research image objects into the R2 key prefix `production/research-images/`.
6. Verify record counts, owner sign-in, coordinator sign-in, registrations, and image loading.
7. Switch the Cloudflare custom domain to the new Worker.

Do not point the public domain at the new deployment before both the database and object copy are complete.