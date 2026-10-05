---
name: Persistence test isolation
description: Preventing mocked persistence checks from accidentally querying the project's database.
---

Pass explicit transaction and query-reader doubles to persistence helpers in tests; do not rely on overwriting methods on an imported global database object.

**Why:** a database-method override did not intercept a helper's read across workspace modules, so an intended in-memory test attempted an actual database query. Explicit reader injection isolated both reads and writes reliably.

**How to apply:** keep production defaults intact, inject in-memory readers/transactions in unit tests, and verify that test mutation requests cannot reach the existing database. Database-module imports may keep a test process alive after assertions; use the Node test runner's force-exit option for these isolated unit checks rather than treating completed assertions as a failed application build.

Register tests only after any top-level asynchronous setup/imports have completed when using force-exit.

**Why:** starting a test before a later awaited import let the runner exit after that first test, silently omitting the tests registered after the import.