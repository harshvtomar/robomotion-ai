# RoboMotion AI — Stage 8 Handoff (not started)

## Current baseline

The supplied full `RoboMotion_AI_Stage7_Engineering_Diagnostics.zip` derives from the verified Stage 6 source, with Stage 7 additive engineering diagnostics, session event exports and a camera framing toggle. Do not restart from a new template.

## Required Stage 7 acceptance on the Mac

Run `npm install`, `npm test`, `npm run typecheck`, `npm run build`, then `npm run dev`; record the actual results. Check:

1. WebGL scene, six joint controls, old camera presets, grid/axes/beacon, IK and manual target movement.
2. Sample A pickup/docking with occupancy; sampled collision and E-stop rejection remain intact.
3. Live 21-landmark camera overlay, calibration, live gesture motion, synthetic fixture isolation, loss-of-hand disarming, manual override, fist hold and E-stop recovery.
4. `Focus arm / Wide scene` produces two useful framings and still allows orbit/zoom.
5. Diagnostics counts reflect simulation actions; events appear in the timeline, filter works, clear empties history and CSV/JSON download locally. Verify exported files contain no camera image/landmarks.
6. Guided demo can start/restart/stop and its checkboxes have **no automatic robot effects**.
7. Chrome Console has no unhandled exceptions; responsive/narrow view, keyboard navigation and reduced-motion behavior remain useful.

## Suggested Stage 8 responsibilities

- Final end-to-end acceptance and bug fixes (not a rewrite).
- Browser/WebGL gesture stability and accessibility testing across representative screen sizes.
- Diagnostics and trajectory accuracy review against explicit tolerances and observed failure cases.
- Bundle chunk splitting and initial model-load performance optimization; avoid claiming improvements without measurements.
- Publish to GitHub and deploy public demo only after device/camera permission/security review.
- Portfolio case study, engineering limitations, reproducible acceptance evidence, realistic resume bullet points and a short recorded demo.

## Non-goals

Do not add physical actuators, uncertified hardware safety claims, raw webcam upload, identity recognition, or fabricated performance metrics.

**Stage 8 has not been started.**
