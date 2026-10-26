# RoboMotion AI · Engineering Digital Twin

**v0.8.0 — final source release candidate | 8 development stages implemented | simulation only**

RoboMotion AI is a browser-based articulated robotic-arm demonstrator. It combines 3D manual control, forward/inverse kinematics, virtual pick-and-place, opt-in webcam landmarks, bounded gesture-driven motion, and session-local engineering diagnostics. **It is not a physical robot, a safety-certified device, or an error-free commercial product.**

## Run on your Mac

Requirements: macOS, Node 22.12+, an up-to-date Chrome/Safari browser with WebGL, internet for npm and first MediaPipe model/WASM download, optional webcam permission for live controls.

```bash
cd ~/Downloads
unzip RoboMotion_AI_Stage8_Final_Release.zip
cd robomotion-ai-stage8
npm install
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

- The inherited Stage 7 source baseline passed **241/241** automated Node tests in the development environment.
- New Stage 8 tests and release audits are included; results from the actually executed checks are documented in `STAGE_8_COMPLETION_REPORT.md`.
- The previous Stage 7 project passed a Mac TypeScript/production build and displayed a working diagnostics dashboard in user screenshots. That is **not** a Stage 8 Mac build confirmation.
- Stage 8 device-dependent checks — actual webcam tracking, 3D renderer, focus framing, CSV/JSON download behavior, responsiveness, live movement and hosted deployment — remain pending until explicitly tested.

Run `npm run verify` locally after successful dependency installation. `npm run report:bundle` writes `reports/bundle-report.json` only after a successful build, showing actual JS asset bytes. Smaller chunks alone do not prove better runtime speed.

## Privacy, limitations and provenance

The app does not deliberately record or upload webcam frames. MediaPipe model and WASM assets load from third-party servers on first use and may have independent diagnostics; see `docs/PRIVACY_AND_LIMITATIONS.md`. Diagnostic exports contain whitelisted simulator events and timestamps, not images/hand landmarks. IK target error is based on **commanded pose**, not physical measurement. Collision checks are partial; the gripper is a discrete virtual state, not force physics.

The complete Stage 1–7 history is included in the ZIP. The source was extended in Stage 8 rather than rebuilt. No hosted live URL, CI success, real-world hand tracking accuracy or physical hardware demonstration is claimed.

## Portfolio, deployment and release evidence

- `docs/PORTFOLIO_CASE_STUDY.md` — engineering motivation, architecture, evidence and limitations.
- `docs/DEMO_SCRIPT.md` — authentic 60–90-second recruiter demonstration.
- `docs/RESUME_BULLETS.md` — factual bullets, conditionally usable after Mac QA.
- `docs/RELEASE_QA_CHECKLIST.md` — 19 explicit Mac/live browser cases and pass criteria.
- `docs/DEPLOYMENT.md` — GitHub setup and **manual** GitHub Pages workflow.
- `STAGE_8_COMPLETION_REPORT.md`, `PROJECT_STATE.md`, `NEXT_STAGE.md` — source verification and remaining acceptance.

**Designed for learning and demonstration:** Masters' Union Builders Engineering internship is hands-on; combine this simulation with truthful evidence of physical mechanical prototyping if available.
