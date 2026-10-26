# RoboMotion AI — Stage 4 handoff

Latest packaged code: **v0.4.0**, checkpoint from fully preserved Stage 3 source. The project remains local and has not been published. Include the entire Stage 4 ZIP when continuing in ChatGPT Chat or Work; do not use outdated Stage 1–3 ZIPs.

**QA:** 139 automated tests passed in this conversation, core TypeScript passed, all 14 TS/TSX syntax checks passed. Full React `npm run typecheck`, Vite production build and interactive WebGL sample-transfer workflow remain **unverified in this environment** because dependencies were not available; run them on user's Mac. See `docs/QA.md`.

**Functionality:** Discrete three-sample pick-and-place in elevated reference test fixtures; uses Stage 3 upright position IK. No actual camera/hand gestures, robotics hardware, grasp-force calculation or real rigid-body physics. Collision checks are only approximate sampled TCP/carried sample versus unheld samples and workspace boundaries.

**Next:** Stage 5 camera landmark and gesture recognition (read-only); **do not** begin gesture-driven robot mapping (Stage 6) before that separate scope. Preserve all Stage 1–4 features and tests.
