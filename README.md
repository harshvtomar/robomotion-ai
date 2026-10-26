# RoboMotion AI — Stage 7 · Engineering Dashboard & Diagnostics

**Version:** 0.7.0 | **Stages implemented:** 1–7 of 8 | **Type:** simulated robotics demonstrator (no physical hardware)

A browser-based digital twin of a six-channel robotic arm. It combines manual joint control, forward and inverse kinematics, simulated pick-and-place of three samples, MediaPipe live webcam recognition, explicit simulation-only gesture teleoperation, and an in-memory engineering dashboard.

## Launch on macOS

Requirements: Node.js 22.12+, Chrome with WebGL enabled, macOS webcam access for optional live recognition, internet access on first installation for npm and the MediaPipe model.

```bash
cd ~/Downloads
unzip RoboMotion_AI_Stage7_Engineering_Diagnostics.zip
cd robomotion-ai-stage7
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

Open the **exact** address printed by Vite. If several older Stage servers are running it may not be port 5173.

## Main sections

1. **3D Workspace:** articulated arm, grid/axes, camera presets, reversible `Focus arm / Wide scene` framing, reset, orbit and zoom.
2. **Joint Controls:** six bounded sliders, home/upright/inspect/folded presets, manual override.
3. **Target Kinematics:** position-only FK/IK, reachability constraints, planned motion and stop.
4. **Object Manipulation:** three virtual samples, elevated pickup and docking stations, grasp/release and approximate sampled clearance checking.
5. **Hand Gesture Lab:** opt-in webcam, 21 MediaPipe landmarks, five gestures, calibration and deterministic synthetic test bench.
6. **Gesture Robot Control:** explicitly armed live-camera motion only, automatic disarm on tracking failure, manual override and latched E-stop. Synthetic fixtures cannot drive the robot.
7. **Engineering Diagnostics:** commanded TCP coordinates, target error, motion and safety counts, live gesture status, docking state, action history, privacy-safe CSV/JSON export, clear, and a manually checked five-step demo.

## Stage 7 diagnostics details

- **No camera frames, images, raw landmarks, personal identifying data or saved recordings** enter the engineering event log. It receives only whitelisted event codes, curated short descriptions and optional movement durations.
- History is **session-only** and capped at 240 events. Reloading the page clears it. Pressing **Clear events** clears it immediately. Downloads require a user click and stay on the local machine unless the user shares them.
- Displayed confidence is the current gesture-geometry score, **not a measured classifier accuracy**. FK and target error are commanded digital-twin values, not physical encoder measurements.
- Events count controller and simulation actions only; they do not claim to measure actual actuator torque, sensor accuracy or production reliability.
- The five-step guide is a checklist. It **never starts the webcam or moves/arms the robot automatically**.

## Tests

```bash
npm test
npm run typecheck:core
npm run typecheck
npm run build
```

The existing 203 Stage 1–6 tests remain; 38 new Stage 7 tests are included. The `npm test` command uses Node 22 TypeScript stripping. Full React/Vite build and interactive browser verification **must be run on your Mac** if dependencies cannot be installed in another environment.

## Limits and honesty

- This is a digital simulation. No serial/Bluetooth/hardware connectivity or physical emergency-stop certification exists.
- IK keeps the gripper upright and controls position, not arbitrary six-axis tool orientation.
- Sample handling is discrete, with approximate collision checks; not full multibody dynamics, grip force, robot self-collision or gravity-based release.
- Gesture telemetry does not establish gesture-accuracy statistics. The video remains local to Chrome; initial MediaPipe models/wasm are fetched externally as described in the Hand Gesture Lab.
- Stage 8 comprehensive release QA, public deployment, performance budgets and portfolio materials are **not started**.

## Handoff

See `PROJECT_STATE.md`, `STAGE_7_COMPLETION_REPORT.md`, `docs/QA.md` and `NEXT_STAGE.md`. Each subsequent stage must inspect this actual source before changing anything; **never recreate completed stages**.
