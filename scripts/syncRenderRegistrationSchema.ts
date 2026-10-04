import pg from "pg";
import { readFile } from "node:fs/promises";
import { getPostgresConnectionConfig } from "../lib/db/src/connection-config";

const migrationName = "0011_registration_answers.sql";
const answerColumns = ["academic_degree", "has_research_experience", "research_experience_details", "agreed_to_fee_and_tasks"];
const requiredColumns = [
  "id", "full_name", "specialization", "email", "whatsapp", "affiliation",
  "country", "city", "orcid", "custom_fields", "research_id", "research_title",
  "author_role", "coordinator_id", "status", "created_at",
];
class SafetyError extends Error {}

async function run() {
  const apply = process.argv.includes("--apply");
  const nameArgument = process.argv.indexOf("--database");
  const expectedDatabase = nameArgument >= 0 ? process.argv[nameArgument + 1] : undefined;
  const databaseUrl = process.env.RENDER_DATABASE_URL;
  if (!databaseUrl) throw new SafetyError("RENDER_DATABASE_URL is required. No database was changed.");
  let parsed: URL;
  try { parsed = new URL(databaseUrl); }
  catch { throw new SafetyError("The supplied Render database URL is invalid."); }
  const host = parsed.hostname;
  if (!host.startsWith("dpg-") || !host.endsWith(".render.com")) {
    throw new SafetyError("Use the external Render PostgreSQL URL. Refusing an unverified database target.");
  }
  if (apply && !expectedDatabase) {
    throw new SafetyError("Run --check first, then --apply --database <verified database name>.");
  }
  // External Render PostgreSQL requires TLS. Never downgrade certificate checks.
  parsed.searchParams.delete("ssl");
  parsed.searchParams.set("sslmode", "verify-full");
  const client = new pg.Client(getPostgresConnectionConfig(parsed.toString()));
  let transactionOpen = false;
  try {
    await client.connect();
    await client.query(apply ? "BEGIN" : "BEGIN READ ONLY");
    transactionOpen = true;
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '60s'");
    const {rows: identity} = await client.query("SELECT current_database() AS database, current_schema() AS schema");
    const database = identity[0].database as string;
    if (apply && database !== expectedDatabase) {
      throw new SafetyError("Database identity differs from the verified target. No changes applied.");
    }
    const {rows: columns} = await client.query(`
      SELECT attname AS name, format_type(atttypid, atttypmod) AS type
      FROM pg_attribute WHERE attrelid = to_regclass('registrations')
        AND attnum > 0 AND NOT attisdropped
    `);
    const present = new Set(columns.map(column => column.name));
    const missingRequired = requiredColumns.filter(column => !present.has(column));
    const missingAnswers = answerColumns.filter(column => !present.has(column));
    if (apply && present.has("id")) {
      await client.query("SELECT pg_advisory_xact_lock(4219209)");
      await client.query("LOCK TABLE registrations IN SHARE ROW EXCLUSIVE MODE");
    }
    const count = present.has("id")
      ? (await client.query("SELECT count(*)::text AS count FROM registrations")).rows[0].count
      : null;
    console.log(JSON.stringify({mode: apply ? "apply" : "check", database, schema: identity[0].schema,
      registrationCount: count, missingRequiredColumns: missingRequired, missingAnswerColumns: missingAnswers}));
    if (!apply) {
      await client.query("ROLLBACK");
      transactionOpen = false;
      return;
    }
    if (missingRequired.length) {
      throw new SafetyError(`Required base columns are missing: ${missingRequired.join(", ")}. Review the schema first.`);
    }
    if (columns.find(column => column.name === "custom_fields")?.type !== "jsonb") {
      throw new SafetyError("Existing custom_fields is not JSONB. Review before modifying.");
    }
    for (const column of columns.filter(column => answerColumns.includes(column.name))) {
      if (column.type !== "text") throw new SafetyError(`Existing answer column ${column.name} is not text.`);
    }
    const migration = await readFile(new URL(`../lib/db/migrations/${migrationName}`, import.meta.url), "utf8");
    for (const statement of migration.split("--> statement-breakpoint").filter(part => part.trim())) {
      await client.query(statement);
    }
    const afterCount = (await client.query("SELECT count(*)::text AS count FROM registrations")).rows[0].count;
    if (count !== afterCount) throw new SafetyError("Registration count changed unexpectedly. Rolling back.");
    const history = await client.query("SELECT to_regclass('__srma_migrations') AS relation");
    if (history.rows[0].relation) {
      await client.query(`INSERT INTO "__srma_migrations" ("name") VALUES ($1) ON CONFLICT ("name") DO NOTHING`, [migrationName]);
    }
    await client.query("COMMIT");
    transactionOpen = false;
    console.log(JSON.stringify({applied: migrationName, registrationCount: afterCount, seatsModified: false}));
  } finally {
    if (transactionOpen) await client.query("ROLLBACK").catch(() => undefined);
    await client.end().catch(() => undefined);
  }
}

run().catch((error: unknown) => {
  if (error instanceof SafetyError) console.error(error.message);
  else {
    const code = (error as {code?: string})?.code;
    console.error("Render schema operation failed; uncommitted changes were rolled back.",
      code && /^[A-Z0-9_]{1,30}$/.test(code) ? `Code: ${code}` : "");
  }
  process.exitCode = 1;
});