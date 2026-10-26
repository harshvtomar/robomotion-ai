# Next Stage — RoboMotion AI Stage 3 (Not Implemented)

**Handoff from:** Stage 2, v0.2.0, fully packaged.

## Required starting checks

1. Unzip the attached full Stage 2 archive. Inspect actual `src/core/stage1.ts`, `src/core/robot.ts`, `src/components/RobotArm.tsx`, `src/components/StarterScene.tsx`, `src/App.tsx`, existing tests, and documents.
2. Preserve Stage 1 scene tools, Stage 2 manual controls, limits, preset poses, view reset, visual styling and test coverage.
3. Run `npm test`, `npm run typecheck`, `npm run build`; do not claim pass unless the commands pass in your environment.
4. Keep baseline and new test results separate, and preserve an original source backup.

## Stage 3 scope (only if user explicitly starts Stage 3)

- Define deterministic link geometry and parent-local transforms for mathematical **forward kinematics**.
- Implement a bounded, mathematically validated **inverse-kinematics** method for reachable targets. Handle singularities, unreachable targets and safe limits.
- Add goal coordinates / end-effector position readouts; choose clear coordinate conventions matching Stage 2 hierarchy.
- Add motion interpolation/planning for commanded targets without overwriting manual controls or breaking pose presets.
- Create meaningful accuracy, convergence, and unreachable-target tests.
- Add UI for selecting reachable targets and showing informative error states.
- Update documentation and create full updated source ZIP.

**Do not accidentally start Stages 4–8.** No real physical pickup, collider dynamics, MediaPipe, webcam capture, or real motors in Stage 3 unless user changes scope.

## Suggested ChatGPT prompt

> Start RoboMotion AI Stage 3 — Robotics Mathematics & Motion Control. Inspect the attached full Stage 2 ZIP and continue in place. Preserve every Stage 1 and Stage 2 feature. Implement tested forward and inverse kinematics and bounded target control. Do not begin Stage 4. Run tests, package a full ZIP and update README, PROJECT_STATE.md and NEXT_STAGE.md. Distinguish verified functionality from pending Mac browser checks.
