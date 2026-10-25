# Architecture — RoboMotion AI v0.1.0

## Stack

- **UI:** React 19, TypeScript 5, CSS (system fonts; no image/font fetching)
- **Dev/build:** Vite 7
- **3D:** Three.js via React Three Fiber 9; Drei `OrbitControls`
- **Test:** built-in Node test runner for pure contracts/source sanity (no test runner dependency)
- **Hosting:** designed for static hosting via Vite's `dist/` folder, but no deployment has been performed

React 19 + Fiber 9 was chosen to avoid the alpha v10 API; see upstream documentation for compatibility.

## Data flow

```text
src/main.tsx
  └── App.tsx (useReducer + UI state)
       ├── Sidebar (project stages and anchors)
       ├── scene tools (camera/grid/axes/animation/reset)
       ├── SceneErrorBoundary
       │    └── StarterScene (Canvas)
       │         ├── StarterWorld (lights/floor/grid/axes)
       │         ├── OriginPlinth + CalibrationBeacon
       │         └── CameraRig + OrbitControls
       └── Stage roadmap and educational metadata
             ↑
       src/core/stage1.ts (pure settings, reducer, presets)
```

## Units / coordinates

Right-handed Three.js coordinates, `+Y` up, ground at approximately `-0.13 m` in world units, 10 m square reference grid. These are simulated dimensions; Stage 2 must define physically meaningful arm link lengths separately.

## Reducer contract

Actions: `SET_CAMERA`, `TOGGLE_GRID`, `TOGGLE_AXES`, `TOGGLE_MOTION`, `RESET`. `RESET` also increments a camera-reset counter so that manually orbiting then resetting works even if already in the default camera preset.

`onCreated` indicates a WebGL canvas is ready; no server connectivity or robot hardware is implied.

## Rendering notes

- Grid reference and calibration base are procedural 3D geometry, not sprites.
- Beacon spin is the only autonomous motion in Stage 1.
- OrbitControls enables rotate + wheel zoom; panning is disabled to keep focus on the origin.
- Frame pixel ratio capped for modest laptops.
- Scene fallback and React error boundary preserve a readable UI if WebGL fails.
- No telemetry, sensors, or true physics are present at this stage.

## Stage 2 extension seams

- Add `src/core/joints.ts` with typed geometry/limits and reducer.
- Add `src/components/RobotArm.tsx` with hierarchical joint transform groups.
- Keep calibration model selectable/optional; do not unconditionally replace the foundation.
- Make sliders accessible and state deterministic so tests can validate joint limits.
- No camera/media permission necessary until Stage 5.
