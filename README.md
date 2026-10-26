# RoboMotion AI — Gesture-Controlled Robotic Arm Digital Twin

**Release:** v0.5.0 · **Stage 5/8: Webcam Hand Gesture Recognition** · October 26, 2026  
**Stack:** React 19, TypeScript, Vite, Three.js, React Three Fiber, MediaPipe Tasks Vision

A browser-based robotic-arm simulation built stage by stage. The work in this release is a **passive hand-tracking laboratory**; hand signals do **not** move the arm. This is an engineering **simulation**, not a physical robotic arm or experimentally certified robot controller.

## Existing functionality preserved

- Stage 1 — Dark engineering dashboard; procedural calibration scene, orbit camera, grid/axes toggles.
- Stage 2 — Six bounded joint controls, four pose presets, manual gripper and smooth visual movements.
- Stage 3 — Forward kinematics, analytic upright-tool position inverse kinematics, reachability checks and time-bounded target motion.
- Stage 4 — Three virtual samples and three docking stations, simulated contact/grasp/release with sampled tool/object clearance checks.
- Stage 5 — **New:** Webcam hand-landmark overlay, heuristic gesture classification, stability voting, calibration and synthetic mode.

## Run on macOS

Requires **Node.js >=22.12** and Internet access for installing npm dependencies. Put the ZIP in Downloads, then:

```bash
cd ~/Downloads
unzip RoboMotion_AI_Stage5_Webcam_Gestures.zip
cd robomotion-ai-stage5
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

Open the exact local URL printed by Vite. Existing servers may occupy ports 5173–5177; do **not** assume a port number. Use Chrome, enable webcam access if requested, and check that the video is not shared with any web page other than this local app.

## Hand Gesture Lab

Scroll to **Hand Gesture Lab** or use the left navigation link.

1. Try the **synthetic test bench** first: Open palm, Fist, Point, Peace, Pinch or No hand. The deterministic fixture displays an illustrative 21-point skeleton and a stable gesture label without requiring a camera.
2. Press **Calibrate** in synthetic mode to sample 12 frames and show normalized palm offset and relative scale.
3. Press **Start webcam** to request permission. Only after this click does the app obtain a camera stream and lazy-load the `@mediapipe/tasks-vision@1.1.1` module/model. A 21-landmark skeleton is shown over the live video.
4. Hold one hand in clear lighting, then try the gestures. The stable label requires at least three agreeing readings in a five-frame window.
5. Press **Stop & release** or switch tabs: the camera tracks should stop. Starting again requires a new click.

**Privacy / connectivity:** The application itself does not upload/store/record webcam video. Hand inference runs locally. The model downloads from Google MediaPipe storage and version-pinned WebAssembly from jsDelivr at runtime, so first live use needs Internet access. The MediaPipe SDK may collect usage metrics/diagnostics. Camera access requires `localhost`/`127.0.0.1` or HTTPS.

**Accuracy:** Gesture labels are derived from hand-landmark geometry, not from an independently trained gesture classification model. The displayed heuristic score is not an actual calibrated confidence/probability. A separate MediaPipe handedness score may appear. Dim lighting, overlapping fingers, obscured hands and nonstandard angles may lower accuracy.

**Boundaries:** Webcam gestures cannot trigger joint motion, IK, grasp or hardware control. Stage 6 will add explicitly gated control with safety measures. The Stage 4 simulated tool/object collision checks do not guarantee rigid-body collision freedom or physical grasp accuracy.

## Development commands

| Command | Purpose |
|---|---|
| `npm test` | 158 Node tests covering Stages 1–5 |
| `npm run typecheck:core` | Standalone Stage 1–4 robotics and Stage 5 gesture geometry TypeScript check |
| `npm run typecheck` | Full React/TypeScript check (after npm install) |
| `npm run build` | Production bundle (after npm install) |
| `npm run dev` | Local app preview |

## Completion evidence

The new source has **158/158 passing Node tests** and the dependency-free core TypeScript check has passed. Full React typecheck/Vite build and actual Mac webcam/MediaPipe inference **were not verified in this build runtime**, because npm dependencies could not be downloaded. Perform the Mac checklist in `docs/QA.md` before marking Stage 5 fully accepted.

Start next session using the current ZIP plus `PROJECT_STATE.md` and `NEXT_STAGE.md`. Preserve prior functionality. **Stage 6 has not been started.**
