import { db, programCatalogBootstrapTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const CAPACITY_MIGRATION_KEY = "program-capacity-and-author-roles-v1";
const CAPACITY_MIGRATION_LOCK_ID = 4_218_999;

type DatabaseTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Applies the one-time legacy allocation model before any seats can be reserved.
 * The database advisory lock is shared by public catalog reads and registrations,
 * so an in-flight reservation cannot be missed by the backfill count.
 */
export async function ensureProgramCapacityModel(tx: DatabaseTransaction) {
  await tx.execute(sql`SELECT pg_advisory_xact_lock(${CAPACITY_MIGRATION_LOCK_ID})`);
  const [migration] = await tx
    .select()
    .from(programCatalogBootstrapTable)
    .where(eq(programCatalogBootstrapTable.key, CAPACITY_MIGRATION_KEY))
    .limit(1);
  if (migration) return;

  await tx.execute(sql`
    WITH ranked_registrations AS (
      SELECT id, research_id, ROW_NUMBER() OVER (PARTITION BY research_id ORDER BY created_at, id) AS position
      FROM registrations
    )
    UPDATE registrations AS registration
    SET author_role = CASE WHEN ranked_registrations.position = 1 THEN 'first_author' ELSE 'co_author' END
    FROM ranked_registrations
    WHERE registration.id = ranked_registrations.id
  `);
  await tx.execute(sql`
    WITH registration_counts AS (
      SELECT
        research_id,
        COUNT(*) FILTER (WHERE author_role = 'first_author')::int AS first_author_count,
        COUNT(*) FILTER (WHERE author_role <> 'first_author')::int AS co_author_count
      FROM registrations
      GROUP BY research_id
    )
    UPDATE research_programs AS program
    SET
      total_seats = 15,
      first_author_seats = 1,
      co_author_seats = 14,
      first_author_seats_left = GREATEST(0, 1 - COALESCE(registration_counts.first_author_count, 0)),
      co_author_seats_left = GREATEST(0, 14 - COALESCE(registration_counts.co_author_count, 0)),
      seats_left = GREATEST(0, 1 - COALESCE(registration_counts.first_author_count, 0))
        + GREATEST(0, 14 - COALESCE(registration_counts.co_author_count, 0)),
      status = CASE
        WHEN program.status = 'open'
          AND GREATEST(0, 1 - COALESCE(registration_counts.first_author_count, 0))
            + GREATEST(0, 14 - COALESCE(registration_counts.co_author_count, 0)) = 0
        THEN 'seats_full'
        ELSE program.status
      END
    FROM registration_counts
    WHERE program.id = registration_counts.research_id
  `);
  await tx.execute(sql`
    UPDATE research_programs
    SET total_seats = 15, seats_left = 15,
        first_author_seats = 1, first_author_seats_left = 1,
        co_author_seats = 14, co_author_seats_left = 14
    WHERE id NOT IN (SELECT DISTINCT research_id FROM registrations)
  `);
  await tx.insert(programCatalogBootstrapTable).values({ key: CAPACITY_MIGRATION_KEY });
}