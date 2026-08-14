import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

type Database = NeonHttpDatabase<typeof schema>;

let instance: Database | null = null;

function isNeonUrl(url: string): boolean {
  return url.includes(".neon.tech");
}

function getDb(): Database {
  if (instance) return instance;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon connection string.",
    );
  }

  if (isNeonUrl(connectionString)) {
    instance = drizzle(neon(connectionString), { schema });
  } else {
    // Any other Postgres (e.g. a local Docker instance for development) goes
    // through node-postgres. The query API is identical.
    instance = drizzleNodePostgres(connectionString, {
      schema,
    }) as unknown as Database;
  }

  return instance;
}

/**
 * Lazy proxy so importing this module never needs the connection string — only
 * an actual query does. Keeps `next build` working without a live database.
 */
export const db = new Proxy({} as Database, {
  get(_target, property) {
    const client = getDb();
    const value = client[property as keyof Database];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export { schema };
