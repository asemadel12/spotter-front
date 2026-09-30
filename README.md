# Spotter Trip Planner — Frontend

React + TypeScript frontend for the Spotter full-stack developer assessment.

The application submits the four required trip inputs to the Django backend and renders the returned route, HOS schedule, operational stops, turn-by-turn directions, and FMCSA-style daily ELD log sheets.

## Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS + shadcn/ui
- TanStack Query
- React Hook Form + Zod
- MapLibre GL JS + OpenFreeMap
- Turf
- Vitest + Testing Library

Vite 8 requires Node.js 20.19+ or 22.12+. Node 22+ is recommended for this project.

## Local setup

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Default frontend URL: `http://localhost:5173`

Default backend API base: `http://127.0.0.1:8000/api`

## Environment

The frontend uses a single runtime build variable:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

For production, set it to the deployed backend API base, for example:

```text
VITE_API_BASE_URL=https://api.example.com/api
```

The API client removes a trailing slash from the base URL, so either form is safe. Do not put the ORS API key in the frontend; routing credentials remain backend-only.

## Available scripts

```bash
npm run dev
npm run lint
npm run test:run
npm run build
npm run preview
```

## Main flow

```text
Trip form
  -> POST /api/trips/plan/
  -> route summary
  -> interactive MapLibre route
  -> HOS stop markers
  -> chronological timeline
  -> turn-by-turn route instructions
  -> multi-day SVG ELD log sheets
```

The frontend does not recalculate HOS legality. The backend-provided schedule and daily logs are treated as authoritative.

## Production build

```bash
npm ci
npm run build
```

The static production output is written to `dist/`.

During deployment, configure `VITE_API_BASE_URL` before the build runs. No frontend routing rewrite is required because this assessment is a single-page view without client-side route paths.

## Verification

```bash
npm run lint
npm run test:run
npm run build
```
