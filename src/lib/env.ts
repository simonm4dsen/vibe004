/**
 * Environment variables are frequently pasted into hosting dashboards with
 * stray quotes or whitespace, which produces confusing runtime failures. These
 * helpers normalise the value and resolve the common aliases that Vercel's
 * Postgres/Neon integrations inject.
 */

function clean(raw: string | undefined): string | undefined {
  if (typeof raw !== "string") return undefined;

  let value = raw.trim();

  // A value pasted as `DATABASE_URL="postgres://..."` keeps its quotes.
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      value = value.slice(1, -1).trim();
    }
  }

  return value.length > 0 ? value : undefined;
}

export function readEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = clean(process.env[name]);
    if (value) return value;
  }

  return undefined;
}

/** Names checked for the pooled connection used by the running app. */
export const DATABASE_URL_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
] as const;

export function getDatabaseUrl(): string | undefined {
  return readEnv(...DATABASE_URL_KEYS);
}

export function getAuthSecret(): string | undefined {
  return readEnv("AUTH_SECRET");
}

export function describeDatabaseUrl(url: string): {
  valid: boolean;
  host?: string;
  database?: string;
  driver: "neon-http" | "node-postgres";
  reason?: string;
} {
  const driver = url.includes(".neon.tech") ? "neon-http" : "node-postgres";

  if (!/^postgres(ql)?:\/\//i.test(url)) {
    return {
      valid: false,
      driver,
      reason:
        "Value does not start with postgres:// or postgresql:// — check for stray quotes, a copied `psql` prefix, or a truncated paste.",
    };
  }

  try {
    const parsed = new URL(url);
    return {
      valid: true,
      host: parsed.hostname,
      database: parsed.pathname.replace(/^\//, "") || undefined,
      driver,
    };
  } catch {
    return { valid: false, driver, reason: "Value is not a parsable URL." };
  }
}
