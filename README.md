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

## Project structure

```
src/
  components/   3D scene layers + HUD overlay panels
  hooks/        useTechData (store), useCamera, useAnimation
  utils/        math/curve helpers, color palette, animation easing
  data/         static seed datasets (universities, employers, etc.)
  styles/       shared HUD CSS
```

Every dataset in `src/data` is designed to be swapped for a live API feed
(LinkedIn Jobs, Crunchbase, Eventbrite, the MDC internship database, etc.)
without touching any rendering component — components read exclusively
from the `useTechData` store.
