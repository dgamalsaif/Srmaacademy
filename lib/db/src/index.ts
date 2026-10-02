import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

export * from "./schema";

function createInMemoryDb() {
  console.warn("[AI Studio] DATABASE_URL not configured — using in-memory mock database");

  // In-memory table stores
  const store: Record<string, any[]> = {
    registrations: [],
    service_requests: [],
    coordinators: [],
    research_programs: [],
    program_catalog_bootstrap: [],
    payment_records: [],
    coordinator_portal_settings: [],
    owner_accounts: [],
  };

  let nextId = 100;

  function getTableName(table: any): string {
    if (!table) return "unknown";
    if (typeof table === "string") return table;
    const name = table[Symbol.for("drizzle:Name")] || table._?.name || table.name;
    if (name) return name;
    // Inspect properties
    for (const key of Object.keys(store)) {
      if (table === (schema as any)[key + "Table"] || table === (schema as any)[key]) {
        return key;
      }
    }
    return Object.keys(store).find(k => (table._?.name || "").includes(k)) || "research_programs";
  }

  function getTableRows(table: any): any[] {
    const name = getTableName(table);
    if (!store[name]) {
      store[name] = [];
    }
    return store[name];
  }

  function matchesCondition(row: any, condition: any): boolean {
    if (!condition) return true;
    try {
      // Drizzle BinaryOperands (e.g. eq(table.field, val))
      if (condition.operator === "=" || condition.operator === "eq") {
        const fieldName = condition.left?.name || condition.left?.key || condition.left?._?.name || condition.left?.config?.name || condition.left;
        const val = condition.right;
        if (fieldName) {
          // Direct check
          if (row[fieldName] !== undefined) return row[fieldName] == val;
          // CamelCase to snake_case check
          const snake = String(fieldName).replace(/([A-Z])/g, "_$1").toLowerCase();
          if (row[snake] !== undefined) return row[snake] == val;
          // Snake_case to camelCase check
          const camel = String(fieldName).replace(/_([a-z])/g, (_, g) => g.toUpperCase());
          if (row[camel] !== undefined) return row[camel] == val;
        }
      }
      // Drizzle SQL expression / chunk inspection
      if (condition.queryChunks) {
        let colName: string | null = null;
        for (const chunk of condition.queryChunks) {
          if (chunk && (chunk.name || chunk._?.name || chunk.config?.name)) {
            colName = chunk.name || chunk._?.name || chunk.config?.name;
          } else if (chunk && chunk.value !== undefined && (chunk.constructor?.name === "Param" || typeof chunk.value === "string" || typeof chunk.value === "number")) {
            if (colName) {
              const expected = chunk.value;
              const camel = String(colName).replace(/_([a-z])/g, (_, g) => g.toUpperCase());
              const snake = String(colName).replace(/([A-Z])/g, "_$1").toLowerCase();
              const actual = row[colName] ?? row[camel] ?? row[snake];
              return actual == expected;
            }
          }
        }
      }
    } catch {
      // ignore
    }
    return true;
  }

  const queryBuilder = (targetTable?: any) => {
    let currentTable = targetTable;
    let whereFilter: any = null;
    let limitCount: number | null = null;
    let selectedFields: any = null;

    const builder: any = {
      from(t: any) {
        currentTable = t;
        return builder;
      },
      where(cond: any) {
        whereFilter = cond;
        return builder;
      },
      orderBy(..._args: any[]) {
        return builder;
      },
      limit(n: number) {
        limitCount = n;
        return builder;
      },
      then(onfulfilled: any, onrejected: any) {
        return builder.execute().then(onfulfilled, onrejected);
      },
      catch(onrejected: any) {
        return builder.execute().catch(onrejected);
      },
      async execute() {
        const rows = getTableRows(currentTable);
        let result = rows.filter(r => matchesCondition(r, whereFilter));
        if (limitCount !== null) {
          result = result.slice(0, limitCount);
        }
        if (selectedFields && typeof selectedFields === "object" && !Array.isArray(selectedFields)) {
          result = result.map(r => {
            const projected: any = {};
            for (const k of Object.keys(selectedFields)) {
              projected[k] = r[k] ?? null;
            }
            return projected;
          });
        }
        return result;
      }
    };

    return builder;
  };

  const insertBuilder = (table: any) => {
    let pendingValues: any[] = [];
    let conflictUpdateConfig: any = null;
    const builder: any = {
      values(val: any) {
        if (Array.isArray(val)) {
          pendingValues = val;
        } else {
          pendingValues = [val];
        }
        return builder;
      },
      onConflictDoNothing() {
        return builder;
      },
      onConflictDoUpdate(config?: any) {
        conflictUpdateConfig = config;
        return builder;
      },
      returning(_fields?: any) {
        return builder;
      },
      then(onfulfilled: any, onrejected: any) {
        return builder.execute().then(onfulfilled, onrejected);
      },
      catch(onrejected: any) {
        return builder.execute().catch(onrejected);
      },
      async execute() {
        const rows = getTableRows(table);
        const inserted: any[] = [];
        for (const item of pendingValues) {
          if (conflictUpdateConfig) {
            const targetCol = conflictUpdateConfig.target?.name || conflictUpdateConfig.target?._?.name || "key";
            const existingIdx = rows.findIndex(r => (r[targetCol] ?? r.key) === (item[targetCol] ?? item.key));
            if (existingIdx !== -1) {
              const updates = conflictUpdateConfig.set || {};
              rows[existingIdx] = { ...rows[existingIdx], ...updates, updatedAt: new Date() };
              inserted.push(rows[existingIdx]);
              continue;
            }
          }
          const row = {
            id: ++nextId,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...item,
          };
          rows.unshift(row);
          inserted.push(row);
        }
        return inserted;
      }
    };
    return builder;
  };

  const updateBuilder = (table: any) => {
    let updates: any = {};
    let whereFilter: any = null;

    const builder: any = {
      set(val: any) {
        updates = val;
        return builder;
      },
      where(cond: any) {
        whereFilter = cond;
        return builder;
      },
      returning(_fields?: any) {
        return builder;
      },
      then(onfulfilled: any, onrejected: any) {
        return builder.execute().then(onfulfilled, onrejected);
      },
      catch(onrejected: any) {
        return builder.execute().catch(onrejected);
      },
      async execute() {
        const rows = getTableRows(table);
        const updated: any[] = [];
        for (let i = 0; i < rows.length; i++) {
          if (matchesCondition(rows[i], whereFilter)) {
            rows[i] = { ...rows[i], ...updates, updatedAt: new Date() };
            updated.push(rows[i]);
          }
        }
        return updated;
      }
    };
    return builder;
  };

  const deleteBuilder = (table: any) => {
    let whereFilter: any = null;

    const builder: any = {
      where(cond: any) {
        whereFilter = cond;
        return builder;
      },
      returning(_fields?: any) {
        return builder;
      },
      then(onfulfilled: any, onrejected: any) {
        return builder.execute().then(onfulfilled, onrejected);
      },
      catch(onrejected: any) {
        return builder.execute().catch(onrejected);
      },
      async execute() {
        const name = getTableName(table);
        const rows = store[name] || [];
        const deleted: any[] = [];
        const remaining: any[] = [];
        for (const r of rows) {
          if (matchesCondition(r, whereFilter)) {
            deleted.push(r);
          } else {
            remaining.push(r);
          }
        }
        store[name] = remaining;
        return deleted;
      }
    };
    return builder;
  };

  const mockDb: any = {
    select(fields?: any) {
      const b = queryBuilder();
      (b as any).selectedFields = fields;
      return b;
    },
    insert(table: any) {
      return insertBuilder(table);
    },
    update(table: any) {
      return updateBuilder(table);
    },
    delete(table: any) {
      return deleteBuilder(table);
    },
    async execute(_sql: any) {
      return { rows: [] };
    },
    async transaction(callback: any) {
      return await callback(mockDb);
    },
    query: new Proxy({}, {
      get: () => ({
        findMany: async () => [],
        findFirst: async () => null,
      })
    })
  };

  return mockDb;
}

const isProduction = process.env.NODE_ENV === "production";
let activePool: any = null;
let postgresDb: any = null;
const inMemoryDb: any = createInMemoryDb();
let useInMemory = false;

if (process.env.DATABASE_URL) {
  try {
    const rawUrl = process.env.DATABASE_URL.trim().split(" ")[0];
    const parsed = new URL(rawUrl);
    const safeHost = parsed.hostname;
    // Render internal hostnames like "dpg-xxxx" cannot be resolved outside Render's private network
    if (!safeHost.includes(".") && safeHost !== "localhost") {
      if (isProduction) {
        console.error(`[FATAL] Hostname "${safeHost}" is an internal cluster address not resolvable in production container.`);
        throw new Error("Invalid production DATABASE_URL hostname");
      }
      console.warn(`[DB] Hostname "${safeHost}" is an internal cluster address not resolvable in this container. Using resilient in-memory database.`);
      useInMemory = true;
    } else {
      const isNeon = safeHost.includes("neon.tech");
      const isSsl = isNeon || rawUrl.includes("sslmode=require") || rawUrl.includes("ssl=true");

      activePool = new Pool({
        connectionString: rawUrl,
        connectionTimeoutMillis: 15000,
        idleTimeoutMillis: 30000,
        ...(isSsl ? { ssl: { rejectUnauthorized: false } } : {}),
      });

      activePool.on("error", (err: any) => {
        console.error("[DB] Unexpected idle PostgreSQL client error on pool:", err.message);
      });

      postgresDb = drizzle(activePool, { schema });

      activePool.query("SELECT 1 AS database_ready").catch((err: any) => {
        if (isProduction) {
          console.error(`[FATAL] PostgreSQL connection verification failed in production on host "${safeHost}":`, err.message);
        } else {
          console.warn("[DB] PostgreSQL connection check failed, switching to resilient in-memory database:", err.message);
          useInMemory = true;
        }
      });
    }
  } catch (err: any) {
    if (isProduction) {
      console.error("[FATAL] Failed to initialize Postgres connection pool in production:", err.message);
      throw err;
    }
    console.warn("[DB] Failed to initialize Postgres connection pool:", err.message);
    useInMemory = true;
  }
} else {
  if (isProduction) {
    console.error("[FATAL] DATABASE_URL is strictly required in production mode. Startup aborted.");
    throw new Error("DATABASE_URL is required in production");
  }
  useInMemory = true;
}

// Graceful pool closure on process termination
let isTerminating = false;
const handleProcessShutdown = async () => {
  if (isTerminating || !activePool) return;
  isTerminating = true;
  try {
    await activePool.end();
  } catch {}
};
process.once("SIGTERM", handleProcessShutdown);
process.once("SIGINT", handleProcessShutdown);

export async function checkDatabaseReadiness(): Promise<{ ready: boolean; host: string }> {
  if (!activePool) {
    return { ready: !isProduction && useInMemory, host: useInMemory ? "in-memory-mock" : "disconnected" };
  }
  try {
    await activePool.query("SELECT 1 AS database_ready");
    let safeHost = "unknown";
    try {
      safeHost = new URL(process.env.DATABASE_URL || "").hostname;
    } catch {}
    return { ready: true, host: safeHost };
  } catch {
    return { ready: false, host: "connection-error" };
  }
}

export const pool = activePool;
export const db: any = new Proxy({}, {
  get(_target, prop) {
    if (useInMemory || !postgresDb) {
      return inMemoryDb[prop];
    }
    const targetVal = postgresDb[prop];
    if (typeof targetVal !== "function") {
      return targetVal;
    }
    return (...args: any[]) => {
      try {
        const result = targetVal.apply(postgresDb, args);
        if (result && typeof result.then === "function") {
          return result.catch((err: any) => {
            const msg = String(err.message || "");
            const code = err.code || "";
            const isConnErr = code === "EAI_AGAIN" || code === "ENOTFOUND" || code === "ECONNREFUSED" || code === "ETIMEDOUT" || msg.includes("Failed query") || msg.includes("getaddrinfo");
            if (isConnErr && !isProduction) {
              console.warn("[DB] PostgreSQL call failed with connection error, falling back to in-memory store in development:", msg);
              useInMemory = true;
              return inMemoryDb[prop](...args);
            }
            throw err;
          });
        }
        return result;
      } catch (err: any) {
        if (!isProduction) {
          console.warn("[DB] Sync error on PostgreSQL call, falling back to in-memory store in development:", err.message);
          useInMemory = true;
          return inMemoryDb[prop](...args);
        }
        throw err;
      }
    };
  }
});
