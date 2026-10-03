import type { PoolConfig } from "pg";

/** Prepare a connection without connecting, guessing a database name, or changing schema. */
export function getPostgresConnectionConfig(databaseUrl: string): PoolConfig {
  const parsed = new URL(databaseUrl.trim());
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new Error("DATABASE_URL must use the postgres or postgresql protocol");
  }

  // Render private-network hostnames need not contain a dot. PostgreSQL itself
  // verifies connectivity; rejecting these names would block valid deployments.
  const sslMode = parsed.searchParams.get("sslmode");
  const legacyVerifiedModes = ["prefer", "require", "verify-ca"];
  if (
    (sslMode && legacyVerifiedModes.includes(sslMode)) ||
    (!sslMode && (parsed.hostname.endsWith(".neon.tech") || parsed.searchParams.get("ssl") === "true"))
  ) {
    // Preserve pg's current verified TLS behavior explicitly, without disabling
    // certificate verification or relying on aliases that change in pg v9.
    parsed.searchParams.delete("ssl");
    parsed.searchParams.set("sslmode", "verify-full");
  }

  return {
    connectionString: parsed.toString(),
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
  };
}