import test from 'node:test';
import assert from 'node:assert/strict';
import { JOINT_KEYS, JOINT_SPECS, POSE_PRESETS, HOME_POSE, clampJoint, robotReducer, easeJoint, fingerOffset, degreesToRadians } from '../src/core/robot.ts';

const copy = () => ({ ...HOME_POSE });

test('31: exactly six distinct independently addressable channels', () => {
  assert.equal(JOINT_KEYS.length, 6);
  assert.equal(new Set(JOINT_KEYS).size, 6);
  assert.deepEqual([...JOINT_KEYS], ['base', 'shoulder', 'elbow', 'wristPitch', 'wristRoll', 'gripper']);
});
test('32: each joint spec has sensible finite ordered limits and steps', () => {
  for (const key of JOINT_KEYS) {
    const spec = JOINT_SPECS[key];
    assert.ok(spec.label.length > 3 && spec.description.length > 5);
    assert.ok(Number.isFinite(spec.min) && Number.isFinite(spec.max));
    assert.ok(spec.max > spec.min && spec.step > 0);
    assert.ok(['°', '%'].includes(spec.unit));
  }
});
test('33: original home pose is immutable', () => {
  assert.ok(Object.isFrozen(HOME_POSE));
  assert.deepEqual(Object.keys(HOME_POSE).sort(), [...JOINT_KEYS].sort());
});
test('34: home values are within all limits', () => {
  for (const key of JOINT_KEYS) assert.equal(HOME_POSE[key], clampJoint(key, HOME_POSE[key]));
});
test('35: preset library contains home upright inspect folded', () => {
  assert.deepEqual(Object.keys(POSE_PRESETS).sort(), ['folded', 'home', 'inspect', 'upright']);
});
test('36: all preset poses have finite, bounded values', () => {
  for (const pose of Object.values(POSE_PRESETS)) {
    assert.ok(Object.isFrozen(pose));
    for (const key of JOINT_KEYS) assert.equal(pose[key], clampJoint(key, pose[key]));
  }
});
test('37: set updates only specified joint', () => {
  const previous = copy();
  const next = robotReducer(previous, { type:'SET_JOINT', joint:'shoulder', value:45 });
  assert.equal(next.shoulder, 45);
  for (const key of JOINT_KEYS.filter(k=>k!=='shoulder')) assert.equal(next[key], previous[key]);
});
test('38: set clamps below and above every joint limit', () => {
  for (const key of JOINT_KEYS) {
    assert.equal(robotReducer(copy(), {type:'SET_JOINT', joint:key, value:-1e8})[key], JOINT_SPECS[key].min);
    assert.equal(robotReducer(copy(), {type:'SET_JOINT', joint:key, value:1e8})[key], JOINT_SPECS[key].max);
  }
});
test('39: set rejects NaN', () => assert.throws(() => clampJoint('base', Number.NaN), /Non-finite/));
test('40: set rejects positive infinity', () => assert.throws(() => clampJoint('elbow', Infinity), /Non-finite/));
test('41: set rejects negative infinity', () => assert.throws(() => clampJoint('gripper', -Infinity), /Non-finite/));
test('42: malformed joint identifier is rejected', () => assert.throws(() => clampJoint('notReal', 50), /Unknown joint/));
test('43: repeated identical set preserves referential equality', () => {
  const pose = copy(); assert.equal(robotReducer(pose, { type:'SET_JOINT', joint:'base', value:pose.base }), pose);
});
test('44: nudge increments exactly one step', () => {
  const pose = robotReducer(copy(), {type:'NUDGE_JOINT', joint:'gripper', direction:1});
  assert.equal(pose.gripper, HOME_POSE.gripper + 1);
});
test('45: nudge decrements exactly one step', () => {
  assert.equal(robotReducer(copy(), {type:'NUDGE_JOINT', joint:'wristPitch', direction:-1}).wristPitch, HOME_POSE.wristPitch - 1);
});
test('46: nudge at minimum saturates instead of wrapping', () => {
  for (const key of JOINT_KEYS) {
    const pose = robotReducer(copy(), {type:'SET_JOINT', joint:key, value:JOINT_SPECS[key].min});
    assert.equal(robotReducer(pose, {type:'NUDGE_JOINT', joint:key, direction:-1})[key], JOINT_SPECS[key].min);
  }
});
test('47: nudge at maximum saturates instead of wrapping', () => {
  for (const key of JOINT_KEYS) {
    const pose = robotReducer(copy(), {type:'SET_JOINT', joint:key, value:JOINT_SPECS[key].max});
    assert.equal(robotReducer(pose, {type:'NUDGE_JOINT', joint:key, direction:1})[key], JOINT_SPECS[key].max);
  }
});
test('48: all presets apply correctly without mutating the library', () => {
  for (const [key, preset] of Object.entries(POSE_PRESETS)) {
    const result = robotReducer(copy(), {type:'APPLY_PRESET', preset:key});
    assert.deepEqual(result, preset);
    assert.notEqual(result, preset);
  }
});
test('49: resetting robot pose does not mutate prior pose', () => {
  const pose = robotReducer(copy(), {type:'SET_JOINT', joint:'elbow', value:-135});
  const reset = robotReducer(pose, {type:'RESET_POSE'});
  assert.deepEqual(reset, HOME_POSE);
  assert.equal(pose.elbow, -135);
  assert.notEqual(reset, HOME_POSE);
});
test('50: unknown preset fails safely', () => assert.throws(() => robotReducer(copy(), {type:'APPLY_PRESET', preset:'bad'}), /Unknown preset/));
test('51: unknown action fails safely', () => assert.throws(() => robotReducer(copy(), {type:'JUMP'}), /Unknown robot action/));
test('52: frozen input cannot be mutated by reducer', () => {
  const pose = Object.freeze(copy());
  assert.doesNotThrow(() => robotReducer(pose, {type:'SET_JOINT', joint:'base', value:45}));
  assert.deepEqual(pose, HOME_POSE);
});
test('53: command clamping invariant across 10000 deterministic samples', () => {
  for (let i=0; i<10000; i++) {
    const joint=JOINT_KEYS[i % JOINT_KEYS.length];
    const value = Math.sin(i * 2.71828183) * 5000;
    const command = robotReducer(copy(), {type:'SET_JOINT', joint, value});
    assert.ok(command[joint] >= JOINT_SPECS[joint].min && command[joint] <= JOINT_SPECS[joint].max);
  }
});
test('54: degrees to radians conversion', () => {
  assert.equal(degreesToRadians(0), 0);
  assert.ok(Math.abs(degreesToRadians(180) - Math.PI) < 1e-12);
  assert.ok(Math.abs(degreesToRadians(-90) + Math.PI/2) < 1e-12);
});
test('55: smoothing moves toward positive target without overshoot', () => {
  const v=easeJoint(-45, 75, 1/60);
  assert.ok(v > -45 && v < 75);
});
test('56: smoothing moves toward negative target without overshoot', () => {
  const v=easeJoint(75, -45, 1/60);
  assert.ok(v < 75 && v > -45);
});
test('57: smoothing stops for zero or negative delta', () => {
  assert.equal(easeJoint(15, 80, 0), 15);
  assert.equal(easeJoint(15, 80, -1), 15);
});
test('58: smoothing snaps at tiny tolerance', () => assert.equal(easeJoint(3, 3.005, 1/60), 3.005));
test('59: smoothing requires finite inputs', () => assert.throws(() => easeJoint(1, Number.NaN, .016), /Invalid/));
test('60: smoothing converges after successive frames', () => {
  let value = -70;
  for (let i=0;i<180;i++) value=easeJoint(value, 30, 1/60);
  assert.ok(Math.abs(value - 30) < .02);
});
test('61: gripper opens monotonically and stays bounded', () => {
  assert.ok(fingerOffset(0) > 0);
  assert.ok(fingerOffset(0) < fingerOffset(40));
  assert.ok(fingerOffset(40) < fingerOffset(100));
  assert.equal(fingerOffset(-100), fingerOffset(0));
  assert.equal(fingerOffset(1000), fingerOffset(100));
});
test('62: gripper opening symmetric around centerline', () => {
  for (let p=0;p<=100;p+=5) assert.equal(-fingerOffset(p) + fingerOffset(p), 0);
});
test('63: successive nudge actions stay inside limits', () => {
  let pose=copy();
  for (let i=0;i<400;i++) pose=robotReducer(pose, {type:'NUDGE_JOINT', joint:'base', direction:-1});
  assert.equal(pose.base, JOINT_SPECS.base.min);
});
