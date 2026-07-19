import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "@/lib/env";

let db: ReturnType<typeof drizzle> | null = null;

/** Cria a ligação à base de dados só na primeira utilização (lazy). */
export function getDb() {
  if (!db) {
    const client = postgres(getEnv().DATABASE_URL, { prepare: false });
    db = drizzle(client);
  }
  return db;
}
