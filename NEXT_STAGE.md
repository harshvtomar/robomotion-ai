# Next Stage — Stage 4: Virtual Object Manipulation (NOT STARTED)

**Source handoff:** RoboMotion AI v0.3.0, complete Stage 3 project. Stage 1 foundation and Stage 2 manual articulations preserved.

## Required preflight

- Confirm Stage 3 package is successfully extracted, and `npm test`, `npm run typecheck`, `npm run build` pass **on Mac** with installed npm packages.
- Validate in Chrome the Stage 2 manual joints/presets and Stage 3 FK/IK console, target marker, reachability rejection, movement and Stop; preserve screenshots/logs.
- Inspect entire existing repository, architecture, tests, and Stage 3 joint-space model. Do not rebuild any previous stage or change kinematic conventions casually.

## Future Stage 4 scope only (once explicitly requested)

- Place target objects in the 3D workspace with defined mass/size and placement bins (or other simple target platforms).
- Add gripper attachment/release rules, bounded collision proxies, clear contact-state reporting, and explicit distinctions between scripted grasp logic and physics-based dynamics.
- Introduce collision testing/constraints appropriate to the model, with deterministic test coverage and reproducible pick-and-place demo.
- Preserve Stage 1 controls, Stage 2 six-joint manual mode, Stage 3 measured *command* FK, upright-only constrained target IK and cancellation behavior.
- Extend automated tests and test actual WebGL interactions on Mac; update full source ZIP and handoff.

## Must not do yet

No Stage 4 code was implemented during Stage 3. Do not claim physical grasping, obstacle avoidance, 6-DOF arbitrary orientation IK, robot hardware, MediaPipe, webcam or gesture operation. These are either later stages or separate engineering work.

## Suggested next-chat instruction

> Start RoboMotion AI Stage 4 — Virtual Object Manipulation. Continue from the attached verified Stage 3 ZIP and preserve Stage 1–3. Add interactive objects, simulated gripper attachment/release, workspace targets and deterministic collision checks. Implement and test completely within the available environment; deliver an updated full ZIP with README, PROJECT_STATE, NEXT_STAGE and completion report. Do not start Stage 5.
