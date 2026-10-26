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

## v0.2.0 — Stage 2: Articulated Robotic Arm (2026-10-26)

- Added 3D procedural articulated base, shoulder, elbow, wrist pitch, wrist roll and two-finger gripper.
- Added manual joint console (six bounded sliders, +/- buttons, four preset poses, independent reset pose).
- Implemented immutable robot state model, finite-value validation and time-based smoothing.
- Kept Stage 1 camera/grid/axes/beacon and starter scene foundation.
- Extended automated unit/property tests and created Stage 3 continuation contract.
- Full React build/live GPU interaction testing needs npm dependencies on Mac.

## v0.3.0 — Stage 3: Kinematics & Motion Control

- Preserved Stage 1–2 application, scene settings, articulated arm and all manual controls.
- Added exact-hierarchy forward kinematics, analytic upright-tool position IK, error classification and strict joint-limit/FK residual acceptance.
- Added input form for X/Y/Z target, target marker, commanded TCP readout, reachability feedback and target presets.
- Added finite-duration coordinated motion plans, cancel/stop and manual override.
- Added 40 new unit/invariant tests; combined 114/114 passed; updated historical Stage 2 content assertions for current capabilities.
- Updated architecture, QA, README, handoff and stage state; deferred Stage 4 objects/collision/grasp logic.
