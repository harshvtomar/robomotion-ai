# Next Chat: RoboMotion AI — Stage 2

## Input required

Attach the **entire Stage 1 ZIP** and request Stage 2 implementation. Extract and inspect the real source first. Do not replace the codebase or skip testing.

## Stage 2 objective

Create an articulated 3D robotic arm on the calibration base while keeping the existing app and interactive scene functional.

## Expected Stage 2 scope

1. Introduce a named joint topology (base, shoulder, elbow, wrist, gripper) with explicit parent/child kinematic hierarchy.
2. Implement procedural, recognizable mechanical geometry with sensible proportions and visible joint pivots.
3. Create typed joint state, angle limits and a resettable manual slider panel.
4. Update 3D pivots from actual joint state, not CSS-only illusions.
5. Add camera presets and ensure Stage 1 grid/axes/beacon controls remain functional.
6. Add geometry/limits/unit tests and available runtime/build checks.
7. Update `README.md`, `PROJECT_STATE.md`, `docs/QA.md`, and `NEXT_STAGE.md`.
8. Package the complete repository ZIP with measurable verification evidence.

## Scope exclusions

Do **not** implement inverse kinematics (Stage 3), pick-and-place physics (Stage 4), camera-based gestures (Stage 5), gesture-to-robot integration (Stage 6), or engineering analytics (Stage 7).

## Stage 1 verification gate (required before Stage 2 claims)

After downloading the ZIP on a network-connected Mac, run:

```bash
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

Open the Vite local URL and verify orbit/zoom, camera switch, grid, axes, pause, reset, mobile width, and WebGL fallback. Record bugs and fix Stage 1 regression issues before reporting Stage 2 complete.

## Suggested starting instruction

> Continue RoboMotion AI from the attached Stage 1 ZIP. Inspect existing code; preserve its interactive calibration scene. Implement ONLY Stage 2: an articulated, accurately jointed procedural 3D arm with manual controls and per-joint limits; tests and full ZIP handoff. Run npm install, typecheck, build, tests, and verify in a real browser whenever the environment allows. Do not claim any unverified work as complete.
