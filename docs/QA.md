# Stage 3 QA and Mac acceptance

## Completed in conversation

- Verified the copied Stage 2 baseline (74 passing automated tests).
- 114 combined Node tests passing with zero failures.
- Core TypeScript compilation passed (`tsc -p tsconfig.core.json`).
- Syntax-transpilation checks on new and updated TypeScript/TSX sources passed.
- Checked positive FK/IK test vectors, yaw invariants, 240 deterministic candidate poses, unreachable/invalid goals, numerical residual tolerance, motion sampling, peak joint-speed limit, immutability, manual reducer compatibility and source contracts.

## Not validated here

- `npm install` could not complete due unavailable npm registry access. Consequently, full React/Three.js TS typecheck, Vite build, live WebGL scene inspection, real browser animation, and device-specific performance have not been independently checked for **Stage 3**.

## Mac full verification

```bash
cd ~/Downloads/robomotion-ai-stage3
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

Open the Vite Local URL printed in terminal. On an occupied 5173 port it may use 5174 or 5175; never assume the port.

Browser acceptance checklist:

- [ ] Articulated arm remains visible; Grid, Axes, camera preset, Pause beacon and Reset view still work.
- [ ] All 6 joint sliders, +- controls, 4 presets and Reset pose remain functional with limits.
- [ ] Kinematics console shows finite commanded X/Y/Z and target marker appears in the correct 3D position.
- [ ] Home TCP is reachable and yields small FK residual; Demo point moves arm to the green marker after the visual model settles.
- [ ] Stop motion and editing target cancel an active trajectory; manual sliders/presets override planned motion.
- [ ] Invalid and unreachable coordinates show clear blocked status; Move button is disabled rather than snapping robot to an impossible point.
- [ ] Narrow-screen Chrome viewport and keyboard slider interaction operate cleanly.
- [ ] Browser console contains no uncaught exceptions; rerun test/typecheck/build after fixes.

Known warning: Vite may warn about a large JavaScript chunk because Three.js is substantial. A warning is not a failed build; bundle optimization can be deferred if performance is acceptable.
