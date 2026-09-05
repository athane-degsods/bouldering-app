# Home Screen — Data & API Guide

This document describes how each section on the Home screen fetches data, what requests are sent, what responses come back, and how the data is handled on the frontend. Use this to stay in sync with the team before building.

---

## Section 1: Statistic view

All 3 numbers (**Logged**, **Send rate**, **This week**) are calculated on the frontend from the same Problems dataset, so only **one request** is needed to fetch the full list.

The backend just needs to return raw data — it doesn't need to pre-calculate these numbers itself. The frontend derives all 3 stats from the same response.

**Request:**

```
GET /api/problems
```

**Sample response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7",
      "name": "Orange Overhang",
      "grade": "V5",
      "imageUrl": "https://bucket.s3.amazonaws.com/....jpg",
      "attempts": 4,
      "completed": true,
      "dateAdded": "2026-07-24T10:00:00.000Z",
      "notes": "..."
    },
    {
      "_id": "64f1a2b3c4d5e6f8",
      "name": "Slab Traverse",
      "grade": "V1",
      "attempts": 2,
      "completed": true,
      "dateAdded": "2026-07-28T09:00:00.000Z"
    }
  ]
}
```

### Total problems logged

Count the number of items in the returned array.

```js
const total = response.data.length;
```

### Complete / send rate

Filter for problems where `completed: true`, divide by the total, and round to a percentage.

```js
const completedCount = response.data.filter((p) => p.completed === true).length;
const sendRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;
```

### This week count

Filter for problems where `dateAdded` falls within the last 7 days from now.

```js
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

const thisWeekCount = response.data.filter(
  (p) => new Date(p.dateAdded) >= oneWeekAgo,
).length;
```

> ⚠️ **Needs team agreement:** does "week" here mean a **rolling 7-day window**, or a **calendar week** (from Monday to now)? The logic above uses a rolling 7-day window — simpler to code — but if the team wants a calendar week instead, the logic needs to change (calculate from the most recent Monday).

---

## Section 2: Uploaded problem

Links to the **Upload Problem** page.

---

## Section 3: Accessories

Unlike Section 1, Accessories is separate data (its own MongoDB collection), and needs its **own requests** with full **CRUD** support.

### Fetching the gear list

**Request:**

```
GET /api/accessories
```

**Sample response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f2b1a3c4d5e6f9",
      "userId": "guest",
      "name": "La Sportiva Skwama",
      "category": "shoes",
      "condition": "good",
      "dateAdded": "2026-07-10T08:00:00.000Z"
    },
    {
      "_id": "64f2b1a3c4d5e6fa",
      "userId": "guest",
      "name": "Chalk block",
      "category": "chalk",
      "condition": "low",
      "dateAdded": "2026-07-15T08:00:00.000Z"
    }
  ]
}
```

**Frontend:**

```js
const accessories = response.data;

// Render each item as a gear-card, map condition → tape color
const conditionColor = {
  good: "#6FCB53",
  low: "#F4C430",
  worn_out: "#E63946",
};
```

Each item in the array maps directly to a `gear-card` in the horizontal scroll row on Home — no extra calculation needed, just map the `condition` field to its matching tape color for display.

### Adding new gear (when tapping "+ Add gear")

**Request:**

```
POST /api/accessories
Content-Type: application/json

{
  "name": "Crash pad",
  "category": "other",
  "condition": "good"
}
```

(`userId` and `dateAdded` are assigned by the backend — `userId` uses the placeholder `"guest"` as agreed.)

**Response:** returns the newly created object (including `_id`), so the frontend can add it straight into the existing list without needing to call `GET` again.

### Updating gear condition (when condition changes)

**Request:**

```
PATCH /api/accessories/:id
Content-Type: application/json

{
  "condition": "worn_out"
}
```

**Frontend handling:** update local state immediately (local-first, same pattern as Problems) before the request completes, so the UI responds instantly.

### Deleting retired gear

**Request:**

```
DELETE /api/accessories/:id
```

---

## Section 4: Add button

Entry point to the **Upload Problem** page.

---
