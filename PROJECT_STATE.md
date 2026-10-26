# Project State — RoboMotion AI

- **Version:** 0.3.0
- **Development checkpoint:** Stage 3 of 8 — Kinematics and Motion Control
- **Starting source:** Existing full Stage 2 project (`RoboMotion_AI_Stage2_Articulated_Arm.zip`), base Git commit `1b183bf`, 74 original tests passing before Stage 3.
- **Implementation:** Preserves current full React/Three/R3F UI, scene tools and all 6 manual joints, preset controls and home/reset. Adds forward kinematics, analytic target IK, reach error feedback, target gizmo, coordinated controlled joint motion, cancellation.
- **Stage 3 tests:** 114/114 Node tests passed (74 modified historical baselines/regressions + 40 new tests). `tsc -p tsconfig.core.json` passed; syntax transpilation reported zero errors on updated TS/TSX files.
- **Unverified here:** full npm dependency installation, React/Three type checking, production Vite build, actual browser/WebGL animation, mobile accessibility and macOS browser QA (registry unavailable in this environment). Prior Stage 2 Mac build cannot substitute for Stage 3 verification.

## Design decisions

- Exact Stage 2 local parent axes and origins modeled; shoulder Y=1.12, L1=1.16, L2=0.96, upright TCP wrist extension=0.72.
- `forwardKinematics` mathematically computes the commanded tool point from 4 rotational joints; wrist-roll and gripper opening have no effect on a point on tool's axis.
- `inverseKinematics` is position-only with fixed upright tool orientation (world pitch 0). It explores elbow-up/down and two yaw directions, verifies strict actuator ranges and FK residual, and selects the nearest feasible configuration to current commanded pose. Failure is explicit, no invalid pose is dispatched.
- `planMotion`/`sampleMotion` create an eased synchronized bounded pose interpolation with per-joint speed ceilings. A user Stop, manual control, preset or target edit cancels remaining queued animation frames.
- The R3F visual arm uses the pre-existing exponentially filtered joint display; UI FK reports commanded states and may lead visual mesh briefly. No physical feedback/actuation exists.

## Out of scope

- Stage 4: physical interactions, pick/release mechanics, collision detection/physics and placement objects **not started**.
- Stage 5: webcam, hand recognition **not started**.
- Stage 6: gesture mapping **not started**.
- Stage 7: advanced diagnostics **not started**.
- Stage 8: full final integration/portfolio QA **not started**.
- Remote GitHub push/public hosting not done in this conversation.

## Mac acceptance

1. Extract ZIP into separate `~/Downloads/robomotion-ai-stage3` directory.
2. Run `npm install && npm test && npm run typecheck && npm run build` with full internet/dependencies.
3. `npm run dev`; open actual Vite URL. Check full 3D viewport, manual sliders, presets, reset view/pose, grid/axes/beacon, browser console.
4. Click Home TCP, verify green target marker, `REACHABLE`, hit **Move to target**. Choose Demo point and verify joint values smoothly change and point error ends within ~0.015 m (allowing rendering interpolation to settle).
5. Enter impossible coordinates e.g X=9,Y=2,Z=0; verify denied and no unexpected robot move. Change targets during motion and hit Stop; verify cancellation. Check narrow viewport and no console exceptions.
6. Save terminal results/screenshots for final review before beginning Stage 4.

## Continue

Attach this Stage 3 full ZIP in the next conversation; read `NEXT_STAGE.md`. Never start again from Stage 1. Do not claim Mac acceptance until it runs.
