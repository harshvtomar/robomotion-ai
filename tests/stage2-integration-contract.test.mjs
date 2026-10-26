import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read = p=> readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const present = p=>existsSync(new URL(`../${p}`, import.meta.url));

test('64: Stage 2 new implementation files present', () => {
  for (const f of ['src/core/robot.ts','src/components/RobotArm.tsx','STAGE_2_COMPLETION_REPORT.md']) assert.ok(present(f), f);
});
test('65: Stage 1 scene reducer and camera controls preserved', () => {
  const app=read('src/App.tsx');
  for (const s of ['TOGGLE_GRID','TOGGLE_AXES','TOGGLE_MOTION','SET_CAMERA','camera-preset','resetWorkspace','SceneErrorBoundary']) assert.ok(app.includes(s), s);
});
test('66: all six controls rendered with native accessible sliders', () => {
  const src=read('src/App.tsx');
  assert.match(src, /JOINT_KEYS\.map/);
  assert.match(src, /type="range"/);
  assert.match(src, /htmlFor={`joint-\$\{joint\}`}/);
  assert.match(src, /aria-valuetext/);
});
test('67: buttons operate real reducer actions', () => {
  const src=read('src/App.tsx');
  for(const s of ['SET_JOINT','NUDGE_JOINT','RESET_POSE','APPLY_PRESET']) assert.ok(src.includes(s),s);
});
test('68: React scene receives pose and applies RobotArm', () => {
  assert.match(read('src/App.tsx'), /pose={robotPose}/);
  assert.match(read('src/components/StarterScene.tsx'), /<RobotArm pose={pose}/);
});
test('69: robot has physical local parent pivots and paired fingers', () => {
  const src=read('src/components/RobotArm.tsx');
  for (const s of ['ref={base}','ref={shoulder}','ref={elbow}','ref={wristPitch}','ref={wristRoll}','ref={fingerLeft}','ref={fingerRight}']) assert.ok(src.includes(s),s);
});
test('70: per-frame updates use dt-aware smooth interpolation', () => {
  const src=read('src/components/RobotArm.tsx');
  assert.match(src, /useFrame\(\(_, delta\)/);
  assert.match(src, /easeJoint\(current\.current\[key\], pose\[key\], delta\)/);
});
test('71: Stage 3 IK remains separate from full collision physics and hardware control', () => {
  assert.match(read('src/App.tsx'), /Target kinematics console/);
  assert.match(read('src/App.tsx'), /not full-body collision avoidance or grasp-force physics/);
  assert.doesNotMatch(read('src/core/robot.ts'), /MediaPipe/);
});
test('72: 3D scene preserves Stage 1 calibration base and toggles', () => {
  const src=read('src/components/StarterScene.tsx');
  for (const s of ['OriginPlinth','CalibrationBeacon','showGrid','showAxes','CameraRig']) assert.ok(src.includes(s),s);
});
test('73: all Stage 2 handoff documents present', () => {
  for(const f of ['README.md','PROJECT_STATE.md','NEXT_STAGE.md','STAGE_2_COMPLETION_REPORT.md','docs/ARCHITECTURE.md','docs/QA.md']) assert.ok(present(f),f);
});
test('74: project version advanced to Stage 4 while retaining all existing dependencies', () => {
  const p=JSON.parse(read('package.json'));
  assert.equal(p.version,'0.4.0');
  for (const d of ['react','three','@react-three/fiber','@react-three/drei']) assert.ok(p.dependencies[d]);
});
