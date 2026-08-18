# Bouldering app monorepo - Architecture document
*Updated on 8-6-2026*

## 1. System overview

This repo is structured as a monorepo using npm workspaces. It separate the frontend mobile and the backend API service while sharing dependencies, linter configurations, and scripts from a single root environment.

```mermaid
flowchart TD
A["React Native (Expo)"] 
-->|TanStack Query / Fetch| B["Express API Server (TypeScript)"] 
-->|Prisma ORM| C["PostgreSQL Database"]
```

## 2. Technology stack summary

| Layer | Tool / Tech |	Purpose in Architecture 
|-------|-------------|------------------------- 
| Workspace | npm Workspaces | Monorepo package management
| Linting | ESLint (Flat Config v9+) | Code quality standard enforced across workspaces
| Backend Runtime | Node.js + Express + TypeScript | REST API layer executed with tsx watch
| Database & ORM | PostgreSQL + Prisma ORM | Relational schema definitions and type-safe query execution
| Backend Testing | Vitest + Supertest | Automated endpoint and unit testing
| Mobile Runtime | React Native (Expo) | Cross-platform mobile (iOS/Android/Web)
| Server State | TanStack Query | Caching, fetching, and syncing database records in mobile
| Client State | Zustand | Lightweight client-only global state (e.g., user session, UI state)


## 3. Current monorepo structure

```plaintext
bouldering-app/
├── package.json              # Monorepo root scripts and workspace links
├── eslint.config.mjs         # Monorepo-wide ESLint Flat Configuration
├── apps/
│   ├── server/               # Express Backend Workspace (@bouldering/server)
│   │   ├── prisma/           # schema.prisma & PostgreSQL migrations
│   │   ├── src/
│   │   │   ├── app.ts        # Express app configuration (testable)
│   │   │   ├── index.ts      # HTTP server entry point
│   │   │   └── lib/prisma.ts # Prisma Client Singleton instance
│   │   └── tests/            # Vitest suite (api.test.ts)
│   │
│   └── mobile/               # React Native Expo Workspace (@bouldering/mobile)
│       ├── App.tsx           # Mobile root entry point
│       ├── metro.config.js   # Metro bundler config for monorepo paths
│       └── src/
│           ├── api/client.ts # TanStack Query client & base URL configuration
│           └── store/        # Zustand global state stores (useAuthStore.ts)
```

## 4. Operational Scripts

1. Start Backend API: npm run dev:server (Runs Express at http://localhost:4000)
2. Start Mobile App: npm run dev:mobile (Opens Expo Metro bundler at http://localhost:8081)
3. Run Server Tests: npm run test:server (Runs Vitest suite for backend)
4. Run Linter: npm run lint (Runs ESLint across all workspaces)

## 5. Development Notes

1. PostgreSQL database can be run locally using Docker. You can implement these commands to set up a local database instance that match the Prisma schema configuration.:
```bash
docker run --name postgres-dev \
  -e POSTGRES_USER=username \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=mydb \
  -p 5432:5432 \
  -d postgres
```

After that, update the .env file in /apps/server with the new database connection string:

```
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"
```

2. Do `npm install` at the monorepo root to install dependencies and link workspaces.

## 6. Roadmap 

```mermaid
flowchart LR
A["Phase 1: Navigation Setup"] --> B["Phase 2: Core Feature UX (Mocked User)"] --> C["Phase 3: Real Auth Integration"]
```

1. Phase 1: App Navigation & Layout (Option 1B)

    - Set up Expo Router or React Navigation (Tab Bar: Feed, Log Ascent, Profile).

    - Get screen transitions feeling smooth across iOS/Android/Web.

2. Phase 2: Core Domain Features (Option 1A)

    - Build the Upload/Log Ascent Screen (inputs for grade, route name, notes).

    - Connect forms to TanStack Query mutations that send POST requests to your Express backend using the mock user ID stored in Zustand.

3. Phase 3: Authentication Integration (Option 2)

    - Swap out the Zustand mock user state for real API login/registration flows once backend auth endpoints are ready.