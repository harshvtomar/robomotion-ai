# RoboMotion AI

**Stage 1 — Foundation & Engineering Workspace**  
A future gesture-controlled robotic arm digital twin, starting with a real React/Three.js calibration scene.

> **Scope honesty:** Stage 1 contains **no robotic arm model, inverse kinematics, gesture recognition, physics engine, or real hardware control**. These belong to future stages. The current animated object is a neutral origin calibration beacon, not a robot.

## What works in Stage 1 source

- React + TypeScript + Vite application shell
- Three.js scene through React Three Fiber, with OrbitControls
- Origin calibration plinth, lighting, grid and coordinate axes
- Isometric/front/top camera presets and camera reset
- Grid and axes visibility toggles, pause/resume beacon animation
- Responsive dark engineering dashboard and eight-stage roadmap
- Pure scene state reducer, unit tests, and browser/WebGL fallbacks
- CI workflow and handoff documentation

**Verification status:** Source tests and independent TypeScript core checks were run in the authoring container. Full React/Three.js dependency installation, production build and browser verification **were blocked by npm registry DNS/network access**. Do not interpret source tests as end-to-end browser QA. See `docs/QA.md`.

## Run on Mac (no downloads except required npm dependencies)

Requires Node.js 22 or later, a modern browser and internet access for the initial dependency install.

```bash
unzip RoboMotion_AI_Stage1.zip
cd robomotion-ai-stage1
node --version
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

Open the local URL printed by Vite (usually `http://127.0.0.1:5173`). Use a local server, **not** double-clicking `index.html`, which relies on the Vite dev/build pipeline.

For dependency-free source tests (Node 22+), use `npm test` without `npm install`. Run `npm run typecheck:core` only if a globally installed `tsc` or the local TypeScript dependency is available.

## Workspace controls

| Input | Outcome |
| --- | --- |
| Drag on 3D viewer | Rotate scene orbit |
| Scroll / pinch | Zoom |
| Camera select | Choose isometric, front or top |
| Grid | Toggle reference grid |
| Axes | Toggle XYZ axes |
| Pause/Play | Stop/start calibration beacon only |
| Reset view | Restore settings and camera |

> The dashboard is a **simulation foundation**, not a physical robot or industrial motion controller.

## Folder guide

- `src/App.tsx` — app shell and Stage 1 scene settings
- `src/components/StarterScene.tsx` — Three.js calibration model and viewport
- `src/components/SceneErrorBoundary.tsx` — WebGL failure experience
- `src/core/stage1.ts` — pure contracts, presets, reducer and stage definitions
- `src/styles.css` — responsive visual design
- `tests` — dependency-free source/domain tests
- `PROJECT_STATE.md` / `NEXT_STAGE.md` — resume the next chat safely
- `docs/ARCHITECTURE.md` — implementation/design decisions
- `docs/QA.md` — verification evidence and limitations

## Useful commands

```bash
npm run preflight         # show environment readiness
npm test                  # dependency-free Node tests
npm run typecheck:core    # pure TypeScript logic only
npm run typecheck         # full application check (requires npm install)
npm run build             # Vite production build (requires npm install)
npm run preview           # serve existing dist locally
```

## Future stages

Stage 2: actual articulated 3D robot with user-operated joint controls. Stage 3: kinematics. Stage 4: manipulation. Stage 5: gesture recognition. Stage 6: mapping. Stage 7: engineering dashboard. Stage 8: full QA. See `NEXT_STAGE.md`.

## License

MIT — see `LICENSE`. No external fonts, models or copyrighted art are bundled.
