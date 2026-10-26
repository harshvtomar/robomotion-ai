# RoboMotion AI v0.4.0 — Gesture-Controlled Robotic Arm Digital Twin

**Current stage:** Stage 4 / 8 — Virtual Object Manipulation. This is a simulation only; webcam gesture input starts in later stages.

# RoboMotion AI — Stage 3: Kinematics & Motion Control (v0.3.0)

An interactive **software robotic-arm prototype** built with React 19, TypeScript, Three.js/React Three Fiber and Vite. Stage 1's 3D calibration scene and Stage 2's six-joint manual arm are preserved. Stage 3 adds **forward kinematics**, **bounded analytic position-only inverse kinematics**, **reachable-target feedback**, a target marker and **coordinated finite-duration joint commands**.

> **Honest scope:** This is an in-browser engineering simulation, not a connected physical digital twin. Commands are not sensor readings. No collision avoidance, physically certified accuracy, webcam recognition, actual object grip or motors are implemented.

## Open on Mac

Requires Node.js >=22.12 and working npm access on the first installation.

```bash
cd ~/Downloads
unzip RoboMotion_AI_Stage3_Kinematics_Motion.zip
cd robomotion-ai-stage3
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

Open the **exact Vite URL** printed by `npm run dev`, usually `http://127.0.0.1:5173`. If Stage 1/2 already occupies 5173, Vite may select 5174/5175. Do not overwrite the existing Stage 2 directory; Stage 3 is a complete stand-alone source snapshot.

## Interactions

1. **Manual robot control (retained):** Six bounded sliders for base yaw, shoulder, elbow, wrist pitch, wrist roll and gripper opening; keyboard slider support, small +/- adjustments, Home/Upright/Inspect/Folded presets and Reset pose.
2. **Scene tools (retained):** Orbit, zoom, preset cameras, grid/axes toggles, calibration beacon pause and independent Reset view.
3. **Target coordinates (new):** Scroll to the **Target kinematics console** and enter X, Y, Z in world metres, with Y up. The cyan marker shows the entered position when within the visual range. Shortcuts fill the Home TCP, Current TCP or an attainable Demo point.
4. **Inverse solution (new):** The console checks finite inputs, workspace and analytic two-link geometry, shoulder/elbow/base/wrist-pitch angle limits and final FK error. It chooses the nearest bounded upright-gripper solution. It reports a reason rather than moving when impossible.
5. **Move to target (new):** Starts a coordinated smoothstep joint-space plan within per-joint speed limits. The trajectory can be stopped, and interacting with manual sliders/presets or editing a target cancels an active plan. A green marker displays the requested point; FK readout shows the **commanded** tool location (not measured physical position). An additional per-frame visual smoothing layer may lag briefly after the command ends.

## Geometry convention and solver restrictions

- World is right-handed, +Y up; units are approximate visualization metres.
- Shoulder pivot height from ground is **1.12 m**; upper/forearm are **1.16 m / 0.96 m**; upright gripper TCP extension from wrist-pitch pivot is **0.72 m**. TCP is at the mid-finger contact reference, not a physical sensor.
- Shoulder/elbow/wrist pitch rotate around local Z; base yaws about +Y. Forward kinematics follows the actual hierarchical offsets defined by Stage 2's `RobotArm.tsx`.
- Position IK uses 2-link planar geometry, checks both elbow branches and yaw choices, and fixes the **world-relative tool pitch to upright (0°)**. It preserves wrist roll and gripper opening. Therefore this does **not** solve arbitrary 6D pose/orientation IK, and many points inside the coarse reach sphere can still be rejected.
- Explicit floor/ceiling and radial envelope checks come first; the solver then applies all joint bounds and validates the computed FK position within **15 mm** rounding tolerance. Invalid targets do not move the robot. No numerical runaway or silent clipping to a different position.
- Motion duration is derived from per-joint maximum rates with smoothstep peak-velocity compensation. This is coordinated joint interpolation **without acceleration/torque/obstacle constraints**; planned intermediate poses are within per-joint angular limits, but trajectories are **not guaranteed collision-free**.

## Testing

```bash
npm test               # 114 Node automated tests (Stage 1–3), no npm modules needed
npm run typecheck:core # core TypeScript check without third-party dependencies
npm run typecheck      # full React/R3F check after npm install
npm run build          # Vite production build after npm install
npm run verify         # test + full typecheck + build
```

**This conversation's evidence:** 114/114 automated tests and core TypeScript validation passed; updated TSX files passed syntax parsing. The runtime could not fetch npm packages, so the full React typecheck, production build and live browser motion are **not verified here**. Run the commands above on the Mac and attach console/screenshots before marking final browser acceptance. Earlier Stage 2 Mac production-build evidence does not verify newly added Stage 3 code.

## File guide

| Source | Purpose |
|---|---|
| `src/core/robot.ts` | Preserved manual joint limits/reducer; additive bounded SET_POSE command |
| `src/core/kinematics.ts` | New mathematically explicit forward/analytic inverse kinematics |
| `src/core/motion.ts` | New bounded coordinated smoothstep trajectory planning/sampling |
| `src/components/RobotArm.tsx` | Preserved Stage 2 procedural geometry and visual interpolation |
| `src/components/StarterScene.tsx` | Preserved scene with additive target marker |
| `src/App.tsx` | Manual controls plus target console and animation/cancel orchestration |
| `tests/stage3-kinematics.test.mjs` | FK/IK, negative, numerical and motion tests |
| `PROJECT_STATE.md`, `NEXT_STAGE.md` | Exact checkpoint and Stage 4 constraints |
| `docs/ARCHITECTURE.md`, `docs/QA.md` | Geometry and acceptance details |

## Portfolio integrity

Describe this as a **gesture-control-ready robotic arm simulation with tested position kinematics**; webcam and gesture recognition are not yet present (Stages 5–6). Do not claim real-world engineering calibration, autonomous physical robotic manipulation or collision-tested robotic hardware. For the Masters' Union application, film a working browser demonstration on your own Mac after completing browser verification.

MIT License; Stage 1/2 source and historical test suites retained.


## Stage 4: Pick-and-place demonstration

1. Use the **Virtual Object Manipulation** panel. Choose **Sample A** and click **Load pickup coordinates**.
2. In the preserved **Target Kinematics** console, click **Move to target** and let the 3D arm finish settling.
3. Click **Grasp & close**. The sample should attach to the gripper.
4. Select **Dock A** and **Load destination**; use **Move to target** again.
5. Click **Release & open** to place the sample safely. Repeat for samples B and C.

Invalid proximity, out-of-workspace placement, occupied docks, sample overlap, and sampled tool/object collision are rejected with feedback. This is discrete virtual grasping on **elevated fixtures**—not collision-free planning, full-body dynamics or a physical robot.

### Mac installation / verification

```bash
cd ~/Downloads
unzip RoboMotion_AI_Stage4_Virtual_Object_Manipulation.zip
cd robomotion-ai-stage4
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

Open the Vite local URL printed in Terminal. Do not assume a port; prior stage servers may use ports 5173–5175. See `docs/QA.md` for complete browser acceptance tests. 139 Node tests passed in the authoring environment; full React/Vite build and live Chrome rendering are **pending Mac verification**.

Next is Stage 5 **webcam gesture recognition only**, not yet implemented. `NEXT_STAGE.md` contains the separate handoff.
