# Miami Tech Ecosystem — Digital Twin

An interactive 3D "mission control" visualization of Miami's tech
ecosystem, built with React Three Fiber. It maps universities, employers,
startup hubs, AI companies, data centers, and tech events across the
region, and layers on simulated talent flow, internship pipelines, and
patrol drones.

## Stack

- [Vite](https://vitejs.dev/) + React
- [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) / [drei](https://github.com/pmndrs/drei) / [postprocessing](https://github.com/pmndrs/react-postprocessing)
- [zustand](https://github.com/pmndrs/zustand) for shared simulation state

## Getting started

```bash
npm install
npm run dev
```

Running `npm run dev` (plain Vite) will 404 on `/api/*` — those are Vercel
serverless functions. Use `vercel dev` instead to run the frontend and the
API routes together locally (requires the Vercel CLI: `npm i -g vercel`).

## Project structure

```
api/            Vercel serverless functions (live public data)
src/
  components/   3D scene layers + HUD overlay panels
  hooks/        useTechData (store), useCamera, useAnimation
  services/     client-side fetchers for /api/*
  utils/        math/curve helpers, color palette, animation easing
  data/         static seed datasets (universities, employers, etc.)
  styles/       shared HUD CSS
```

Every dataset in `src/data` is designed to be swapped for a live API feed
without touching any rendering component — components read exclusively
from the `useTechData` store.

## Live public data

On mount, `App` calls `useTechData().loadLiveData()`, which overlays two
free, public sources on top of the static seed data. Both are
timeout-guarded and fail closed to the seed data, so a slow/down upstream
never breaks the map.

### `/api/jobs` — real job openings (no API key)

Aggregates live openings from the Greenhouse, Lever, and Ashby
applicant-tracking-system APIs — these are public endpoints that power
each company's own careers page, so no key is required. Tracked companies
are configured in `api/jobs.js`'s `TRACKED_EMPLOYERS` list; each entry's
`id` must match an id in `src/data/employers.js` or `src/data/startups.js`
so the live count attaches to the right map node (unmatched ids are
ignored, so it's safe to add entries speculatively).

To track another employer: find their careers page, confirm which ATS
serves it (the URL pattern gives it away — `boards.greenhouse.io/{token}`,
`jobs.lever.co/{token}`, or `jobs.ashbyhq.com/{token}`), then add
`{ id, source, token }` to the list.

### `/api/bls` — Miami-metro employment trend

Fetches year-over-year employment change for the Miami-Fort
Lauderdale-West Palm Beach metro area (BLS area code `33100`) — total
nonfarm, information sector, and professional/business services — from
the [BLS Public Data API](https://www.bls.gov/developers/).

Requires a free `BLS_API_KEY`, set as a **server-side** environment
variable (never `VITE_`-prefixed, or it would leak into the client
bundle). See `.env.example`. In Vercel: Project Settings → Environment
Variables → `BLS_API_KEY`.
