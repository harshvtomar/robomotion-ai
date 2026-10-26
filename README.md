# RoboMotion AI — Gesture-Controlled Robotic Arm Digital Twin

**Version 0.6.0 · Stage 6/8 · October 26, 2026**  
React 19 · TypeScript · Vite · Three.js / React Three Fiber · MediaPipe Tasks Vision

A browser-based **simulation** of a multi-joint robotic arm. Stage 6 adds a safety-gated mapping from **live, calibrated webcam gestures** to **virtual** joint commands. It is not an industrial controller or a physical robotics system.

## Features preserved from Stages 1–5

- 3D environment with orbit camera, grid, axes, resets and responsive dashboard.
- Six articulated manual joints with clamped ranges, four pose presets, smooth render interpolation.
- Forward and inverse position kinematics, upright tool constraint, reachability bounds, targeted movement.
- Three virtual samples and elevated source/dock fixtures, discrete grasp and release, sampled tool/object collision checks.
- Optional webcam + MediaPipe HandLandmarker (21 points), heuristic gesture recognition, stable voting, neutral-hand calibration and six synthetic fixture options (including No hand).

## New Stage 6 controls

The **Gesture-to-Robot Control** panel is deliberately independent of the camera/recognition module:

| Gesture | Behavior once manually ARMED |
|---|---|
| Open palm | Follow calibrated, bounded hand displacement in virtual XYZ |
| Point | Smaller fine-position adjustment |
| Fist | Hold pose (do not move) |
| Pinch | Close **virtual** gripper to 22%; never automatically grasp an object |
| Peace | Open **virtual** gripper to 66%; never automatically drop an object |
| No hand / lost frames | Immediately disarm; all new gesture commands stop |

**All gesture movements require:** a fresh camera frame, live hand (synthetic never qualifies), calibration, explicit Arm click, valid IK, per-joint speed/limit control and Stage 4 sampled tool/object clearance checks. Calibration is anchored to current tool position when the user arms, to avoid a jump. There is no camera video upload by application code; MediaPipe model/WASM are fetched from third-party hosts and SDK diagnostics may be transmitted. No hardware interface exists.

- **Disable gesture control:** stops hand actuation; manual controls remain available.
- **EMERGENCY STOP:** latches off *all simulated motion*, including manual and target movement; **Reset stop** clears it but never rearms gestures automatically. This is **not a certified physical E-stop**.
- **Manual override:** any manual slider, pose preset, IK target selection, or manipulation operation disarms gesture control.
- **No held-object teleoperation:** user must manually dock/release an attached sample before arming. Pinch/Peace manipulate finger spacing only, not the grasp state.

## Mac install and verification

Node 22.12+ and npm network access are required for initial setup. Extract the archive into Downloads, then:

```bash
cd ~/Downloads
unzip RoboMotion_AI_Stage6_Gesture_Robot_Integration.zip
cd robomotion-ai-stage6
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

Open the **Local** URL shown by Vite (do not assume a port). In Chrome:

1. Open **Hand Gesture Lab**, start webcam and allow access.
2. Hold a stable **open palm** and click **Calibrate**. Wait for 12 accepted open-palm frames.
3. With your palm visible, click **Arm live gestures** in the Stage 6 panel. Move your palm gently to see the arm move; allow small movements first. Use Point for fine motion.
4. Test Fist hold; Pinch and Peace finger spacing, manual slider override, synthetic selection disarming, hand-loss disarming, and Emergency Stop/reset.
5. Check the browser console for errors. Test Stage 4 docking again to confirm no regressions.

See `docs/QA.md` for the complete Mac acceptance checklist.

## Test evidence and limitations

- **203/203 Node unit/source tests passed** in the creation environment.
- **Core TypeScript** passed; all 18 TS/TSX files parsed without syntax errors.
- **Full React typecheck/build and real webcam-to-robot control must still be verified on the Mac**. npm dependencies could not be fetched in the source-generation environment.
- Webcam classification is a simple landmark-geometry heuristic, **not** a rigorously evaluated gesture model. Motion occurs only in virtual kinematics; actual pose may ease after commanded pose. No full-link/self-collision safety, rigid-body grasp dynamics or real sensors.
- Stage 7 diagnostics/dashboard enhancements are **not implemented**.
