# RoboMotion AI · Engineering Digital Twin

**v0.8.0 — final source release candidate | 8 development stages implemented | simulation only**

RoboMotion AI is a browser-based articulated robotic-arm demonstrator. It combines 3D manual control, forward/inverse kinematics, virtual pick-and-place, opt-in webcam landmarks, bounded gesture-driven motion, and session-local engineering diagnostics. **It is not a physical robot, a safety-certified device, or an error-free commercial product.**

## Install and run

Requirements: Node 22.12+, an up-to-date Chrome/Safari browser with WebGL, internet for npm and first MediaPipe model/WASM download, optional webcam permission for live controls.

```bash
git clone https://github.com/harshvtomar/robomotion-ai.git
cd robomotion-ai
npm ci
npm test
npm run typecheck
npm run build
npm run audit:release
npm run report:bundle
npm run dev
```

Open the **exact** `http://127.0.0.1:PORT/` shown in the Vite output. Existing Stage 1–7 servers can occupy earlier ports. Stop the dev server with Ctrl+C.

## Explore the app

| Section | What it demonstrates |
|---|---|
| 3D Workspace | Procedural six-channel robotic arm, orbit/zoom, grid and axis helpers, camera presets, responsive Focus arm / Wide scene views |
| Joint Controls | Bounded base, shoulder, elbow, wrist pitch/roll and gripper sliders; four pose presets |
| Target Kinematics | Calculated FK/IK, reachability rejection, bounded interpolation and target visualization |
| Object Manipulation | Three samples and three elevated station pairs; proximity grasping, dock occupancy and sampled clearance |
| Hand Gesture Lab | Explicit webcam start, 21-point landmarks, classification, calibration, synthetic fixtures for deterministic testing |
| Gesture Robot Control | Opt-in *simulation-only* gesture drive, calibration, hand-loss disarm, manual override, emergency-stop latch |
| Engineering Diagnostics | Live simulated metrics, session event log, safety counters, manual demo checklist, explicit CSV/JSON downloads |

**Synthetic fixtures cannot command the robotic arm.** Actual webcam gesture-to-robot control requires live calibration and deliberate user arming. A reset emergency stop does not automatically rearm control.

## Verification

[![Tests and Build](https://github.com/harshvtomar/robomotion-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/harshvtomar/robomotion-ai/actions/workflows/ci.yml)

Publication validation on 26 October 2026: **261 tests passed, zero failures**, TypeScript, production build and release audit passed using Node 24.22.1. A committed dependency lockfile supports `npm ci`; hosted workflows use Node 22. The project owner confirmed seven final Mac/browser acceptance checks separately. Hosted CI and public-browser evidence are tracked in [the publication report](docs/PUBLICATION_QA.md).

Measured local production JavaScript: **1,395,599 bytes across four chunks**; largest renderer chunk **952,670 bytes (930.3 KiB)**. This is approximately 24% smaller than the approximate Stage 7 screenshot baseline (1,254,140 bytes), not a runtime speed measurement. Vite still warns about a chunk exceeding 500 kB; the warning has not been suppressed. `npm audit` reported zero known vulnerabilities for this lockfile on this date.

Run `npm run verify` for tests, type checking, build, release checks and a fresh bundle report.

## Architecture and robotics

React coordinates pure TypeScript modules for joint state, FK/IK, bounded motion, manipulation, gesture safeguards and diagnostics. React Three Fiber renders the nested articulated meshes using Three.js; the scene and MediaPipe runtime load separately from the main interface. See [architecture](docs/ARCHITECTURE.md).

Five rotational channels (base, shoulder, elbow, wrist pitch and wrist roll) plus a gripper-width channel form six controls. The analytical position IK uses an upright tool constraint; it is not a general six-axis pose solver. Commanded joint angles drive FK in a right-handed, Y-up coordinate frame. Grasping and docking use proximity and occupancy rules, with sampled tool/object clearance checks.

## Privacy, limitations and provenance

The app does not deliberately record or upload webcam frames. MediaPipe model and WASM assets load from third-party servers on first use and may have independent diagnostics; see `docs/PRIVACY_AND_LIMITATIONS.md`. Diagnostic exports contain whitelisted simulator events and timestamps, not images/hand landmarks. IK target error is based on **commanded pose**, not physical measurement. Collision checks are partial; the gripper is a discrete virtual state, not force physics.

The complete Stage 1–7 history is included in the ZIP. The source was extended in Stage 8 rather than rebuilt. Publication evidence is recorded separately; no real-world hand-tracking accuracy or physical hardware demonstration is claimed.

## Portfolio, deployment and release evidence

- `docs/PORTFOLIO_CASE_STUDY.md` — engineering motivation, architecture, evidence and limitations.
- `docs/DEMO_SCRIPT.md` — authentic 60–90-second recruiter demonstration.
- `docs/RESUME_BULLETS.md` — factual bullets, conditionally usable after Mac QA.
- `docs/RELEASE_QA_CHECKLIST.md` — 19 explicit Mac/live browser cases and pass criteria.
- `docs/DEPLOYMENT.md` — GitHub setup and **manual** GitHub Pages workflow.
- `STAGE_8_COMPLETION_REPORT.md`, `PROJECT_STATE.md`, `NEXT_STAGE.md` — source verification and remaining acceptance.

**Designed for learning and demonstration:** Masters' Union Builders Engineering internship is hands-on; combine this simulation with truthful evidence of physical mechanical prototyping if available.
