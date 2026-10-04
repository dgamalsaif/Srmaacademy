import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const sql = readFileSync(new URL("../lib/db/migrations/0011_registration_answers.sql", import.meta.url), "utf8");
test("registration schema migration is additive, repeatable and does not change seats", () => {
  assert.equal((sql.match(/ADD COLUMN IF NOT EXISTS/g) || []).length, 4);
  assert.ok(!/\b(DROP|DELETE|TRUNCATE|CREATE TABLE)\b/i.test(sql));
  assert.ok(!/research_programs|seats_left|author_role\s*=/i.test(sql));
  assert.ok(sql.includes('NULLIF("academic_degree", \'\')'), "Preserve existing answers");
  assert.ok(sql.includes('"custom_fields"->>\'hasResearchExp\''), "Retain legacy answers");
});
test("the migration journal and snapshot include the new registration fields", () => {
  const journal = JSON.parse(readFileSync(new URL("../lib/db/migrations/meta/_journal.json", import.meta.url)));
  assert.equal(journal.entries.at(-1).tag, "0011_registration_answers");
  const snapshot = JSON.parse(readFileSync(new URL("../lib/db/migrations/meta/0011_snapshot.json", import.meta.url)));
  for (const key of ["academic_degree", "has_research_experience", "research_experience_details", "agreed_to_fee_and_tasks"]) {
    assert.ok(snapshot.tables["public.registrations"].columns[key]);
  }
});