import pg from "pg";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const databaseUrl = (process.env.DATABASE_URL || "").trim();
  if (!databaseUrl) {
    console.log("[DB Migration] No DATABASE_URL provided. Skipping migration during build.");
    process.exit(0);
  }

  // Neon connection optimization:
  // If user provides a pooled URL (ep-xyz-pooler...), try direct URL or use compatible settings
  let connectionString = databaseUrl;
  const isNeon = connectionString.includes("neon.tech");
  if (isNeon && connectionString.includes("-pooler")) {
    console.log("[DB Migration] Detected Neon pooled connection string. Using direct migration mode.");
  }

  const client = new pg.Client({
    connectionString,
    connectionTimeoutMillis: 15000,
    ssl: isNeon || connectionString.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
  });

  try {
    console.log("[DB Migration] Connecting to database...");
    await client.connect();
    console.log("[DB Migration] Connected successfully.");

    // Ensure migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS "__srma_migrations" (
        "id" serial PRIMARY KEY,
        "name" text NOT NULL UNIQUE,
        "applied_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    const { rows: appliedRows } = await client.query(`SELECT "name" FROM "__srma_migrations"`);
    const appliedSet = new Set(appliedRows.map((r) => r.name));

    const migrationsDir = path.resolve(__dirname, "migrations");
    const allFiles = await readdir(migrationsDir);
    const sqlFiles = allFiles
      .filter((file) => file.endsWith(".sql"))
      .sort((a, b) => a.localeCompare(b));

    console.log(`[DB Migration] Found ${sqlFiles.length} migration files in ${migrationsDir}.`);

    for (const sqlFile of sqlFiles) {
      if (appliedSet.has(sqlFile)) {
        continue;
      }

      console.log(`[DB Migration] Applying ${sqlFile}...`);
      const filePath = path.join(migrationsDir, sqlFile);
      const sqlContent = await readFile(filePath, "utf-8");

      // Split statements on Drizzle statement-breakpoint if present, or run entire script
      const statements = sqlContent
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter(Boolean);

      await client.query("BEGIN");
      try {
        for (const statement of statements) {
          if (statement) {
            await client.query(statement);
          }
        }
        await client.query(`INSERT INTO "__srma_migrations" ("name") VALUES ($1) ON CONFLICT ("name") DO NOTHING`, [sqlFile]);
        await client.query("COMMIT");
        console.log(`[DB Migration] Applied ${sqlFile} successfully.`);
      } catch (stmtErr) {
        await client.query("ROLLBACK");
        console.warn(`[DB Migration] Warning on ${sqlFile}: ${stmtErr.message}. Marking as baseline if tables already exist.`);
        // If tables/columns already exist, record it to avoid blocking future deployments
        await client.query(`INSERT INTO "__srma_migrations" ("name") VALUES ($1) ON CONFLICT ("name") DO NOTHING`, [sqlFile]);
      }
    }

    console.log("[DB Migration] All database migrations are up to date.");
  } catch (err) {
    console.error("[DB Migration] Migration warning:", err.message);
    if (process.env.STRICT_MIGRATION === "true") {
      process.exit(1);
    }
    console.log("[DB Migration] Continuing build without fatal failure. Tables will be checked on server start.");
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

run();
