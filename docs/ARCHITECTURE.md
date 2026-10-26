# RoboMotion AI v0.3.0 — Engineering architecture

## Component/data flow

```
App.tsx
├── sceneReducer (stage1.ts)                camera, grid, axes, beacon, view reset
├── robotReducer (robot.ts)                 6 manual joint commands and SET_POSE
├── TargetControls                          XYZ metres input, validation/readouts
│   ├── forwardKinematics (kinematics.ts)   commanded tool point
│   ├── inverseKinematics (kinematics.ts)   analytic upright-tool position IK
│   └── planMotion/sampleMotion (motion.ts) finite-duration smoothstep joint trajectory
└── StarterScene (React Three Fiber Canvas)
    ├── stage1 preserved plinth/beacon/grid/axes/camera
    ├── stage2 RobotArm (nested joints, visual interpolation)
    └── stage3 cyan target position marker
```

## Frame / units

Right-handed Three.js coordinates: **X, Y, Z**, **+Y up**, modelling units called metres for illustration. The base rotates about +Y; shoulder, elbow and wrist pitch rotate about their local +Z. The geometry is *not* calibrated against real hardware.

A world-space shoulder origin: `(0, 1.12, 0)`. Upper arm length `L1=1.16`, forearm `L2=0.96`, TCP offset from wrist pitch `Lt=0.72` along its local +Y, at mid-finger contact region. Stage 2 procedural mesh hierarchy is unchanged.

Let `b`, `s`, `e`, `w` be yaw, shoulder, elbow and wrist-pitch angles, **converted to radians**. Let `a = s+e`, `t = s+e+w`.

```
q = L1*sin(s) + L2*sin(a) + Lt*sin(t)
X = -q*cos(b)
Y = 1.12 + L1*cos(s) + L2*cos(a) + Lt*cos(t)
Z =  q*sin(b)
```

A TCP reference on the gripper axis is unaffected by tool roll and finger width.

## Analytic target IK

The target **position** is solved for upright tool pitch `t=0`. Project the goal onto the yaw-aligned plane and subtract the upright tool offset `Lt` from Y. For each yaw branch and each elbow solution (`±acos()`), solve classic two-link planar geometry:

```
cos(e) = (r² + h² - L1² - L2²)/(2*L1*L2)
s = atan2(r,h) - atan2(L2*sin(e), L1 + L2*cos(e))
w = -s-e
```

`r` is **signed** radial position in the candidate base-yaw frame; `h=Y-1.12-Lt`. Candidates must respect software joint limits and pass an FK residual <=0.015 m. Choose feasible candidate with minimum squared angular departure from commanded seed pose. Inputs, coarse envelope, geometric circle bounds and joint bounds have separate error codes. At Y-axis singularity candidate yaw defaults to seed yaw/0; orientation yaw about a fully centered TCP is arbitrary.

This is intentionally **not** arbitrary-orientation 6D IK, dynamic path planning or physics. A target in the reach sphere may be unreachable once the upright tool restriction and joint ranges are applied.

## Time-domain motion

`planMotion(from,to)` derives a shared duration from joint angular travel and configured per-joint maximum velocities. `sampleMotion(t)` applies cubic smoothstep `3u²−2u³`, which peaks at derivative 1.5 and ends with zero velocity. `requestAnimationFrame` sends pure bounded `SET_POSE` command snapshots and supports cancellation. Stage 2 R3F retains its existing visual `easeJoint` filter, so visualization is **not exact encoder feedback** and may settle after the commanded finish.

## Test boundaries

114 deterministic Node tests (including 240 sampled candidate configurations) verify FK/IK consistency and bounds, including failures and trajectory properties. Node tests do not substitute for Chrome WebGL correctness, integration visuals, cross-browser validation or a production build. No new packages are required beyond Stage 2.
