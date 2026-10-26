# Stage 6 handoff — Gesture-to-Robot Control (not started)

## Proven baseline

- Last completed source: **RoboMotion AI v0.5.0**.
- Stage 1 foundation, Stage 2 articulated robotic arm, Stage 3 FK/IK target motion, Stage 4 discrete object manipulation, Stage 5 hand observation and synthetic gesture testing.
- Stage 5 Node test suite: **158/158 passed** in the build environment, plus core TS pass.
- User must still run npm install, full React typecheck, production build and live webcam acceptance on Mac before approving Stage 6.

## Stage 6 goals (future work only)

- Calibrate camera-to-workspace mapping with explicit user agreement, conservative scaling, safety clamping and dead zones.
- Introduce a **gated** gesture-to-robot controller (default OFF, explicit ARM control enable, prominent emergency STOP).
- Smooth jittery commands, handle lost tracking, out-of-bounds inputs and repeated recognition; no motion if confidence/stability insufficient.
- Map recognized gestures to safe digital-arm actions using existing Stage 3 bounded FK/IK and Stage 4 discrete grasp rules, never bypassing collision restrictions.
- Make simulation-only limitations transparent; do not claim physical robot actuation.
- Integrate synthetic e2e tests for every gesture and fail-safe state, plus Mac webcam testing.

## Strict boundaries

Preserve Stage 5 observation mode as a standalone fallback. Maintain camera permission/cleanup guarantees and video privacy. Never attach raw `latest` gesture states directly to robot dispatches. Introduce a separate explicit interlock and verify transitions. Keep source and ZIP handoffs across stages.
