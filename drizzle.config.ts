import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config({ path: ".env" });

const url =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL ??
  // `drizzle-kit generate` only reads the schema, so a placeholder keeps it usable
  // without credentials. `migrate`/`studio` fail loudly if this is not a real URL.
  "postgresql://user:password@localhost:5432/placeholder";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
