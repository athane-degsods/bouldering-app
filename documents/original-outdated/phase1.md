# App Navigation and Layout

## 1. Technical Overview on Expo Router

In Expo Router, app *layouts* and *screens* are organized using file-naming conventions:

- `__layout.tsx` files define the layout for a group of screens (e.g., a tab bar or stack navigator).
- Group folders (e.g., `(tabs)`) are used to organize related screens and layouts.
- Dynamic routes can be created using square brackets (e.g., `[id].tsx` for a dynamic route parameter).

## 2. Target Folder for this phase

```plaintext
apps/mobile/
├── app/
│   ├── _layout.tsx           # Global Root Layout (Theme, TanStack Query, Zustand)
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Configures the Bottom Tab Bar
│   │   ├── index.tsx         # Tab 1: Home / Community Feed Screen
│   │   ├── logbook.tsx       # Tab 2: Ascent History & Log Screen
│   │   └── profile.tsx       # Tab 3: User Profile Screen
│   └── ascent/
│       └── [id].tsx          # Stack Screen: Detailed view of a specific ascent
```

## 3. Phase 1 Goals

Objective: Set up file-based navigation with Expo Router, replacing the single-file App.tsx with a multi-screen tab layout.

### What to do

1. Install Expo Router:

    Add expo-router and @expo/vector-icons dependencies to apps/mobile.

2. Implement File Architecture:

    - Create the app/ directory and configure the root app/_layout.tsx.

    - Create the app/(tabs)/ group directory with a bottom tab layout rendering three screens:

        - Home (index.tsx): Displays mock bouldering routes/feed.

        - Logbook (logbook.tsx): Displays mock ascent logs.

        - Profile (profile.tsx): Reads mock user data from our existing useAuthStore (Zustand).

3. Add Navigation Elements:

    - Add icons to the bottom tab bar.

    - Enable header bars with title text for each tab screen.

### What not to do

  - Do not connect screens to real backend API endpoints (use mock data arrays).

  - Do not build authentication logic or login screens (continue using the mock user in Zustand).

### Acceptance Criteria

  - [ ] App runs without errors on iOS/Android/Web (npm run dev:mobile).

  - [ ] Tapping tab icons smoothly transitions between Home, Logbook, and Profile.

  - [ ] The Profile screen displays the active user name from useAuthStore.

  - [ ] Code adheres to ESLint standards (npm run lint passes without errors).