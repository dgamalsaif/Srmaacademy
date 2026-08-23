---
name: Database migration baseline
description: Prevent unsafe full-schema Drizzle migrations when the migration metadata has no baseline snapshot.
---

Before accepting generated SQL for a schema update, inspect it for `CREATE TABLE` statements against tables that already exist. If the migration metadata lacks a usable baseline snapshot, generation may treat the full schema as new rather than calculating an `ALTER TABLE` diff.

**Why:** A full-schema migration would fail or risk conflicting with the established production schema, while the intended change may only be a few additive columns.

**How to apply:** Prefer a reviewed, additive migration for existing tables and use the project's development schema push flow to validate it before publishing.