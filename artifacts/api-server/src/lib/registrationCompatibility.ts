import { getTableColumns, sql, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

const OPTIONAL_ANSWER_COLUMNS = new Set([
  "academic_degree", "has_research_experience",
  "research_experience_details", "agreed_to_fee_and_tasks",
]);

type Transaction = {
  execute(query: SQL): Promise<unknown>;
  insert(table: PgTable): {
    values(values: Record<string, unknown>): {
      returning(): Promise<Record<string, unknown>[]>;
    };
  };
};

function resultRows(result: unknown): Record<string, unknown>[] {
  if (Array.isArray(result)) return result;
  return (result as { rows?: Record<string, unknown>[] } | null)?.rows || [];
}

/** Keep older clients' answers, without requiring a production schema change. */
export function normalizeRegistrationAnswers(source: Record<string, unknown>): Record<string, unknown> {
  return {
    ...source,
    hasResearchExperience: source.hasResearchExperience ?? source.hasResearchExp,
    researchExperienceDetails: source.researchExperienceDetails ?? source.researchExpDetails,
    agreedToFeeAndTasks: source.agreedToFeeAndTasks ?? source.agreeFeesAndTasks,
  };
}

/**
 * Some restored databases have the JSON answers column but not newer duplicate
 * answer columns. Inspect the real relation; never run ALTER TABLE or retry an
 * INSERT inside an already-aborted reservation transaction.
 */
export async function insertCompatibleRegistration(
  tx: Transaction,
  table: PgTable,
  values: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const columns = getTableColumns(table);
  const schemaRows = resultRows(await tx.execute(sql`
    SELECT attname AS column_name
    FROM pg_attribute
    WHERE attrelid = to_regclass('registrations')
      AND attnum > 0 AND NOT attisdropped
  `));
  // The existing development-only in-memory adapter has no PostgreSQL catalog.
  // A real missing relation still fails explicitly in the normal INSERT.
  if (!schemaRows.length) {
    const [row] = await tx.insert(table).values(values).returning();
    if (!row) throw new Error("Registration INSERT returned no record");
    return row;
  }
  const available = new Set(schemaRows.map((row) => String(row.column_name)));
  for (const column of Object.values(columns)) {
    if (!available.has(column.name) && !OPTIONAL_ANSWER_COLUMNS.has(column.name)) {
      throw new Error(`Registration schema is missing required column: ${column.name}`);
    }
  }
  const writable = Object.entries(columns).filter(([key, column]) =>
    available.has(column.name) && values[key] !== undefined);
  const returning = Object.entries(columns).filter(([, column]) => available.has(column.name));
  const [row] = resultRows(await tx.execute(sql`
    INSERT INTO ${table} (${sql.join(writable.map(([, column]) => sql.identifier(column.name)), sql`, `)})
    VALUES (${sql.join(writable.map(([key]) => key === "customFields"
      ? sql`${JSON.stringify(values[key])}::jsonb`
      : sql`${values[key]}`), sql`, `)})
    RETURNING ${sql.join(returning.map(([key, column]) =>
      sql`${sql.identifier(column.name)} AS ${sql.identifier(key)}`), sql`, `)}
  `));
  if (!row) throw new Error("Registration INSERT returned no record");
  const answers = (values.customFields || {}) as Record<string, unknown>;
  for (const [key, column] of Object.entries(columns)) {
    if (OPTIONAL_ANSWER_COLUMNS.has(column.name) && !available.has(column.name)) {
      row[key] = answers[key] ?? values[key] ?? "";
    }
  }
  return row;
}