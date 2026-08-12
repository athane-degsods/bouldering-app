# Boulder Log

A mobile diary for indoor climbing — photograph boulder problems, track attempts,
log gear, and update everything as you progress.

## Screens

- **Home** — stats strip (Logged / Send rate / This week), Uploaded Problems
  scroll row, Accessories scroll row, floating "+" to upload a new problem
- **Problem detail** (`/problem/[id]`) — photo, meta data (attempts as chalk
  tally marks, status, date), comment, and accessories used — each section
  updatable independently
- **Upload** (`/problem/upload`) — camera capture, grade picker, attempts,
  comment, accessory multi-select. Same screen handles both add and edit
  (`?id=` query param)
- **Add Gear** (`/gear/add`) — name, category, condition

## Stack

- React Native + Expo, file-based routing via Expo Router (no tabs — Home is
  the root screen)
- `@react-native-async-storage/async-storage` for local persistence
- `expo-image-picker` for camera capture
- `react-native-svg` for the chalk tally-mark attempt counter
- Optional backend sync: set `EXPO_PUBLIC_API_URL` in a `.env` file to point
  at a REST API (Express/MongoDB) — the app works fully offline without it

## Getting started

```bash
npm install
npx expo start --tunnel
```

Scan the QR code with Expo Go. (Web preview works too via `w`, but this
project has mostly been tested on-device — prefer a phone if something
looks off in the browser.)

## Connecting to a backend (optional)

Create a `.env` file at the project root:
```
EXPO_PUBLIC_API_URL=https://your-backend-url
```

Expected endpoints:
```
GET/POST/PATCH/DELETE  /api/problems
GET/POST/PATCH/DELETE  /api/accessories
```
Response shape: `{ success: true, data: [...] }` for GET, `{ success: true, data: {...} }` for POST/PATCH.

Without `.env` set, the app runs entirely on local AsyncStorage data — useful
for development before the backend is ready.

## Data model

**Problem**
```ts
{ _id, name, grade, imageUrl?, attempts, status: 'working' | 'sent', notes?, accessoryIds?, dateAdded }
```

**Accessory**
```ts
{ _id, userId?, name, category: 'shoes' | 'chalk' | 'harness' | 'other', condition: 'good' | 'low' | 'worn_out', dateAdded }
```

## Design system

Grade and gear condition both use the same "route tape" color convention
real climbing gyms use: green (easiest/good) → yellow → orange → red
(hardest/worn out). See `constants/theme.ts` for the color tokens and
`gradeColor()` / `conditionColor()` helpers.
