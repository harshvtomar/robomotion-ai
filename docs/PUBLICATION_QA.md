# Publication QA — 26 October 2026

## Verified locally
- Source HEAD: a4c122d; nine original commits preserved; git fsck passed.
- Node 24.22.1, npm 11.9.0; npm ci and npm run verify passed.
- 261 tests passed, zero failures; TypeScript, Vite build and release audit passed.
- npm audit: zero known vulnerabilities. Pattern scan of 171 historical blobs found no common credential patterns; this is not proof of absence of every secret.
- No dependency/build/environment/report directories tracked. Ignore rules cover these paths.
- Largest JS: 952,670 bytes; four JS files total 1,395,599 bytes. Large-chunk warning retained.
- Webcam starts only on request; source cleanup stops tracks, clears the video source, cancels animation and closes the detector. Visibility loss stops capture. No physical actuator integration.
- MediaPipe 1.1.1 WASM loads from jsDelivr; hand model loads from Google storage. Third-party privacy and availability limitations remain documented.

## Verified publication
- Public repository: https://github.com/harshvtomar/robomotion-ai .
- Source import succeeded: https://github.com/harshvtomar/robomotion-ai/actions/runs/40305119946 . All nine original commits, including a4c122d, remain ancestors. No force push was used.
- Initial complete-source CI passed: https://github.com/harshvtomar/robomotion-ai/actions/runs/40305258562 . Commit 96f44805ecf73d3fe195e120b81fad5e2e9a509b; install, 261 tests, TypeScript, build, release audit, bundle report and artifact upload succeeded.
- Initial Pages build and deploy passed: https://github.com/harshvtomar/robomotion-ai/actions/runs/40305299581 . Same source commit; correct /robomotion-ai/ base path.
- Public HTTPS app opened: https://harshvtomar.github.io/robomotion-ai/ .
- The bootstrap import first failed because GITHUB_TOKEN could not create workflow files. Installing the identical reviewed workflows via the connected GitHub API resolved this. Two pre-import CI runs lacked application files and failed; these historical bootstrap failures are not hidden.
- Temporary import workflow and bundle transport were removed from the final working tree. The transport remains recoverable in Git history.

## Public browser QA
The cloud browser loaded the application shell and fallback, but its GPU/WebGL renderer is disabled. It cannot validate the 3D scene. Connected Chrome successfully rendered the actual public 3D arm; no localhost was used.

| Check | Observation |
|---|---|
| Desktop 1440 x 1000 | Renderer ready; real arm, station objects and controls visible; screenshot committed |
| Framing and camera | Focus arm / Wide scene toggle and Front camera preset responded |
| Manual channels | All six increment controls changed values; base keyboard ArrowRight changed 26 to 27 degrees |
| Pose preset | Inspect set base -40, shoulder -40, elbow 95, pitch -55, roll 38, gripper 100 |
| Reachable IK | Demo point completed with zero displayed target residual |
| Invalid IK | X=99 marked WORKSPACE; Move to target disabled |
| Virtual manipulation | Sample A grasped and released safely onto Dock C |
| Synthetic gestures | Open palm: 21/21 fixture landmarks; explicitly labelled synthetic |
| Arm gating | Synthetic observation rejected: only live webcam may arm |
| Emergency stop | E-stop disabled manual controls; reset returned DISABLED without rearming |
| Diagnostics | Timeline recorded motion completion, sample grasp/dock, arm rejection, stop/reset and trajectory rejection |
| Camera unavailable | Cloud Start webcam returned “No webcam found. Connect a camera or use Synthetic mode.” |
| Downloads | Browser automation stalled during download observation; completion not newly verified |

Camera-driven control is not newly verified in this session. No authentic video has been recorded. The committed script provides a 60–90-second sequence and recording checklist. Three.js logs a Clock deprecation warning; Vite emits the disclosed chunk warning. Hosted actions also warn that their older action runtimes are being run under Node 24. These warnings do not invalidate the passed checks and have not been suppressed.

## Owner-confirmed prior evidence
Seven final Mac/browser acceptance checks, including camera-driven simulation, were confirmed by the owner in the publication request. They have not been re-performed here. No authentic video has been recorded in this session.
