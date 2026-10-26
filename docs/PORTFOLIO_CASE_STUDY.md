# RoboMotion AI — Gesture-Controlled Robotic Arm Digital Twin

**Project type:** browser-based engineering simulation, not a physical robot.  
**Motivation:** Build an interactive, audience-facing mechanical-robotics demonstration relevant to a builder/prototyping internship.

## Engineering challenge

The objective was to connect a procedurally modeled articulated robot to coordinate-level target control, simulated object pickup/docking, and a webcam gesture observer without permitting uncontrolled or unbounded simulated motion. A guided, diagnosable demonstration was essential so a viewer could understand design choices rather than seeing only a rendered model.

## System design

- **3D view and manual joints:** React, TypeScript, React Three Fiber, Three.js, orbit camera, six bounded channels, four presets.
- **Robot math:** forward kinematics, analytic position-only inverse kinematics for an upright tool, reachability/joint limits, bounded motion steps. FK target error is based on *commanded* angles, not measured physical position.
- **Object task:** three virtual samples and three elevated stations, proximity-based grasp/release, occupancy rejection and sampled tool/object collision checks. No force dynamics or full-link collision avoidance.
- **Computer vision:** MediaPipe webcam landmarks on the user's device and deterministic synthetic fixtures for tests. Webcam requires explicit permission; model/WASM download occurs on first use.
- **Teleoperation safeguards:** calibration and explicit arming; bounds, hold/disarm, gesture tracking-loss handling, emergency-stop latch and manual override. Virtual control only.
- **Diagnostics:** enumerated session events, event counters, safety status, CSV/JSON exports, manual demo checklist; no deliberate recording of camera frames or landmark arrays.

## Verification evidence

Publication validation on 26 October 2026 ran 261 deterministic tests with zero failures, full TypeScript validation, a Vite production build and the release safety audit. The project owner separately confirmed seven final Mac/browser acceptance checks, including camera-driven simulation. These are owner-reported device checks, not repeated camera tests by the publication agent.

The measured largest JavaScript chunk is 952,670 bytes, approximately 24% below the approximate Stage 7 screenshot baseline of 1,254,140 bytes. Four JavaScript assets total 1,395,599 bytes. Lazy loading separates the renderer and on-demand vision runtime; this does not establish a runtime FPS improvement. Vite's large-chunk warning remains disclosed.

See [publication QA](PUBLICATION_QA.md) for hosted CI, deployment and public-browser results. No measured human gesture accuracy or physical end-effector precision is claimed.

## Why this is relevant to Builders.mu

The project demonstrates robotics mathematics, a realistic iterative build/debugging process, interactive mechanical visualization and an audience-friendly engineering explanation. It does **not** prove Arduino, soldering or hands-on hardware prototyping experience; pair it with authentic physical-project evidence for a role emphasizing hands-on builds.

## Known limitations and next engineering experiments

The geometric arm is not a calibrated mechanical CAD assembly. IK targets position only, with restricted tool orientation. Collision checks sample tool/object paths but not every link, and grasping is state-based rather than force-closed. Gesture accuracy varies with lighting, occlusion and model inputs, and there is no independently measured gesture confusion matrix. Next appropriate work includes formal visual regression, authentic browser acceptance and measured performance, before discussing any real robot hardware.
