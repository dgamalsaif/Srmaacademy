import assert from "node:assert/strict";
import { test } from "node:test";
import { getTableColumns, type SQL } from "drizzle-orm";
import { jsonb, PgDialect, pgTable, serial, text } from "drizzle-orm/pg-core";
import { insertCompatibleRegistration, normalizeRegistrationAnswers } from "./registrationCompatibility";

const table = pgTable("registrations", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  customFields: jsonb("custom_fields").notNull(),
  academicDegree: text("academic_degree"),
  hasResearchExperience: text("has_research_experience"),
  researchExperienceDetails: text("research_experience_details"),
  agreedToFeeAndTasks: text("agreed_to_fee_and_tasks"),
});
const answers = {
  academicDegree: "resident", hasResearchExperience: "yes",
  researchExperienceDetails: "Previous systematic review", agreedToFeeAndTasks: "yes",
};
const values = { fullName: "Registration test", ...answers, customFields: answers };
const dialect = new PgDialect();

function transaction(columnNames: string[], failInsert = false) {
  const queries: ReturnType<typeof dialect.sqlToQuery>[] = [];
  const tx = {
    async execute(query: SQL) {
      const compiled = dialect.sqlToQuery(query);
      queries.push(compiled);
      if (queries.length === 1) return {rows: columnNames.map(column_name => ({column_name}))};
      if (failInsert) throw new Error("INSERT rejected");
      return {rows: [{id: 42, fullName: values.fullName, customFields: answers}]};
    },
    insert() { return {values() { return {async returning() {return [{id: 42, ...values}];}}; }}; },
  };
  return {tx, queries};
}

test("legacy database writes all answers to JSON without referencing missing columns", async () => {
  const {tx, queries} = transaction(["id", "full_name", "custom_fields"]);
  const row = await insertCompatibleRegistration(tx, table, values);
  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /pg_attribute/);
  assert.match(queries[1].sql, /INSERT INTO "registrations"/);
  for (const column of ["academic_degree", "has_research_experience", "research_experience_details", "agreed_to_fee_and_tasks"]) {
    assert.ok(!queries[1].sql.includes(`"${column}"`));
  }
  assert.ok(queries[1].params.includes(JSON.stringify(answers)));
  assert.deepEqual(row.customFields, answers);
  for (const [key, value] of Object.entries(answers)) assert.equal(row[key], value);
  assert.ok(!queries.some(query => /ALTER TABLE|CREATE TABLE/i.test(query.sql)));
});

test("current schema also writes dedicated answer columns", async () => {
  const {tx, queries} = transaction(Object.values(getTableColumns(table)).map(column => column.name));
  await insertCompatibleRegistration(tx, table, values);
  assert.ok(queries[1].sql.includes('"academic_degree"'));
  assert.ok(queries[1].params.includes("resident"));
});

test("participant input stays bound, never interpolated into SQL", async () => {
  const {tx, queries} = transaction(["id", "full_name", "custom_fields"]);
  const fullName = "test'); DELETE FROM registrations; --";
  await insertCompatibleRegistration(tx, table, {...values, fullName});
  assert.ok(!queries[1].sql.includes(fullName));
  assert.ok(queries[1].params.includes(fullName));
});

test("missing required JSON storage fails rather than discarding participant answers", async () => {
  const {tx, queries} = transaction(["id", "full_name"]);
  await assert.rejects(insertCompatibleRegistration(tx, table, values), /required column: custom_fields/);
  assert.equal(queries.length, 1, "No INSERT attempted");
});

test("insert failures propagate to the reservation transaction without retrying", async () => {
  const {tx, queries} = transaction(["id", "full_name", "custom_fields"], true);
  await assert.rejects(insertCompatibleRegistration(tx, table, values), /INSERT rejected/);
  assert.equal(queries.length, 2);
});

test("legacy and current clients retain the same degree, experience and agreement answers", () => {
  const result = normalizeRegistrationAnswers({
    academicDegree: "resident", hasResearchExp: "yes",
    researchExpDetails: "Previous review", agreeFeesAndTasks: "agree",
  });
  assert.equal(result.hasResearchExperience, "yes");
  assert.equal(result.researchExperienceDetails, "Previous review");
  assert.equal(result.agreedToFeeAndTasks, "agree");
  const canonical = normalizeRegistrationAnswers({
    hasResearchExperience: "no", hasResearchExp: "yes",
    agreedToFeeAndTasks: "no", agreeFeesAndTasks: "agree",
  });
  assert.equal(canonical.hasResearchExperience, "no");
  assert.equal(canonical.agreedToFeeAndTasks, "no");
});

test("the existing development adapter still inserts and returns a record", async () => {
  const {tx} = transaction([]);
  assert.equal((await insertCompatibleRegistration(tx, table, values)).id, 42);
});