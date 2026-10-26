# Stage 2 QA plan

## Automated

1. `npm test` — original 30 historical tests (one historical Stage 1 content assertion updated to reflect Stage 2), Stage 2 reducer/preset/limits/smoothing tests and source integration contracts.
2. `npm run typecheck:core` — pure modules `stage1.ts` and `robot.ts`.
3. `npm run typecheck` — full React/Three.js types after dependency installation.
4. `npm run build` — production bundle after dependency installation.

**Current result:** 74 tests passed, core TypeScript check passed, and 9 source/config files passed TS/TSX syntax inspection. Full typecheck/build and browser acceptance are pending npm installation on Mac. See `../STAGE_2_COMPLETION_REPORT.md`.

## Mac browser manual acceptance

- Verify scene loads without console error and arm actually appears on existing pedestal.
- Drag to orbit, scroll zoom, choose isometric/front/top; reset view from a modified camera.
- Grid and axes toggle; pause/play toggles side beacon and does not disable arm controls.
- For each slider, move near minimum, midpoint and maximum. Confirm the expected **individual axis** moves smoothly, without visually teleporting. Check no illegal readout values.
- Click +/- while at limits, confirm buttons disabled appropriately. Use keyboard arrow keys on sliders.
- Apply home, upright, inspect and folded presets. Verify all joints update; reset pose returns home without changing camera.
- Resize to 1280, 760 and 390 CSS px; ensure sliders, labels, buttons are readable/operable.
- Reload, inspect 3D WebGL fallback on disabled-WebGL environment when possible.
- Run all three CLI checks (`npm test`, `npm run typecheck`, `npm run build`) locally.

## Known omissions

This environment cannot download/install npm dependencies. Therefore **full JSX typing, production bundle, rendering accuracy, actual screenshot and Chrome interactions remain unverified here**. Stage 2 unit tests exercise pure logic and source wiring, not real GPU frames. Do not describe them as end-to-end browser tests.
