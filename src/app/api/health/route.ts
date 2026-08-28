import { sql } from "drizzle-orm";

import { db } from "@/db";
import {
  DATABASE_URL_KEYS,
  describeDatabaseUrl,
  getAuthSecret,
  getDatabaseUrl,
} from "@/lib/env";

export const dynamic = "force-dynamic";

type Check = {
  ok: boolean;
  detail: string;
};

/**
 * Deployment diagnostics. Reports configuration and connectivity problems
 * without ever echoing secret values — only host names, which are not secret.
 */
export async function GET() {
  const checks: Record<string, Check> = {};

  const secret = getAuthSecret();
  checks.authSecret = secret
    ? secret.length >= 16
      ? { ok: true, detail: "set" }
      : {
          ok: false,
          detail: `set but only ${secret.length} characters; needs at least 16`,
        }
    : { ok: false, detail: "missing — add AUTH_SECRET and redeploy" };

  const url = getDatabaseUrl();

  if (!url) {
    checks.databaseUrl = {
      ok: false,
      detail: `missing — none of ${DATABASE_URL_KEYS.join(", ")} are set`,
    };
    checks.database = { ok: false, detail: "skipped, no connection string" };
    checks.schema = { ok: false, detail: "skipped, no connection string" };

    return Response.json({ ok: false, checks }, { status: 503 });
  }

  const described = describeDatabaseUrl(url);
  checks.databaseUrl = described.valid
    ? {
        ok: true,
        detail: `host ${described.host}, database ${described.database ?? "?"}, driver ${described.driver}`,
      }
    : { ok: false, detail: described.reason ?? "unusable" };

  if (!described.valid) {
    checks.database = { ok: false, detail: "skipped, connection string unusable" };
    checks.schema = { ok: false, detail: "skipped, connection string unusable" };

    return Response.json({ ok: false, checks }, { status: 503 });
  }

  try {
    await db.execute(sql`select 1`);
    checks.database = { ok: true, detail: "reachable" };
  } catch (error) {
    checks.database = { ok: false, detail: messageFor(error) };
    checks.schema = { ok: false, detail: "skipped, database unreachable" };

    return Response.json({ ok: false, checks }, { status: 503 });
  }

  const expected = ["users", "groups", "memberships", "appointments", "todo_items"];

  try {
    const result = await db.execute<{ table_name: string }>(
      sql`select table_name from information_schema.tables where table_schema = 'public'`,
    );
    const rows = Array.isArray(result) ? result : (result.rows ?? []);
    const present = new Set(rows.map((row) => row.table_name));
    const missing = expected.filter((table) => !present.has(table));

    checks.schema =
      missing.length === 0
        ? { ok: true, detail: `all ${expected.length} tables present` }
        : {
            ok: false,
            detail: `missing table(s): ${missing.join(", ")} — run "npm run db:migrate" against this database`,
          };
  } catch (error) {
    checks.schema = { ok: false, detail: messageFor(error) };
  }

  const ok = Object.values(checks).every((check) => check.ok);

  return Response.json({ ok, checks }, { status: ok ? 200 : 503 });
}

function messageFor(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
