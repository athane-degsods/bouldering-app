# Roadmap

One slice at a time. The index stays here. **How to do each slice** lives in `roadmap/` — one file per step, not per screen.

That is the slow path: open only the current file, install only what that file lists, stop at **Done**. Do not pre-read the next step unless you are stuck.

```mermaid
flowchart LR
  S0["0 Environment"] --> S1["1 Schema + test user"]
  S1 --> S2["2 Navigation"]
  S2 --> S3["3 Ascent API"]
  S3 --> S4["4 Logbook CRUD"]
  S4 --> S5["5 Photo presign"]
  S5 --> S6["6 Video upload"]
```

| Step | File |
|------|------|
| 0 | [roadmap/00-environment.md](roadmap/00-environment.md) |
| 1 | [roadmap/01-schema-test-user.md](roadmap/01-schema-test-user.md) |
| 2 | [roadmap/02-navigation.md](roadmap/02-navigation.md) |
| 3 | [roadmap/03-ascent-api.md](roadmap/03-ascent-api.md) |
| 4 | [roadmap/04-logbook-crud.md](roadmap/04-logbook-crud.md) |
| 5 | [roadmap/05-photo-upload.md](roadmap/05-photo-upload.md) |
| 6 | [roadmap/06-video-upload.md](roadmap/06-video-upload.md) |
| 7 | UI polish (no extra roadmap file) — **do this next** |

Video is in. Do not add JWT.
