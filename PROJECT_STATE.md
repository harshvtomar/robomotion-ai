# RoboMotion AI — Verified source state

**Current implementation:** v0.6.0 · Stage 06 of 08 — Gesture-to-Robot Simulation Control.  
**Baseline preserved:** Stage 5 v0.5.0 ZIP, verified on the user's Mac with live MediaPipe tracking, calibrated webcam, synthetic gestures, and a successful Stage 4 virtual docking.

## Stages retained

1. React/Vite/R3F engineering workspace, camera/orbit/grid/axis controls and responsive UI.
2. Articulated robotic arm (six manual channels), bounded slider inputs, presets.
3. Analytic forward/position-only inverse kinematics, reachable-workspace and bounded target motion.
4. Virtual samples and docks with close-to-grasp / dock-to-release and sampled tool/object clearance checks.
5. Opt-in MediaPipe hand-tracking, 21 landmarks, live gesture classifier, neutral-palm calibration and synthetic fixtures.
6. New independent **operator-armed, live-camera-only virtual teleoperation** with normalized calibrated offset mapping, IK, bounded speed, collision screening, Fist HOLD, Pinch virtual close, Peace virtual open, no-hand/stale tracking disarm, manual override, and emergency-stop latch.

## Safety and scope

- All gesture control is **disabled by default** and operates **only the 3D simulation**, never motors or hardware.
- Operator must start live webcam, calibrate an open palm, present a stable open palm/point and **click Arm live gestures**.
- Calibration is anchored to the current TCP on arming, preventing an immediate target jump; translation is clipped per axis and arm motion is rate limited.
- Synthetic fixtures are **never allowed to arm** the robot, even if synthetic calibration exists. Switching to synthetic mode, stopping the camera, losing tracking or stale frames immediately cancels gesture authority.
- Manual sliders/pose presets/IK target requests and manipulation operations disarm teleoperation. Grasp/release remain manual safety-checked operations; gesture Pinch/Peace change finger spacing only, **no automatic pick/drop**.
- Emergency stop cancels active target motion and blocks manual, IK, and object-motion commands until explicit Reset stop; reset leaves gesture control disabled.
- Stage 4 trajectory sampling checks virtual tool against samples. **Not** full-arm dynamics, self collision, industrial e-stop, or certified physical safety.

## Current verification

- Baseline Stage 5 before changes: **158/158 Node tests passed**.
- Stage 6 regression: **203/203 Node tests passed**, zero skipped or failed.
- Strict dependency-free core TypeScript: passed.
- TypeScript/TSX source parsing: 18/18 files passed (no syntax diagnostics).
- Full React type-check, production Vite build, live gesture-actuation / webcam scenario: **must be executed on Mac** with installed npm dependencies; npm registry unavailable in creation container.

## Local commands

```bash
cd ~/Downloads/robomotion-ai-stage6
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

Use the **exact Vite Local URL** displayed (ports 5173–5179 may be occupied). Follow `docs/QA.md` before declaring Mac completion.

## Next

Stage 7 Engineering Dashboard/Diagnostics is **not started**. See `NEXT_STAGE.md`.
