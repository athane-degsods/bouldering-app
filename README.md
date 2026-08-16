# Boulderering App

## Overview

This repository contains the Boulder Log React Native app under `apps/mobile`.
The app is built with Expo and uses local AsyncStorage for persistence.

## Run the app locally

### 1. Install dependencies

```bash
npm install
```

### 2. Start Expo

```bash
npm run dev:mobile
```

This runs the Expo app from the monorepo mobile workspace.

### 3. Open the app

- Scan the QR code with Expo Go on your phone
- Or press `w` in the Expo terminal to open the web app
- Or press `a` to open Android if an emulator is available

### 4. Browser web support

If you open the browser and see raw JSON instead of the app UI, make sure you are using the Expo web preview (`w`) and not the raw Metro bundle URL.

The local web URL should look like:

```text
http://localhost:8083
```

## Optional backend configuration

If your teammate wants to connect the app to a backend, create a `.env` file in the monorepo root or in `apps/mobile/` depending on your setup, for example:

```env
EXPO_PUBLIC_API_URL=https://your-backend-url
```

The app will fall back to local storage if this is not set.

## Notes

- The mobile frontend now lives at `apps/mobile`
- The app currently uses Expo SDK 51
- `apps/mobile/app/index.tsx` is the main home screen entry point
