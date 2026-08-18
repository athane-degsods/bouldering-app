# Requirements

Solo build. This file is the product freeze. If it is not listed under MVP, do not build it yet.

## Product

Boulder Logs is a phone diary for indoor bouldering. The climber logs problems, adds a photo, tracks attempts, and writes notes.

## MVP (must ship)

- Three screens with navigation: Home, Logbook, Profile (names can match Expo Router tabs).
- CRUD on **ascents** for one seeded test user (`test@bouldering.app`).
- Fetch talks to the Express API. Lists and forms show real Postgres data.
- Create/edit fields: route name, grade, attempts, completed, notes, optional photo.
- Home can derive simple stats from the ascent list (count, send rate, this week). No extra stats API.
- If the API is unreachable, show a **no connection** screen. Do not persist an offline cache in this stage.
- UI good enough for a demo video.

## Explicit non-goals (later)

- Real login, passwords, or multiple accounts in the UI.
- Video upload (next media step after photos work).
- Goals, social feed, friends, groups.
- MongoDB, SWR, Sentry, Reactotron.
- AsyncStorage / offline cache of the user or lists.
- Recording video on device (upload of an existing file only, when video is built).

## Constraints

- PostgreSQL + Prisma is the database. S3 stores media bytes; Postgres stores `imageKey` / `videoKey`.
- Zustand holds the test user in memory for the session. TanStack Query holds server lists.
- Current repo layout: `documents/original/boilerplate.md`. Target layout: `ARCHITECTURE.md` section 2. Build order: `ROADMAP.md` (index) and `roadmap/` (one file per step).
