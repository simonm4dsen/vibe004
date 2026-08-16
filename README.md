# Shared Group Calendar

A small web app for sharing your upcoming personal appointments with a group of
friends or a partner, so everyone can see what the next few weeks look like.

- Create a calendar group with a unique lowercase name and a shared password
- Join a group with that name + password, then pick your display name for the group
- Add your own appointments (title, start, end) and edit or delete them later
- See everyone's upcoming appointments in one list, soonest first
- Browse a calendar with a **week** view (members × days) and a **month** view

Built with Next.js (App Router), Drizzle ORM and Neon Postgres. Deploys to Vercel.

![Week view](docs/screenshot-week.png)

The month view, with colour-coded chips per member:

![Month view](docs/screenshot-month.png)

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, Server Actions), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Neon Postgres via Drizzle ORM (`drizzle-orm/neon-http`) |
| Auth | Email + password accounts, bcrypt hashes, signed JWT session cookie (`jose`) |
| Validation | `zod` on every server action |
| Hosting | Vercel |

## Environment variables

Copy `.env.example` to `.env.local` and fill in three values:

| Variable | Where it comes from |
| --- | --- |
| `DATABASE_URL` | Neon connection string with **pooling enabled** (host contains `-pooler`). Used by the app at runtime. |
| `DATABASE_URL_UNPOOLED` | The same Neon connection string **without** `-pooler`. Only used by `drizzle-kit` for migrations. |
| `AUTH_SECRET` | Generated locally: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Signs the session cookie. |

Nothing else is needed from Neon — no API key, no project ID. Keep `sslmode=require`
in the connection strings. The Neon password is only shown once in the console; use
"Reset password" if you lose it.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values above
npm run db:migrate           # creates the tables
npm run dev                  # http://localhost:3000
```

Then: create an account → create a group → share the group name and password with the
others → everyone adds their appointments.

### Testing from other devices on your network

```bash
npm run dev -- -H 0.0.0.0
```

Others on the same network can then reach it at `http://<your-lan-ip>:3000` (find it with
`ipconfig` on Windows or `ipconfig getifaddr en0` on macOS). Windows may prompt to allow
Node through the firewall the first time.

Use `npm run dev` rather than `npm run build && npm start` for this. The session cookie is
marked `Secure` in production, and browsers discard `Secure` cookies sent over plain
`http://`, so sign-in silently fails on a LAN address. `localhost` is exempt, which is why
a production build still works on your own machine. On Vercel everything is served over
HTTPS, so this only affects local network testing.

### Running against a local Postgres instead of Neon

Any non-Neon `DATABASE_URL` automatically uses the `node-postgres` driver, so you can
develop against a plain Postgres container:

```bash
docker run -d --name sgc-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sgc -p 55432:5432 postgres:16
# .env.local
# DATABASE_URL="postgresql://postgres:postgres@localhost:55432/sgc"
# DATABASE_URL_UNPOOLED="postgresql://postgres:postgres@localhost:55432/sgc"
npm run db:migrate
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate a new SQL migration from `src/db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations from `drizzle/` |
| `npm run db:studio` | Drizzle Studio |

## Deploying to Vercel

1. Create the Neon project and copy the two connection strings.
2. Import this repository in Vercel (framework preset: Next.js — no extra config needed).
3. Add `DATABASE_URL`, `DATABASE_URL_UNPOOLED` and `AUTH_SECRET` as environment
   variables for Production, Preview and Development.
   If you attach Neon through the Vercel integration, the database variables are
   injected for you and only `AUTH_SECRET` has to be added by hand.
4. Apply migrations once against the Neon database — from your machine, with the same
   `DATABASE_URL_UNPOOLED` set:

   ```bash
   npm run db:migrate
   ```

5. Deploy. Every route is server-rendered on demand, so no extra caching setup is required.

Migrations are intentionally **not** run at request time or during `next build`;
run `npm run db:migrate` whenever `drizzle/` gains a new migration.

## Troubleshooting a deployment

If a deployed site shows *"Application error: a server-side exception has occurred"*,
open **`/api/health`** on that deployment. It checks the things that actually break a
fresh deploy and names the culprit, without exposing any secret values:

```json
{
  "ok": true,
  "checks": {
    "authSecret": { "ok": true, "detail": "set" },
    "databaseUrl": { "ok": true, "detail": "host ep-xxx.neon.tech, database neondb, driver neon-http" },
    "database":    { "ok": true, "detail": "reachable" },
    "schema":      { "ok": true, "detail": "all 4 tables present" }
  }
}
```

It returns HTTP 503 when something is wrong. Common causes:

| Symptom in `/api/health` | Fix |
| --- | --- |
| `databaseUrl: missing` | Add `DATABASE_URL` in Vercel → Settings → Environment Variables, then **redeploy** — env changes only apply to new deployments. |
| `schema: missing table(s)` | The app is pointed at a database that was never migrated (common when the Vercel/Neon integration provisions a fresh one). Run `npm run db:migrate` with `DATABASE_URL_UNPOOLED` set to *that* database. |
| `database: password authentication failed` | The connection string is stale — copy a fresh one from the Neon dashboard. |
| `authSecret: missing` | Add `AUTH_SECRET`. Changing it invalidates existing sign-ins. |

Environment variables are read defensively: surrounding quotes and stray whitespace are
stripped, and `POSTGRES_URL` / `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING` are
accepted as fallbacks for `DATABASE_URL` so the Vercel Postgres and Neon integrations
work without renaming anything.

## Data model

```
users        id, email (unique, lowercased), password_hash, created_at
groups       id, name (unique, lowercase = the join identifier), password_hash, created_by
memberships  id, group_id, user_id, display_name   unique per (group,user) and (group,lower(display_name))
appointments id, group_id, member_id, title, starts_at, ends_at, created_at, updated_at
```

Timestamps are stored as `timestamptz` and rendered in each visitor's own timezone.

## Security notes

- Passwords (account and group) are hashed with bcrypt; the group password is a shared
  join secret, not a per-user credential.
- The session is a signed JWT in an httpOnly, SameSite=Lax cookie (secure in production).
- Every group read is scoped to the caller's membership; a non-member gets a 404.
- Appointments can only be edited or deleted through queries that also match the
  caller's `member_id`, so ownership is enforced by the database write itself.
