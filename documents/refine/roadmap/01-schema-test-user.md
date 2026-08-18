# Step 1 — Schema + test user

## What Prisma is

Postgres stores tables and rows. You could write SQL by hand. **Prisma** sits in the middle so you describe tables in a simple file, and it:

1. Updates Postgres for you (migrations).
2. Gives the Express app typed functions like `prisma.user.findMany()`.

Think: **schema file = drawing of the tables.** Prisma turns that drawing into SQL and into TypeScript.

You do **not** install Prisma again. It is already in `apps/server`.

## The files (only these matter now)

| File | What it is |
|------|------------|
| `apps/server/prisma/schema.prisma` | The drawing: `User` and `Ascent` |
| `apps/server/prisma/migrations/` | Saved SQL history. Each folder is one change. |
| `apps/server/prisma/seed.ts` | Script that inserts the test climber |
| `apps/server/prisma.config.ts` | Tells Prisma where the schema is and how to seed |
| `apps/server/.env` | `DATABASE_URL` — how to reach Postgres (from step 0) |

A **model** in `schema.prisma` is one table. `User` has many `Ascent` rows. `Ascent.userId` points at `User.id`.

A **`?`** on a field means optional (can be empty). `imageKey` and `videoKey` stay empty until later steps.

A **seed** is not a table. It is “run this once so the test user exists.”

## Commands (run in order)

Always run them from **`apps/server`** (Prisma lives there), with Postgres running and `.env` set.

| Command | Plain English |
|---------|----------------|
| `npx prisma migrate dev` | Compare schema ↔ database. Create/apply SQL so tables match. |
| `npx prisma generate` | Rebuild the TypeScript client the server imports. |
| `npm run db:seed` | Insert or update `test@bouldering.app`. |
| `npx prisma studio` | Opens a browser UI. Click tables. No SQL needed. |

If `migrate dev` asks for a **name** and `prisma/migrations/20260818053000_ascent_log_fields` already exists, do **not** create a second migration. Let it apply the one that is already there (or use `npx prisma migrate deploy`).

If it says it cannot connect: go back to step 0 (`docker start postgres-dev`, check `DATABASE_URL`).

## Do

```bash
cd apps/server
npx prisma migrate dev
npx prisma generate
npm run db:seed
npx prisma studio
```

In Studio, open **User**. You should see one row:

- email: `test@bouldering.app`
- name: `Test Climber`
- id: `00000000-0000-4000-8000-000000000001`

Open **Ascent**. Columns should include `attempts`, `completed`, `notes`, `imageKey`, `videoKey` (rows can be empty).

## Do not

- Add password/auth columns.
- Add a Goal table.
- Wire S3.
- Edit old files inside `migrations/` by hand.

## Done

Seeded test user exists. New ascent columns exist.

Then [02-navigation.md](02-navigation.md).
