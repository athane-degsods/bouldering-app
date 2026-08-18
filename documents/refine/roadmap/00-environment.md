# Step 0 — Environment

Open this file only. Do not install Expo Router, Zod, or AWS SDK yet.

## Learn

- npm workspaces: one `npm install` at the **repo root**.
- Two processes: API on port 4000, Expo on 8081.
- Postgres is a separate process (Docker is enough).

## Do

1. Install Node.js LTS (20 or 22). Confirm: `node -v`, `npm -v`.
2. From the repo root: `npm install`.
3. Start Postgres (example from `documents/original/boilerplate.md`):

```bash
docker run --name postgres-dev \
  -e POSTGRES_USER=username \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=mydb \
  -p 5432:5432 \
  -d postgres
```

If the container already exists: `docker start postgres-dev`.

4. Put `apps/server/.env` in place (do not commit secrets):

```
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"
```

5. From repo root:

```bash
npm run dev:server
```

In another terminal:

```bash
npm run test:server
npm run lint
npm run dev:mobile
```

6. In a browser or Postman: `GET http://localhost:4000/api/health` should return `status: ok`. Expo should open. Existing tests may pass even before the new migration.

## Do not

- Create AWS keys in this step.
- Add new npm packages.
- Change screens or the schema yet (that is step 1).

## Debugging

### 1. Vulnerable packages on `npm install`

```bash
npm install

up to date, audited 834 packages in 4s

125 packages are looking for funding
  run `npm fund` for details

21 vulnerabilities (7 moderate, 14 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

This log shows the update has been successful and that no action should be taken on the installed packages. 


## Done

- [x] Root `npm install` finished with no errors.
- [x] Postgres is running.
- [x] `DATABASE_URL` is set.
- [x] Health check works.
- [x] `npm run test:server` and `npm run lint` run (fix only failures you caused in this step).
- [x] Expo starts.

Then go to [01-schema-test-user.md](01-schema-test-user.md).
