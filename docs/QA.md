# RoboMotion AI — Stage 4 Mac Verification & QA

## Build and test

Extract `RoboMotion_AI_Stage4_Virtual_Object_Manipulation.zip` into `~/Downloads/robomotion-ai-stage4`. In Terminal:

```bash
cd ~/Downloads/robomotion-ai-stage4
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

Use **the exact Local URL shown in Terminal**, rather than assuming 5173; old Stage 1–3 instances may occupy prior ports. `npm test` should report 139 passing tests. Full React typecheck and production build are **pending Mac validation**.

## Browser acceptance (record a short screen video)

1. **Regression:** the original 3D arm, joint sliders, presets, camera orbit/presets, grid, axes, beacon, Reset view and Reset pose all remain usable; Stage 3 Home TCP, Demo point, reachable/unreachable feedback and Stop motion still work.
2. **Station rendering:** six slim elevated pickup/drop test fixtures appear, with three coloured samples; the Stage 4 panel lists all samples and destinations.
3. **Pickup:** select Sample A → click **Load pickup coordinates** → in Target Kinematics click **Move to target** → let the arm settle → click **Grasp & close**. Sample A should disappear from its source station and appear between the robot fingers.
4. **Carried movement:** select Dock A → click **Load destination** → click **Move to target** in Target Kinematics. Sample A should move with the end effector. It must not remain hovering at the original stand.
5. **Release:** at Dock A, click **Release & open**. Sample should now stay at the dock, not be attached to the arm. Dock A should show occupied. Pick and place samples B and C similarly.
6. **Invalid grasp:** Reset virtual objects. Try Grasp & close without moving near selected sample. Expect rejection and **no attachment**.
7. **Invalid release:** While carrying an object and away from its dock, click Release & open. It must refuse and retain attachment.
8. **Occupied dock:** After docking A at Dock A, try releasing Sample B onto Dock A. It must refuse without overlap or silently losing the carried sample.
9. **Workspace:** X=9, Y=2, Z=0 must remain unreachable. A target path too near another sample should be rejected before motion. Other existing kinematics checks remain correct.
10. **Reset:** Reset virtual objects should restore all three source samples and docking counter. Verify keyboard navigation and narrow window layout; inspect browser developer console for uncaught errors.

## Notes

- The default camera may need a zoom adjustment to inspect the elevated stations; use scroll wheel and orbit controls.
- Numeric FK and IK show **commanded** motion, and R3F model eases independently. Wait for the displayed arm to settle before triggering grasp/release; a visible lag is expected.
- **Not modelled:** full arm-link or pedestal collision, true rigid-body physics, gravity, grasp friction or forces. Avoid claims of collision-free industrial autonomy.
- A Vite chunk-size warning is not itself a failed build.
- If a runtime error occurs, preserve console logs and exact reproduction steps, then repair Stage 4 before starting Stage 5.

## Stage 5 Mac acceptance (not yet performed)

- `npm install && npm test && npm run typecheck && npm run build`: all must pass before accepting Stage 5.
- Open `#gesture-controls`, verify five synthetic gestures, "No hand", stable labels, and synthetic calibration.
- Start webcam in Chrome and approve permission: verify live hand landmarks/gesture labels.
- Deny permission once and verify graceful failure and camera recovery via retry.
- Click Stop & release; confirm macOS camera indicator extinguishes, and restart requires another click.
- Switch away from tab while running: confirm release on hide.
- Confirm no gesture affects existing joint, IK, or grasp state.
- Recheck one Stage 4 pickup-to-dock workflow after Stage 5 installation.

Model/WASM are fetched during initial live usage and could be blocked by firewall or offline mode. Synthetic mode does not require a camera or live model inference after the application is installed.

## Stage 6 Mac acceptance — MUST execute before sign-off

**From `~/Downloads/robomotion-ai-stage6`:** `npm install && npm test && npm run typecheck && npm run build && npm run dev`. Tests should show **203 passed, 0 failed**. Open the exact Vite Local URL. Do not treat the prior source-only tests as proof of browser behavior.

1. Verify Stages 1–4 regression: scene camera/grid/axes, manual sliders/presets, IK reachable and unreachable targets, Sample A grasp → dock release. All should still work with Stage 6 disabled.
2. Verify Stage 5 synthetic buttons and opt-in webcam tracking, handedness display, 21-point overlay, and stop/release.
3. Verify calibration is initially absent. Arming must refuse without starting the camera, without calibration, and while a virtual sample is held.
4. Start webcam, display **open palm**, press Calibrate and hold steady for 12 accepted samples. After calibration, Arm live gestures should activate. Do not test with synthetic mode for actuation.
5. Move live palm slightly left/right/up/down; visual robot should follow with smooth, bounded changes. Point should move more finely. Unreachable targets must never bypass IK or joint constraints.
6. Form a Fist: arm must hold; form Pinch: gripper should narrow (no attachment); form Peace: gripper should widen (no release of held sample).
7. With gestures armed, touch a manual slider or choose a pose preset: gestures **must immediately disarm** and the manual input must take priority. Repeat with Target Kinematics.
8. While armed, remove the hand, stop the camera, switch to a synthetic fixture or hide the tab: gesture control must disarm and hold. To recover, operator must arm deliberately again.
9. Press **EMERGENCY STOP** while moving (or in any mode): no manual slider, target Move, object grasp/release or camera gesture may move the robot. Verify Reset stop keeps the controller disabled and manual action resumes only after reset.
10. Verify diagnostics/status are understandable at narrow Chrome width; keyboard focus and disabled button states; no uncaught Chrome console errors.

**If any criterion fails**, save the screenshots and exact actions, repair Stage 6, rerun test/build; do not proceed to Stage 7. Simulation-only safeguards are not a replacement for physical safety interlocks.
