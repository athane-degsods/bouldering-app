# Requirements

Solo build. This file is the product freeze. If it is not listed under MVP, do not build it yet.

## Product

Boulder Logs is a phone diary for indoor bouldering. The climber logs problems, adds a photo, can attach a short **beta clip**, tracks attempts, and writes notes. Video supports learning: watch a sequence again after the session, not only remember it as a still.

## Remaining build order

Photos and CRUD and **video** are in. Remaining:

1. **UI polish** — make the screens demo-ready.

## MVP (must ship)

- Three screens with navigation: Home, Logbook, Profile (names can match Expo Router tabs).
- CRUD on **ascents** for one seeded test user (`test@bouldering.app`).
- Fetch talks to the Express API. Lists and forms show real Postgres data.
- Create/edit fields: route name, grade, attempts, completed, notes, optional photo, optional **video** (library pick, not recording).
- Home can derive simple stats from the ascent list (count, send rate, this week). No extra stats API.
- If the API is unreachable, show a **no connection** screen. Do not persist an offline cache in this stage.
- UI good enough for a demo recording (do this **after** video, not instead of it).

## Explicit non-goals (this project)

- JWT, real login, passwords, or multiple accounts. Stay on the seeded test user.
- In-app camera recording (upload a file that already exists).
- Goals, social feed, friends, groups.
- MongoDB, SWR, Sentry, Reactotron.
- AsyncStorage / offline cache of the user or lists.

## Constraints

- PostgreSQL + Prisma is the database. S3 stores media bytes; Postgres stores `imageKey` / `videoKey`.
- Zustand holds the test user in memory for the session. TanStack Query holds server lists.
- Current repo layout: `documents/original/boilerplate.md`. Target layout: `ARCHITECTURE.md` section 2. Build order: `ROADMAP.md` (index) and `roadmap/` (one file per step).
