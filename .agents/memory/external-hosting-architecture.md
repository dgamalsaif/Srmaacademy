---
name: External hosting architecture
description: Production hosting split and the user's decision to keep uploaded images in Cloudflare R2.
---

Production uses Cloudflare Pages/Worker for the frontend and same-origin API proxy, Render for the Express API, Neon PostgreSQL through `DATABASE_URL`, and private Cloudflare R2 for images. The Render Blueprint does not provision a database or inject `DATABASE_URL`; it must reference the existing Neon database.

The user chose not to migrate images away from Cloudflare R2.

**Why:** switching databases or image providers can disconnect existing production data or images.

**How to apply:** verify Render's `DATABASE_URL` and R2 credentials independently. Do not create a replacement database or migrate image storage unless the user explicitly asks.