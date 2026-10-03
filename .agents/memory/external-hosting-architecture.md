---
name: External hosting architecture
description: Production hosting split and the user's decision to keep uploaded images in Cloudflare R2.
---

Production uses Cloudflare Pages/Worker for the frontend and same-origin API proxy, Render for the Express API, existing Render PostgreSQL through `DATABASE_URL`, and private Cloudflare R2 for images. The user restored the database to Render and wants it used as-is.

The user explicitly instructed: no migrations now, no adding or connecting Replit to the project; use this workspace only to prepare the project and ask for anything needed.

The user chose not to migrate images away from Cloudflare R2.

**Why:** the user asked to keep the restored Render database without migrations or Replit service connections. Switching databases or image providers can disconnect existing production data or images.

**How to apply:** prepare external configuration without provisioning services, running migrations, or connecting Replit. Ask the user to apply secret connection settings in Render, never to paste them in chat. Do not replace the database or image storage without an explicit request.

Local API build success is not proof of a clean Render dependency installation.

**Why:** the imported workspace's existing npm-installed dependencies allowed local builds while Render's pnpm installation missed a build plugin.

**How to apply:** distinguish a local bundle check from a clean dependency-install check when reporting deployment readiness; never claim the latter based only on the former.