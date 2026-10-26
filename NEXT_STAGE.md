# RoboMotion AI — Stage 7 handoff (not started)

## Baseline

Use the **actual v0.6.0 source ZIP** from Stage 6. Never regenerate the project. Stages 1–5 remain intact and Stage 6 adds live opt-in simulation-only hand control.

**Before Stage 7, verify on the Mac**: `npm test`, `npm run typecheck`, `npm run build`, browser UI; camera open-palm calibration, arm, bounded hand-to-robot movement, Fist hold, Pinch/Peace virtual gripper, synthetic blocked, manual override, stale/no-hand disarm, E-stop latched and reset. Record failing behavior rather than mark untested checks passed.

## Proposed Stage 7 scope

- Add engineering metrics for active pose, calibrated mapping, IK rejection, target-versus-commanded error, motion timing, confidence/stable gesture history and safety interventions.
- User-friendly guided demo, event timeline (session-local by default) and experiment exports that do NOT contain webcam video.
- Clear accessibility/readability improvements, keyboard shortcuts, camera auto-framing and responsive 3D viewport presentation.
- Maintain clear separation between camera observations and explicit gated simulation control.
- Add meaningful diagnostics/QA and comprehensive regression tests.

## Non-goals

No physical hardware/serial/Bluetooth actuation, no facial identity inference, no raw webcam upload, no automatic release of carried samples, and no Stage 8 publishing/comprehensive final release work during Stage 7.
