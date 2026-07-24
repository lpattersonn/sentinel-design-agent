import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

const globalForDb = globalThis as unknown as { __sentinelSql?: postgres.Sql };

function getSql(): postgres.Sql {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Configure your Supabase connection string (transaction pooler, port 6543).",
    );
  }
  if (!globalForDb.__sentinelSql) {
    // prepare: false is required for Supabase's transaction-mode pooler (pgbouncer).
    globalForDb.__sentinelSql = postgres(process.env.DATABASE_URL, {
      prepare: false,
      max: 5,
    });
  }
  return globalForDb.__sentinelSql;
}

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    _db = drizzle(getSql(), { schema });
  }
  return _db;
}

export { schema };
