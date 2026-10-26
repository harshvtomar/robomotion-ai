# Architecture — RoboMotion AI v0.2.0

## Runtime layout

```text
src/main.tsx
└── App.tsx
    ├── Sidebar + stage roadmap (Stage 1 retained)
    ├── Scene controls: camera/grid/axes/beacon/reset (stage1 reducer)
    ├── SceneErrorBoundary
    │   └── StarterScene.tsx: R3F Canvas, lights, ground, preserved pedestal/beacon
    │       ├── RobotArm.tsx: 3D procedural hierarchical joints and gripper
    │       └── CameraRig + OrbitControls
    └── RobotControls: 6 sliders, fine +/- buttons, presets, reset
          └── robotReducer (src/core/robot.ts)
```

There are **two independent state machines**: Stage 1 `sceneReducer` for camera/grid/axes/beacon and Stage 2 `robotReducer` for commanded robot pose. Camera reset does not affect the arm; pose reset does not affect the camera.

## Local joint transforms

- World coordinates: right-handed, **+Y up** (Three.js). All articulated links in a **parent-child hierarchy**.
- Base yaw: rotation about local `Y` at pedestal.
- Shoulder pitch: rotation around shoulder-local `Z`, with upper arm extending along local `+Y`.
- Elbow pitch: rotation around elbow-local `Z`, at end of upper arm, moving forearm relative to upper arm.
- Wrist pitch: rotation around wrist-local `Z`, forearm end; roll: rotation about the tool's local `Y`.
- Gripper opening: left/right finger positions move symmetrically along tool-local `X`. It is a visual width command; no contact or dynamics are simulated.

The prescribed mesh dimensions are stylized, approximately world-meter-scale: upper arm 1.16 units, forearm 0.96 units, wrist housing roughly 0.36 units. They are not precise factory joint lengths or calibrated measurements. Stages 3–4 should define formal kinematic geometry and a collision model separately before claiming motion accuracy.

## Input invariants

- All manual joint requests use `clampJoint()`, rejecting nonfinite values and unrecognized joints and bounding each joint to its declared `min/max`.
- `robotReducer` leaves original state untouched, applies only one joint, supports nudge/presets/reset.
- Preset values are immutable. UI reports commanded target values; `RobotArm` interpolates to them in `useFrame` with `easeJoint()`.
- Smooth interpolation is delta-time aware and monotonic for a fixed command; not a velocity-, torque- or collision-limited actuator model.

## Stage 1 preserved

`StarterScene` retains the calibration pedestal, Stage 1 grid and axes, the OrbitControls camera and the optional rotating calibration beacon (moved to side of platform to avoid overlapping arm). Mobile nav, controls and fallback remain.

## Limitations

No IK, FK readout, control loop feedback from physical sensors, physics contact model, digital-twin synchronization, ROS, hardware, webcam, telemetry collection or deployment. The word *digital twin* here is a prototype visualization, not a connected physical counterpart.
