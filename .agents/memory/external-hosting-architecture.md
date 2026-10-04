---
name: External hosting architecture
description: Production hosting split and the user's decision to keep uploaded images in Cloudflare R2.
---

Production uses Cloudflare Pages/Worker for the frontend and same-origin API proxy, Render for the Express API, existing Render PostgreSQL through `DATABASE_URL`, and private Cloudflare R2 for images. The user restored the database to Render and wants it used as-is.

The user explicitly instructed: no migrations now; keep existing external services. They subsequently authorized GitHub and Cloudflare connections specifically to deploy the opportunity share-preview fix. This does not authorize new Replit hosting, databases, or managed authentication.

The user chose not to migrate images away from Cloudflare R2.

**Why:** the user asked to keep the restored Render database without migrations or Replit service connections. Switching databases or image providers can disconnect existing production data or images.

**How to apply:** preserve Pages for the frontend and the API-only routed Worker; do not replace them with a Worker Static Assets/custom-domain deployment. Only use authorized external connections for the requested deployment; do not provision services or run migrations. Ask the user to apply secret connection settings in Render, never to paste them in chat. Do not replace the database or image storage without an explicit request.

Local API build success is not proof of a clean Render dependency installation.

**Why:** the imported workspace's existing npm-installed dependencies allowed local builds while Render's pnpm installation missed a build plugin.

**How to apply:** distinguish a local bundle check from a clean dependency-install check when reporting deployment readiness; never claim the latter based only on the former.
