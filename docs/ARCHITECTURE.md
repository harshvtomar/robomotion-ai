# RoboMotion AI v0.4.0 — Engineering Architecture

## Preserved original modules

- `src/core/stage1.ts`: reference coordinate system, scene preferences, camera, axes, grid and beacon.
- `src/core/robot.ts`: six manual joints, four presets, joint limits and visual easing.
- `src/core/kinematics.ts`: analytic TCP position FK and upright-gripper position IK, right-handed +Y-up metres.
- `src/core/motion.ts`: bounded smoothstep commanded joint trajectories.
- `src/components/RobotArm.tsx`: nested base, shoulder, elbow, wrist and finger meshes with frame-smoothed articulation.
- `src/components/StarterScene.tsx`: plinth, orbit camera, lights, target marker and R3F Canvas.

## Stage 4 additions

```
App.tsx
├─ existing scene reducer / joint reducer / Stage 3 motion
├─ state: selected sample, selected dock, manipulation objects, held ID
├─ ManipulationControls.tsx (sample/dock selectors, actions, feedback)
├─ manipulation.ts (pure object & safety state transitions)
│  ├─ createInitialManipulation (3 source samples, 3 destination docks)
│  ├─ graspObject (gripper <=22%, tool within 0.19m)
│  ├─ releaseObject (tool within 0.19m of available dock)
│  ├─ validatePlacement (bounds, sample sphere-overlap)
│  └─ checkTrajectory (time-sampled TCP/carried sample vs other samples)
└─ StarterScene -> VirtualStations (unheld), RobotArm->SampleMesh (held)
```

## Semantics

The simulated gripper locks a selected object to the **visual wrist local pivot**, at `0.36m` above wrist roll origin (the Stage 3 TCP). When attached, the object is removed from scene-root rendering to avoid doubles. Releasing snaps the object to the predefined dock position and restores it as scene-root geometry. There is no external position sensor or force-feedback loop.

The Stage 3 solver keeps the tool upright: many floor-height coordinates are not reachable. Stage 4 fixtures deliberately sit at mathematically solvable elevations (~3.4–3.5 m). These thin pillars are reference fixtures, not collision obstacles or physical robot stands.

Collision sampling traverses the same smoothstep commanded trajectory as Stage 3 and checks tool radius + carried sample sphere against unheld samples. It rejects non-finite/invalid motion, out-of-workspace paths and sample overlap. Pickup approach permits intentional contact with the selected sample during the final half of a trajectory; other samples remain obstacles. It **does not** detect full articulated arm self-collision, arm/support collision, or guarantee safe rigid-body motion.

## Acceptance boundary

139 deterministic Node tests and core TypeScript checks passed here. Full React/Vite build and browser-level WebGL interaction must run on Mac before Stage 4 is accepted. Stage 5 gesture recognition is not included.

## Stage 5 vision boundary

- `src/vision/gestures.ts` — pure geometry heuristic, temporal voting, calibration, and synthetic landmark fixtures.
- `src/vision/mediapipe.ts` — lazy, on-demand MediaPipe Tasks Vision Hand Landmarker adapter, pinned package/runtime version.
- `src/components/GestureLab.tsx` — self-contained local webcam preview, camera permission/release lifecycle, skeleton overlay, synthetic test UI.
- `src/App.tsx` renders the Gesture Lab as an observational child only; it neither passes `robotDispatch` nor grants `manipulation`/`moveToTarget` callbacks.

Risk boundaries: no inferred physical robot motion, no automatic camera access, no video persistence, no Stage 6 gesture-to-robot bridge.
