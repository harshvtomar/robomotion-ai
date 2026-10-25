# QA and Verification — Stage 1

**Run date:** 2026-10-26  
**Environment:** container with Node 22, global TypeScript available; registry.npmjs.org DNS unavailable (`EAI_AGAIN`).

## Checks executed

| Check | Result | Evidence |
| --- | --- | --- |
| `npm test` | **PASS: 30 / 30**, zero failed | Node 22.16 native test runner |
| `npm run typecheck:core` | **PASS** | Global TypeScript 5.8.3; pure TS contract only |
| TS/TSX syntax scan | **PASS: 7 / 7** | TypeScript `transpileModule`; does not check dependency types |
| CSS parser | **PASS: 0 syntax errors** | `tinycss2` parser |
| `npm run preflight` | **PASS** | Node 22.16, npm 10.9.2; dependency installation absent |

These checks prove source files, contracts and syntactic validity only. They do **not** prove the React app renders successfully or that third-party types resolve. The full browser gate below is still open.

## Deferred checks (not claimed)

- `npm install` — attempted, but package resolution did not complete in the network-restricted container. `npm view vite version --fetch-retries=0` independently failed with npm `EAI_AGAIN registry.npmjs.org`.
- `npm run typecheck` — requires installed React, Three.js and Vite typings.
- `npm run build` — requires Vite and dependencies.
- Real browser scene initialization — not tested here because the bundle cannot be built without npm dependencies.
- Cross-device / mobile / accessibility testing — pending actual rendered app.
- GitHub Actions — configuration written, not run.

## Mac verification acceptance checklist

- [ ] `npm install` succeeds with no peer conflicts.
- [ ] `npm test` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` emits `dist/index.html`.
- [ ] `npm run dev` opens the app without React/WebGL errors.
- [ ] A real 3D pedestal/beacon is visible and draggable to orbit.
- [ ] Grid, axes, pause/play and camera controls work.
- [ ] Reset restores both camera and switches.
- [ ] Responsive layout works on narrow screens.
- [ ] Documentation accurately calls this foundation, not a built robotic arm.

## Dependency reproducibility

Package versions are enumerated in `package.json`. A lockfile cannot be created offline; after first successful `npm install`, retain `package-lock.json` and switch GitHub CI to `npm ci`.
