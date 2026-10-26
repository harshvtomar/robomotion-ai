# RoboMotion AI — recruiter demo script (60–90 seconds)

**Goal:** Demonstrate engineering reasoning, not present the simulation as physical hardware.

**0–10 s · Hook.** Show the dark engineering workspace and the articulated virtual robotic arm. Say: “I built a browser-based robotic arm digital twin that combines mechanical joint limits, inverse kinematics and real-time gesture input.”

**10–25 s · Mechanical operation.** Use a manual joint slider, choose the Inspect preset and rotate the camera to show the geometry. Highlight six user-controlled channels and reversible camera framing.

**25–40 s · Kinematics.** Pick Demo point; move the end-effector to it and display computed X/Y/Z and target residual. Enter one unreachable coordinate to show rejection.

**40–55 s · Object handling.** Load Sample A pickup coordinates, reach/grasp, load Dock C, reach/release, and confirm counter increments. Make clear objects are simulated and collision coverage is partial.

**55–75 s · Hand tracking.** Start webcam by clicking, show landmarks, calibrate, opt in to gesture drive, and move one small amount with an open palm. Show fist hold or Stop. If webcam permissions/model download fail, use prerecorded authentic video rather than passing off synthetic fixtures as live.

**75–90 s · Engineering evidence.** Open Diagnostics and explain safety events, bounded movement, session-only exports, and the retained automated tests. End with what you learned and a concrete limitation: physical actuation, certified collision avoidance and reliable grasp forces are NOT implemented.

## Recording checklist

Record on your Mac using an ordinary screen recorder after consent and webcam framing checks; do not include third-party notifications, personal documents, raw private data, or unverified performance claims. Use a clean browser window, crop to the app, capture actual outcomes, then link a real demo video when ready. This package contains **no recorded video**.

## Publication recording checklist

- Open the verified HTTPS demo in a clean window; keep camera off until the live-camera segment.
- Capture the real workspace, manual joint changes, reachable/invalid IK, one successful docking, emergency-stop/reset, and a diagnostic export.
- If no real camera is available, label the gesture bench **synthetic fixture** and explain that it cannot command the arm; omit claims of live detection.
- Keep the complete recording between 60 and 90 seconds. An edited sequence may shorten waiting, but must not imply an unperformed result.
- Review for notifications/private data, then publish the genuine video and add its verified URL. No video upload is claimed by this document.
