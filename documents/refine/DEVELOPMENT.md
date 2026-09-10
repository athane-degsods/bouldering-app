# Development guide

How a teammate gets **Boulder Logs** running and proves it works. This is the runbook. Product and design live in [`README.md`](README.md) and `documents/refine/`.

You need **four processes** for a full demo:

1. PostgreSQL (Docker)
2. MinIO (Docker) — photos
3. Express (`npm run dev:server`)
4. Expo (`npm run dev:mobile`)

Prisma Studio is optional (inspect rows).

The team develops on **Windows** as well as Unix. Commands below show both where they differ.

---

## 1. What you need installed

| Tool | Version / notes |
|------|-----------------|
| Node.js | LTS **20 or 22**. Check: `node -v`, `npm -v` |
| npm | Comes with Node. Workspaces require npm 7+ |
| Docker Desktop | For Postgres and MinIO |
| Git | Clone the repo |
| Expo Go (optional) | Physical phone. Web and emulators also work |

You do **not** need an AWS account. MinIO speaks the S3 API on your laptop.

---

## 2. Clone and install

From the **repository root** (the folder that contains `apps/` and this file):

```bash
git clone <repo-url>
cd bouldering-app
npm install
```

One `npm install` at the root installs `apps/mobile` and `apps/server` (npm workspaces). Do not `npm install` only inside one app unless you know you need a new package there.

`npm audit` may print moderate/high issues. That is expected on this boilerplate. Do not `npm audit fix --force` unless the team agrees.

---

## 3. PostgreSQL

### First time

```bash
docker run --name postgres-dev \
  -e POSTGRES_USER=username \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=mydb \
  -p 5432:5432 \
  -d postgres
```

PowerShell (same flags, backticks for line breaks):

```powershell
docker run --name postgres-dev `
  -e POSTGRES_USER=username `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=mydb `
  -p 5432:5432 `
  -d postgres
```

If Docker says the name is taken:

```bash
docker start postgres-dev
```

Confirm: `docker ps` shows `postgres-dev` on `5432`.

These credentials must match `DATABASE_URL` in step 5 (`username` / `password` / `mydb`). If you already have a different local Postgres, either use that URL or stop the other service on 5432.

---

## 4. MinIO (photo storage)

### First time

```bash
docker run -d --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

PowerShell: use `` ` `` instead of `\`.

If it already exists: `docker start minio`.

| URL | What |
|-----|------|
| http://localhost:9000 | S3 API (SDK, PUT/GET from the phone) |
| http://localhost:9001 | Browser console |

Console login: **minioadmin** / **minioadmin**.

**Create a private bucket named `bouldering`.** Console → Buckets → Create bucket. Do **not** turn on anonymous download.

Community MinIO has **no bucket CORS screen**. Global CORS already reflects the Expo origin (including whatever port Metro picks, e.g. `8081` or `8650`). You do not need a CORS JSON file for local work.

---

## 5. Server environment file

Create **`apps/server/.env`**. This file is gitignored. Do not commit it.

```
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_ENDPOINT=http://localhost:9000
S3_BUCKET=bouldering
```

Optional, **Android emulator only** (the phone must reach MinIO; `localhost` inside the emulator is the emulator itself):

```
S3_PUBLIC_ENDPOINT=http://10.0.2.2:9000
```

`AWS_ENDPOINT` stays `http://localhost:9000` so **Express** (on the host) can talk to Docker. `S3_PUBLIC_ENDPOINT` is used only when the mobile app sends `client: "android"` on presign. Expo **web** and iOS Simulator keep `localhost:9000` in the signed URL even if this var is set.

Prisma 7 loads env from `apps/server/prisma.config.ts` (`import "dotenv/config"`). Runtime loads env from `apps/server/src/lib/prisma.ts`.

---

## 6. Schema, client, seed

From **`apps/server`** (or use `npx prisma …` with `working_directory` there):

```bash
cd apps/server
npx prisma migrate deploy
npx prisma generate
npm run db:seed
```

- `migrate deploy` applies SQL in `prisma/migrations/` (including `imageKeys` as `TEXT[]`).
- `generate` writes the Prisma client to `apps/server/src/generated/prisma`.
- `db:seed` upserts:

| | |
|--|--|
| User | `test@bouldering.app` / id `00000000-0000-4000-8000-000000000001` |
| Ascent | “Orange Overhang”, V5, id `00000000-0000-4000-8000-000000000011` |

If seed fails with “table does not exist”, migrations did not apply. If generate fails, `.env` `DATABASE_URL` is missing.

Optional GUI:

```bash
cd apps/server
npx prisma studio
```

Opens a browser on the tables. After a photo Save you should see `imageKeys` as an array of strings like `ascents/<user-id>/<uuid>-climb.jpg`.

---

## 7. Start Express

From the **repo root**:

```bash
npm run dev:server
```

This runs `tsx watch` on `apps/server`. You should see:

```text
Server running on http://localhost:4000
```

Smoke check (browser, curl, or Insomnia):

```bash
curl http://localhost:4000/api/health
```

Expect JSON with `"status": "ok"`.

```bash
curl http://localhost:4000/api/users/test
curl http://localhost:4000/api/ascents
```

Expect the seeded climber and at least the Orange Overhang row (`imageKeys` is an array, possibly empty).

Keep this terminal open. If you change Prisma schema, stop Express, `migrate` + `generate`, start it again.

---

## 8. Start Expo

Second terminal, **repo root**:

```bash
npm run dev:mobile
```

That is `expo start` in `apps/mobile`.

| Target | How |
|--------|-----|
| Web | Press `w`, or open the **Web** URL Metro prints (often `http://localhost:8081`). If 8081 is busy, Expo asks for another port (e.g. `8650`). Use that URL. |
| Android emulator | Press `a`. API base URL is already `http://10.0.2.2:4000`. For photos set `S3_PUBLIC_ENDPOINT` as in §5 and restart Express. |
| iOS simulator | Press `i` (macOS). API is `http://localhost:4000`. |
| Physical phone | Expo Go, same Wi‑Fi. Change `BASE_URL` in `apps/mobile/src/api/client.ts` to your laptop’s LAN IP (`http://192.168.x.x:4000`) **and** set `S3_PUBLIC_ENDPOINT` to `http://192.168.x.x:9000`. `localhost` on the phone is the phone. |

**Do not** open `http://localhost:8081/_layout.tsx`. Layout files are not routes. Home is `/` (`app/(tabs)/index.tsx`).

After `app.json` plugin changes, restart Metro with a clear cache:

```bash
npx expo start --clear
```

from `apps/mobile`, or stop and re-run `npm run dev:mobile`.

The phone calls Express at port **4000**. Photo **bytes** go to MinIO at port **9000**. Metro will **not** log the MinIO PUT. Use the **browser** Network tab (F12) on Expo web, and filter `9000`.

---

## 9. Automated tests (API)

Postgres must be up and `.env` valid. MinIO must be up for presign tests (they only **sign** URLs; they do not require objects in the bucket).

From the **repo root**:

```bash
npm run test:server
```

Or one file at a time:

```bash
npm run test:users-test
npm run test:ascents-list
npm run test:ascents-get
npm run test:ascents-post
npm run test:ascents-patch
npm run test:ascents-delete
npm run test:uploads-presign
npm run test:uploads-presign-get
```

Lint (whole repo):

```bash
npm run lint
```

There is **no** React Native Testing Library suite for Logbook in this stage. Phone/web checks are manual (§10).

List/get tests assert the **seeded** ascent still exists. They allow `imageKeys` and `notes` to have been edited in Studio. Do not delete the seed user or the Orange Overhang id unless you re-seed.

---

## 10. Manual test plan

Do this after §3–8. Express + MinIO + Expo web (or a simulator) running.

### Health / boot

- [ ] `GET http://localhost:4000/api/health` → `status: ok`.
- [ ] Expo opens Home (not a blank unmatched route).
- [ ] Stop Express, reload Expo → **No connection**. Start Express, reload → app returns.

### Logbook CRUD

- [ ] Logbook shows Orange Overhang (or your existing rows).
- [ ] **+ Log** → fill route, grade, attempts, send/project, notes → Save → list updates (you should land back on Logbook).
- [ ] Open a row → change fields → Save → back; list shows the change.
- [ ] Delete → row gone. `DELETE` is `204` (empty body).

### Photos

- [ ] Edit or create a climb → **Pick photos** (library; web uses the file picker — must be a **button press**).
- [ ] Network: `POST http://localhost:4000/api/uploads/presign` (JSON), then `PUT http://localhost:9000/bouldering/ascents/...` (the file). A `304` on `GET /api/ascents` is **not** the upload.
- [ ] MinIO console → bucket `bouldering` → object appears under `ascents/`.
- [ ] **Save** the form. Prisma Studio: `imageKeys` has that key (and previous keys if you uploaded more).
- [ ] Re-open the climb: images render (signed GET via `POST /api/uploads/presign-get`, then GET to `:9000`).
- [ ] Upload a **second** photo, Save: **both** keys remain (array, not overwrite).

Allowed `contentType` values for presign: `image/jpeg`, `image/png`, `image/webp`, `image/gif` (and `video/mp4` for later).

### Home / Profile

- [ ] Home stats move when you add/send logs.
- [ ] Profile shows Test Climber / `test@bouldering.app`.

Video is **out of scope**. Do not expect a video picker.

---

## 11. Ports cheat sheet

| Port | Process |
|------|---------|
| 4000 | Express |
| 5432 | PostgreSQL |
| 9000 | MinIO S3 API |
| 9001 | MinIO console |
| 8081 (or other) | Expo Metro / web |
| Prisma Studio | usually 5555 |

---

## 12. Troubleshooting

### App says No connection

Express is not on 4000, or the phone cannot reach it. Web: `localhost:4000`. Android emulator: `10.0.2.2:4000` (already in `client.ts`). Physical device: LAN IP. Health aborts after **4 seconds**.

### Unmatched Route / blank web page

You opened a `_layout` file as a URL. Go to `/` or the Web URL Metro printed.

### Photo picker works, key shows, bucket empty

The PUT never hit MinIO. In browser Network, look at **`:9000`**, not only `:4000`. Metro console stays quiet. Confirm MinIO is running and the bucket name is `bouldering`.

### PUT fails in the browser (red OPTIONS/PUT)

CORS/origin issue. Community MinIO should echo `Access-Control-Allow-Origin` for your Expo origin. Confirm you are not using a reverse proxy that strips CORS. Do **not** proxy the file through Express to “fix” it.

### Android photos fail, web works

Signed URL host is `localhost:9000`, which is wrong inside the emulator. Set `S3_PUBLIC_ENDPOINT=http://10.0.2.2:9000`, restart Express, upload again.

### Prisma CLI: `url` is missing in data source `db` (P1012)

The schema is **Prisma 7**: `DATABASE_URL` lives in `prisma.config.ts`, not in `schema.prisma`. You ran a **global** Prisma 5 (`prisma migrate deploy` printed `Prisma CLI Version : 5.17.0`).

From `apps/server` always use the workspace CLI:

```bash
npx prisma migrate deploy
npx prisma generate
```

You should see `Loaded Prisma config from prisma.config.ts` and version **7.9.x**, not 5.17.0.

### MinIO console on :9001 does not load (Windows)

`docker ps` may show MinIO **Up** but ports `9000-9001/tcp` with **no** `0.0.0.0:9000->…`. On Windows, Hyper-V often **reserves** 8985–9084, so Docker cannot bind **9000/9001** (`bind: … forbidden by its access permissions`).

Publish other host ports and point `.env` at them (keep the same named volume so the `bouldering` bucket survives):

```bash
docker rm -f minio
docker run -d --name minio -p 19000:9000 -p 19001:9001 -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin minio/minio server /data --console-address ":9001"
```

Then set `AWS_ENDPOINT=http://localhost:19000` and `S3_PUBLIC_ENDPOINT=http://10.0.2.2:19000`, restart Express. Console: http://localhost:19001 (minioadmin / minioadmin).

### Prisma: `imageKey` column / client mismatch

Run `npx prisma migrate deploy` and `npx prisma generate` in `apps/server`, then restart `dev:server`. The column is **`imageKeys`** (array).

### `npx prisma` cannot see `.env`

Run it from `apps/server`, not from the monorepo root (or pass `--schema` / env yourself).

### Seed user 404 on `GET /api/users/test`

```bash
cd apps/server
npm run db:seed
```

### Port 8081 in use

Expo will offer another port. Use the printed Web URL. Presign/CORS still work; MinIO reflects that origin.

### Windows `&&` in PowerShell

Older PowerShell does not accept `&&`. Use `;` or run commands on separate lines.

---

## 13. Where to change code

| Task | Place |
|------|--------|
| New REST route | `apps/server/src/app.ts` + Zod in `src/validations/` + `tests/*.test.ts` |
| Seed ids | `apps/server/src/config/testSeeds.ts` and `prisma/seed.ts` |
| Schema | `apps/server/prisma/schema.prisma` then a new migration |
| Phone API URL / fetch | `apps/mobile/src/api/client.ts` |
| Create/edit form + photos | `apps/mobile/src/components/AscentForm.tsx` |
| Tabs / stack | `apps/mobile/app/_layout.tsx`, `app/(tabs)/_layout.tsx` |

Official slice notes (if you continue the roadmap): `documents/refine/roadmap/`. Video is `06-video-upload.md`. Do not add JWT until the team schedules auth.
