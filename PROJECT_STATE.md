# RoboMotion AI — Project State

**Baseline:** `v0.1.0` — Stage 1 source delivered 2026-10-26.  
**Current stage:** 1 of 8 — Foundation & Engineering Workspace.  
**Next stage:** 2 — 3D Robotic Arm.  
**Local Git remote:** none (do not claim published or deployed).  
**Project data/credentials:** none required.

## Implemented in Stage 1

- Vite/React/TypeScript architecture with React Three Fiber 9 / Three.js
- Responsive app shell and isolated real-time starter scene
- Right-handed coordinate reference, calibration base, grid and axis markers
- Isometric/front/top camera views, reset, grid/axes toggles, beacon pause
- Basic accessibility (semantic navigation, controls, focus style, error fallback)
- Pure state/action data model and unit tests
- Documentation, initial CI definition, packaging and next-stage contract

## Deliberately not implemented

Robotic arm geometry, actual servo or joint state, IK/FK, gripper, virtual object pickup, gesture recognition, camera permission handling, collision physics, data logging, authentication or public deployment. Do not report any of these as complete.

## Verification

See `docs/QA.md` for actual test results and precise blocked checks. Source test success does not constitute running a browser-based app.

## Immutable carry-forward requirements

1. Do **not** recreate this repository from scratch for Stage 2.
2. Preserve the working Stage 1 calibration scene and controls.
3. Add the robot through a clearly separated component and joint-state model.
4. Preserve `src/core/stage1.ts` APIs or migrate them with backward-compatible tests.
5. Do not use a static robot picture as a substitute for animated articulated geometry.
6. Do not claim physical hardware has been constructed.
7. Keep project source and all test reports in each next-stage ZIP.

## Mac verification update — 2026-10-26

User supplied a Chrome screenshot showing the Stage 1 live preview rendering. The first full Mac typecheck/build failed on unused `CAMERA_PRESETS` import in `src/App.tsx`. This package includes the one-line fix. Post-fix source tests and core TypeScript check passed in the authoring environment. Complete Mac `typecheck` and `build` verification are still pending.
