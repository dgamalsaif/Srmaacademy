---
name: Registration verification
description: Limits of local registration checks when development falls back to an in-memory database.
---

Do not treat a successful development registration response as proof of correct PostgreSQL seat allocation or rollback.

**Why:** the development in-memory adapter does not reproduce PostgreSQL defaults or SQL backfills. A fixture without author-seat allocations can return registration success while producing invalid remaining-seat values.

**How to apply:** use fully specified role-seat fixtures for isolated tests, and a dedicated PostgreSQL test database for concurrency and rollback verification. Report SQL-generation tests, development HTTP checks and published Render verification separately. Never test by reserving real production seats without explicit authorization.