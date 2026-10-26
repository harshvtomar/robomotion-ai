# Next Stage — RoboMotion AI Stage 5

**Do not start Stage 5 during the current Stage 4 task.**

## Mandatory prerequisite

Run and visually confirm the complete Stage 4 application on the user's Mac:

```bash
cd ~/Downloads/robomotion-ai-stage4
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

Use the port printed by Vite (may be 5176 or higher if old Stage 1, Stage 2, Stage 3 servers are running). Run the browser acceptance checklist in `docs/QA.md`. Preserve the checkpoint before adding new features.

## Planned Stage 5 — Webcam Hand Gesture Recognition (separate chat)

1. Inspect this ZIP and all original Stage 1–4 features, especially the Stage 2 manual controls, Stage 3 IK, and Stage 4 object state.
2. Implement browser-based hand recognition using a supported MediaPipe model, with user-granted webcam permission, loading/error states and device teardown.
3. Provide a synthetic landmark fixture/replay mode to test without a webcam.
4. Implement stable gesture classification with thresholds and rejection/unknown class; report non-guaranteed accuracy truthfully.
5. Add explicit privacy UI, no camera capture/uploads by default, and user-controlled Start/Stop.
6. Keep gestures **read-only** during Stage 5. Stage 6 will map them to arm commands.
7. Add Node tests and browser QA; update all project handoff files and complete source ZIP.

Do not implement Stage 6, Stage 7 or Stage 8 early. No physical robotics claims.
