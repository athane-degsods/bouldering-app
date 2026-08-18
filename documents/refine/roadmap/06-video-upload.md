# Step 6 — Video upload (not recording)

## Learn

Same as photos: presign → PUT to S3 → save `videoKey`. Larger files; keep the PUT on S3.

## Install

**Mobile:** `expo-image-picker` already can pick videos, or add a document picker if you prefer. Add a video player only when you need playback (`expo-video` or the Expo 57 equivalent — check docs then).

## Do

- Reuse `POST /api/uploads/presign` with a video `contentType`.
- PATCH `videoKey`.
- Play on the detail screen.
- Raise presign expiry a bit if large files fail.

## Do not

- In-app recording.
- Transcoding or a CDN.
- A second upload API.

## Done

A short clip uploads and plays after restart.
