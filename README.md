# RouteLedger — Frontend

RouteLedger is the React + TypeScript frontend built for the Spotter full-stack developer assessment.

The application submits the four required trip inputs to the Django backend and renders the returned route, HOS schedule, operational stops, turn-by-turn directions, and daily ELD log sheets drawn directly over the paper-log image supplied with the assessment.

The supplied blank paper log is embedded as a lightweight local asset and the generated date, miles, duty-status totals, trace, and remarks are overlaid on it. Fields the assessment never supplies (driver identity, carrier, equipment, shipping documents, signature, and detailed prior-day recap data) are deliberately left blank rather than fabricated. Detailed remarks remain available below the paper sheet and in the print/PDF report.

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

## Project structure

```text
src/
├─ api/                     # HTTP client and trip-planning endpoints
├─ components/
│  ├─ eld/                  # Daily ELD sheet, SVG graph, remarks and day navigation
│  ├─ layout/               # Application-level layout components
│  ├─ trip/                 # Trip form, map, timeline, instructions and results
│  └─ ui/                   # Reusable shadcn-style UI primitives
├─ hooks/                   # React Query/domain hooks
├─ lib/                     # Pure formatting, route and ELD helpers
├─ test/                    # Shared test setup and realistic API fixtures
├─ types/
│  ├─ api.ts                # Error/validation response contracts
│  ├─ route.ts              # Routing, coordinates and map-stop contracts
│  ├─ hos.ts                # HOS events, statuses and schedule contracts
│  ├─ eld.ts                # Daily log contracts
│  └─ trip.ts               # Top-level trip request/response composition
├─ App.tsx                  # Page composition only
└─ main.tsx                 # React/bootstrap providers only
```

### Structure conventions

- `api/` owns network transport; components do not call `fetch` directly.
- `types/` mirrors backend domains instead of keeping one monolithic type file.
- `lib/` contains deterministic helpers with no React rendering concerns.
- Trip-specific form validation/error mapping is co-located with the trip form as `trip-planner-form.logic.ts`.
- `components/ui/` contains generic primitives only; business/domain UI lives in `components/trip/` or `components/eld/`.
- Tests are co-located with the code they verify, while shared fixtures live under `test/`.
- The backend remains the source of truth for route/HOS/daily-log calculations.
- The supplied blank ELD paper image is embedded locally as `public/blank-paper-log.svg`; generated values and duty traces are overlaid without inventing unavailable carrier/driver data.

## Main flow

```text
Trip form
  -> POST /api/trips/plan/
  -> route summary
  -> interactive MapLibre route
  -> HOS stop markers
  -> tabbed Schedule / Directions / Daily ELD workspace
  -> multi-day ELD sheets using the supplied blank paper-log image with drawn duty traces
  -> city/state duty-change remarks when reverse geocoding is available
  -> print-ready complete trip report / Save as PDF
```

The frontend does not recalculate HOS legality. The backend-provided schedule and daily logs are treated as authoritative. Location suggestions are optional: if autocomplete returns no matches or fails, the user can continue typing any city, street, or full address and submit the trip normally.

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
