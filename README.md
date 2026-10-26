# RoboMotion AI — Stage 2: Articulated 3D Robot (v0.2.0)

An interactive **manual-control robotic arm digital twin prototype** built with React 19, TypeScript, Three.js, React Three Fiber and Vite. The procedural 3D arm, six joint channels and Stage 1 calibration workspace run completely in the browser—no hardware, webcam or server required.

> Scope: This is a **kinematic hierarchy visualization driven by manual joint angles**, not a physical robot, inverse-kinematics solver, grasp simulator or gesture-recognition system. Those features are planned for later stages.

## Getting started on Mac

Prerequisites: Node.js 22.12+ and internet for the first npm installation.

```bash
cd ~/Downloads/robomotion-ai-stage2
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

Open the local URL printed by Vite, typically `http://127.0.0.1:5173`.

**When upgrading from Stage 1:** Extract Stage 2 into its own folder. The ZIP contains the full Stage 1 foundation plus Stage 2 files. Avoid overlaying a running Stage 1 folder. If port 5173 is occupied, stop the Stage 1 dev server with Ctrl+C before starting Stage 2. No local installation of robotic hardware or SDKs is required.

## Controls

1. **3D viewport:** Drag to rotate the orbit camera and scroll to zoom. Select **isometric/front/top** in the Scene Inspector. **Reset view** restores the camera and Stage 1 grid/axes/beacon settings without changing the robot pose.
2. **Stage 1 controls:** Toggle **Grid**, **Axes** and **Pause beacon** (the reference beacon animation). Pausing the beacon does *not* pause manual robot commands.
3. **Stage 2 joint console:** Six labelled sliders (base yaw, shoulder, elbow, wrist pitch, wrist roll and gripper opening), with keyboard-capable native `<input type="range">` controls and fine +/- buttons.
4. **Quick poses:** Home, Upright, Inspect, Folded. **Reset pose** restores the home pose, independently of camera reset.
5. **Safety in simulation:** Commands are clamped to defined numeric limits and non-finite/unknown inputs are rejected in the pure reducer. Limits are demonstrative, not certified for hardware.

## Manual joint ranges

| Joint | Command range | Mechanism |
| --- | --- | --- |
| Base | -170° to +170° | Yaw about vertical (+Y) |
| Shoulder | -80° to +80° | Pitch around local Z |
| Elbow | -135° to +135° | Relative pitch around local Z |
| Wrist pitch | -100° to +100° | Relative pitch around local Z |
| Wrist roll | -170° to +170° | Tool-head rotation around local Y |
| Gripper | 0 to 100% | Symmetric movement of two fingers |

The arm is a hierarchical **procedural stylized model** with base/shoulder/elbow/wrist pivots, link casings, accent panels, mechanical hinges, and parallel fingers. It is not a downloaded rigged model or an engineering-certified CAD model.

## Verification

```bash
npm test                 # dependency-free node test runner; original regressions + Stage 2 tests
npm run typecheck:core   # pure TypeScript contracts
npm run typecheck        # full React/Three.js check; requires npm install
npm run build            # production bundle; requires npm install
npm run verify           # test, typecheck and build
```

See [`STAGE_2_COMPLETION_REPORT.md`](STAGE_2_COMPLETION_REPORT.md) for the results achieved in this chat/runtime and checks still pending on your Mac. Do not claim a successful live browser or WebGL verification without running it locally.

## Source map

- `src/core/stage1.ts` — preserved Stage 1 scene settings and camera reducer
- `src/core/robot.ts` — new pure Stage 2 joint limits, reducer, presets, smoothing
- `src/components/StarterScene.tsx` — preserved Stage 1 Canvas with Stage 2 arm mounted
- `src/components/RobotArm.tsx` — new articulated 3D model and animation
- `src/App.tsx` — preserved dashboard with Stage 2 joint-console section
- `tests/` — original tests, updated Stage 2 content assertion, additional robot tests
- `PROJECT_STATE.md`, `NEXT_STAGE.md` — state and Stage 3 contract

## Credits and portfolio honesty

Designed and implemented as a software simulation. Do not describe it as a built physical arm or claim real-world measurement, hardware control, autonomous pick-and-place or webcam functionality. Record a browser demonstration after verifying the UI on your own Mac.

MIT License. Existing Stage 1 source and test history preserved in included `.git` baseline (when present).
