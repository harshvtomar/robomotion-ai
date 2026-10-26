# Changelog

## Stage 1 typecheck correction — 2026-10-26

- Removed unused `CAMERA_PRESETS` import from `src/App.tsx` to address Mac `TS6133` during `npm run build`.
- Preserved all Stage 1 3D features and all existing tests.
- Re-ran 30 Node tests and the core TypeScript check successfully.
- Full browser/project build must still be rerun on the user's Mac.

## v0.1.0 — 2026-10-26 — Stage 1 source baseline

- Added React/TypeScript/Vite source foundation.
- Added React Three Fiber origin calibration scene with OrbitControls, lighting, grid and axes.
- Added responsive engineering dashboard, preset camera control, reset and pause.
- Added pure domain reducer tests, source checks, fallback handling, and CI workflow.
- Added Stage 2 continuation contract and verification honesty report.

**Not yet completed:** dependency installation, production compilation, live browser QA, GitHub publishing, robotic arm model.
