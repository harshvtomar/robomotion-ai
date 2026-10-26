# RoboMotion AI Stage 7 — Mac Acceptance Checklist

## Terminal

```bash
cd ~/Downloads
unzip RoboMotion_AI_Stage7_Engineering_Diagnostics.zip
cd robomotion-ai-stage7
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

If unzip asks to overwrite files from an older extraction, use a **new empty folder** or back up modifications before replacing anything. If previous Stage servers occupy ports, use Vite's exact reported local URL.

## Browser acceptance (Chrome)

- [ ] App heading reports v0.7.0 and development stage 07/08.
- [ ] Robot renders; Focus arm / Wide scene toggles framing without disappearing objects. Camera front/top/isometric presets, orbit, zoom and Reset view work.
- [ ] Six manual channels and pose presets remain functional. Joint values respect mechanical limits.
- [ ] Demo point reaches a valid FK target. Unreachable target is rejected without unsafe movement.
- [ ] Virtual object can be grasped and docked, with occupancy count updating; collisions and incorrect positions are blocked.
- [ ] Hand Gesture Lab tracks a live hand (21 landmarks); synthetic gestures work but cannot arm or move the robot.
- [ ] Live webcam open-palm calibration, explicit arming, bounded open-palm/point movement and fist hold work repeatedly.
- [ ] Removing the hand, stopping webcam or manual override disarms the controller. E-stop stays latched until manually reset.
- [ ] Diagnostics tool coordinates and controller status correspond to visible UI state; do not confuse command values with measured positions.
- [ ] Motion completion, manual override, blocked IK, stop/reset and docking appear in the event timeline.
- [ ] Filtering categories changes the visible event list; `Clear events` empties it; page reload clears the session.
- [ ] CSV and JSON downloads parse; confirm exports contain **no video frames, image blobs, landmarks, names or handedness**.
- [ ] Guided demo starts/restarts/ends and step checkboxes never move or arm the robot.
- [ ] Chrome Developer Tools Console shows no uncaught errors, even after changing camera mode or navigating between tabs.
- [ ] Browser narrow view is usable; keyboard focus and screen-reader labels work; reduced-motion preference is respected.

Record actual results and any screenshots or short videos in a local QA note. If problems remain, fix Stage 7 before starting Stage 8.
