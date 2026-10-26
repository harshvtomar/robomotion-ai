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

## v0.4.0 — Stage 4: Virtual Object Manipulation (2026-10-26)

- Added three distinct virtual test objects and six elevated reachable virtual stations.
- Added pickup/destination selection and Stage 3 IK target shortcuts, close-to-grasp and dock-to-release controls.
- A held sample follows the visual wrist-roll group, not a detached world-position estimate.
- Added pure state transitions for proximity, gripper closure, dock occupancy and workspace/overlap checks.
- Added time-sampled tool/carried-object clearance checks (other samples only, not full-arm physics).
- Preserved Stage 1–3 UI, pose limits, six sliders, camera controls, analytic IK and trajectory commands.
- Updated prior version-gated source-contract tests and added 25 Stage 4 regression tests, for 139 total passing Node tests.
- Stage 5 webcam recognition intentionally excluded.

## [0.5.0] - 2026-10-26 — Stage 5 gesture observation
- Added MediaPipe HandLandmarker webcam module with explicit opt-in permission, lazy model loading and camera cleanup.
- Added 21-point visual skeleton, heuristic open-palm/fist/point/peace/pinch classification, stable voting and calibration.
- Added deterministic synthetic gesture test bench independent of live camera.
- Preserved all existing Stage 1–4 arm, scene, motion, docking and safety workflows.
- Added Stage 5 tests and Mac handoff. No gesture-to-robot control until Stage 6.

## [0.6.0] — 2026-10-26 — Stage 6 safe gesture-to-robot simulator

- Built a pure TypeScript live-camera-only authority state machine (disabled/armed/E-stop) that rejects uncalibrated, stale, synthetic or missing-hand input.
- Wired Stage 5 tracking into a separately armed Stage 6 control panel without directly dispatching gestures from the video component.
- Added calibration-anchored bounded workspace movement, fine Point control, virtual gripper Pinch/Peace mapping, Fist hold, speed-constrained smooth pose increments, IK checks and Stage 4 trajectory clearance screening.
- Added immediate manual override, explicit disable, tracking timeout/watchdog, and latched simulation E-stop/reset.
- Stage 5 webcam remains opt-in and camera tracks clean up; calibration now accumulates open-palm frames only.
- Preserved all previous features; updated historical source expectation, added 45 Stage 6 safety/regression tests (total 203 passing).
- No physical hardware interfacing; Stage 7 deliberately excluded.

## v0.7.0 — Engineering dashboard and diagnostics

- Added a session-local bounded timeline with whitelisted events, sanitization and exportable CSV/JSON data; no stored webcam frames or raw landmarks.
- Added live commanded pose/target error, motion and safety counts, controller status and five-step guided demo.
- Added reversible Focus arm / Wide scene camera framing and responsive engineering diagnostics panel.
- Preserved all Stage 1–6 functions, prior regression tests and safety controls.
- Added 38 Stage 7 tests; no Stage 8 work started.
