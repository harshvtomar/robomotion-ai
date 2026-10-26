# RoboMotion AI — Source state

**Current:** v0.5.0 · Stage 05/08 — Webcam hand gestures and synthetic classification.  
**Previous:** Stage 4 v0.4.0 verified by the user on Mac with one successful physical-looking **virtual** docking; full production build completed on Mac.  
**Source:** Retained Stage 4 files and Git history; additive Stage 5 components under `src/vision/`, `src/components/GestureLab.tsx` and tests.

## Implemented by stage

1. Foundation: Vite/React/Three scene, camera controls, responsive dashboard.
2. Articulated arm: six joint channels, limits, manual sliders and presets.
3. Forward/inverse kinematics, target-motion controls, bounded plans and solver checks.
4. Virtual objects: three samples/docks, grasp/release and sampled collision checks.
5. Hand recognition: optional webcam, MediaPipe hand landmarks, gesture classifier, calibration, synthetic demo mode, privacy-safe camera cleanup.

## Verification status

- Prior to modification Stage 4: **139/139 Node tests passed**.
- Stage 5: **158/158 Node tests passed**, core-only TS passed.
- Full React/Vite typecheck and build: **requires Mac npm installation**; no claim of passing in this sandbox.
- Real webcam, MediaPipe model/CDN and classification quality: **requires Mac verification**.
- Stage 6 gesture-to-robot integration: **NOT implemented**.

## Run on the Mac

`npm install && npm test && npm run typecheck && npm run build && npm run dev`

Use the local Vite address shown in Terminal. If 5173–5177 are occupied, the new instance will likely run on a later port; use the actual output rather than assuming.

## Important technical constraints

- MediaPipe version `1.1.1` installed through npm; matching WASM hosted by jsDelivr; hand model hosted by Google's MediaPipe model storage.
- Camera requires explicit interaction and secure localhost/HTTPS; video is processed in browser only. SDK may collect diagnostics.
- Heuristic 2D landmark gesture classifier is **not a trained neural classification head**. Expected false positives in difficult conditions; use synthetic mode for deterministic tests.
- Avoid recreating or replacing previous Stage 4 implementations; use current project archive and `NEXT_STAGE.md`.
