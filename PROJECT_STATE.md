# RoboMotion AI — Project state at Stage 8 source handoff

**Version:** 0.8.0 · **Project mode:** browser simulation only · **Development stages:** 8/8 source implementations present.

## Source lineage and preserved modules

Direct copy of actual Stage 7 source and `.git` history, based on verified Stage 6 safety controller. Retains Stages 1–7: React/Three.js scene, six-joint pose controls, FK/IK target motion, sampled virtual object manipulation, MediaPipe gesture lab, safety-gated live gesture teleoperation, diagnostics/events/exports and guided demo.

## Stage 8 additions

- Split the 3D rendering and gesture UI into separate React.lazy/Suspense chunks while preserving on-demand MediaPipe import.
- Responsive camera framing policy in `src/core/camera.ts`, with safe bounds and tests.
- Release diagnostics scripts (`scripts/release-audit.mjs`, `scripts/bundle-report.mjs`) and an explicit bundle baseline comparator.
- Versioned project metadata/UI roadmap and keyboard/reduced-motion fallback styles.
- GitHub CI and an **opt-in** GitHub Pages workflow with configurable Vite base path.
- Release QA, privacy/limitations, deployment, demo script, case study and resume documents.

## Verification status

See `STAGE_8_COMPLETION_REPORT.md` for executed tests. Full npm dependency installation and browser QA are not verified in this environment. Mac user must run `npm run verify` and the 19-item checklist before Stage 8 can be described as fully accepted.

**Explicit exclusions:** physical robot control, full collision dynamics, webcam uploads, face/identity recognition, guaranteed gesture accuracy, unmeasured performance gains and invented public URLs.
