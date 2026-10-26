# RoboMotion AI v0.8.0 — Release acceptance checklist

**Scope:** web-based simulated robot ONLY. This document records *actions to test*; it is not a claim that webcam or GUI interactions were performed by the packaging environment.

## Evidence currently available
- Stage 7 user screenshot shows the diagnostics panel, tool positions, an event timeline and the guided-demo checklist rendered in Chrome.
- Stage 7 user Terminal screenshot shows TypeScript and Vite production build passing on the Mac (609 modules; build completed in about 2.44 s). These observations refer to **v0.7.0**, not the edited v0.8.0.
- Stage 7 inherited automated regression tests: 241/241 passed in this source environment before Stage 8 work began.
- Stage 8 tests/source parsing/release audit: see `STAGE_8_COMPLETION_REPORT.md` for **actually executed** results.

## Mac acceptance — check each item and record browser evidence

| ID | Action | Expected result | Status at source handoff |
|---|---|---|---|
| M01 | `npm install && npm test && npm run typecheck && npm run build` in extracted Stage 8 folder | All commands exit 0; no TypeScript errors | NOT VERIFIED on Mac for v0.8.0 |
| M02 | Run `npm run dev`, inspect console | No uncaught error, 3D canvas loads | NOT VERIFIED |
| M03 | Test all 6 sliders, Home/Upright/Inspect/Folded, Reset pose | Arm responds; limits enforced | NOT VERIFIED for v0.8.0 |
| M04 | Test orbit/zoom, preset isometric/front/top, Grid/Axes, Pause, Reset view | Scene controls continue to work | NOT VERIFIED for v0.8.0 |
| M05 | Toggle Focus arm / Wide scene on desktop and narrow viewport | Full arm and stations remain within usable frame | NOT VERIFIED |
| M06 | Select Demo point, Move to target | Computed FK target error converges; no claim of physical feedback | NOT VERIFIED for v0.8.0 |
| M07 | Try X=9, Y=2, Z=0 | Workspace rejection, no movement | NOT VERIFIED for v0.8.0 |
| M08 | Sample A source → grasp → Dock C → release | Sample docks, occupancy changes, counter increments | NOT VERIFIED for v0.8.0 |
| M09 | Attempt release far from dock or at occupied dock | Command rejected, sample stays held | NOT VERIFIED |
| M10 | Synthetic fixtures (open/fist/point/peace/pinch/no hand) | Correct labels; **cannot** command arm | NOT VERIFIED for v0.8.0 |
| M11 | Start camera, give permission, calibrate hand | 21 landmarks track, calibrated indicator appears | NOT VERIFIED for v0.8.0 |
| M12 | Arm live gestures, move palm, test fist/point | Bounded virtual motion/hold; no physical hardware | NOT VERIFIED for v0.8.0 |
| M13 | Manual slider override, hand loss, webcam Stop, emergency stop/reset | Drive disarms; reset does not auto-arm | NOT VERIFIED for v0.8.0 |
| M14 | Diagnostics event filter, clear, CSV and JSON export | Downloads contain enumerated events only; no images/landmarks | NOT VERIFIED |
| M15 | Guided 5-step demo, check/uncheck/restart/end | Bookkeeping only; no automatic camera start or robot motion | NOT VERIFIED for v0.8.0 |
| M16 | Browser responsive at ~390, 768, 1280 px; keyboard Tab/Enter/Space | Panels usable, controls reachable, visible focus | NOT VERIFIED |
| M17 | Reduced motion OS preference; browser reload / blocked webcam permissions | Usable fallbacks; no accidental arming | NOT VERIFIED |
| M18 | `npm run report:bundle` after successful build | `reports/bundle-report.json` generated; baseline compared cautiously | NOT VERIFIED for v0.8.0 |
| M19 | GitHub Pages manual Action after repo setup | Correct repository-path assets; camera only prompts on user action | NOT VERIFIED; no deployment performed |

**Acceptance standard:** mark final delivery “Mac-verified” only when M01–M18 pass with evidence. Mark “public deployment verified” only after M19. Any failed check is a defect to resolve, not a reason to silently skip the case.
