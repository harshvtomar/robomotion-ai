import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_SCENE, CAMERA_PRESETS, DEVELOPMENT_STAGES, STAGE_NUMBER, STAGE_TOTAL, WORKSPACE, cameraDistance, sceneReducer } from '../src/core/stage1.ts';

const fresh = () => ({ ...INITIAL_SCENE });

test('01: Stage is first of eight stages', () => {
  assert.equal(STAGE_NUMBER, 1);
  assert.equal(STAGE_TOTAL, 8);
  assert.equal(DEVELOPMENT_STAGES.length, 8);
});
test('02: Stage sequence is unique and descriptive', () => {
  assert.equal(new Set(DEVELOPMENT_STAGES).size, 8);
  for (const name of DEVELOPMENT_STAGES) assert.ok(name.length > 10);
});
test('03: robotics features are deferred beyond Stage 1', () => {
  assert.match(DEVELOPMENT_STAGES[1], /Robotic Arm/);
  assert.match(DEVELOPMENT_STAGES[4], /Gesture/);
});
test('04: default state is nonmutating and frozen', () => {
  assert.ok(Object.isFrozen(INITIAL_SCENE));
  assert.deepEqual(INITIAL_SCENE, { camera: 'isometric', showGrid: true, showAxes: true, animateBeacon: true });
});
test('05: camera presets include top/front/isometric', () => {
  assert.deepEqual(Object.keys(CAMERA_PRESETS).sort(), ['front', 'isometric', 'top']);
});
test('06: camera positions are finite', () => {
  for (const position of Object.values(CAMERA_PRESETS)) {
    for (const v of Object.values(position)) assert.ok(Number.isFinite(v));
  }
});
test('07: camera starts beyond pedestal radius', () => {
  for (const key of Object.keys(CAMERA_PRESETS)) assert.ok(cameraDistance(key) > WORKSPACE.pedestalRadius * 2);
});
test('08: camera distance agrees with Euclidean length', () => {
  const p = CAMERA_PRESETS.front;
  assert.equal(cameraDistance('front'), Math.hypot(p.x, p.y, p.z));
});
test('09: selecting top preset changes only preset', () => {
  const start = fresh();
  const result = sceneReducer(start, { type: 'SET_CAMERA', preset: 'top' });
  assert.equal(result.camera, 'top');
  assert.equal(result.showGrid, true);
  assert.equal(start.camera, 'isometric');
});
test('10: switching grid is reversible', () => {
  const a = fresh();
  const b = sceneReducer(a, { type: 'TOGGLE_GRID' });
  const c = sceneReducer(b, { type: 'TOGGLE_GRID' });
  assert.equal(b.showGrid, false);
  assert.deepEqual(c, a);
});
test('11: switching coordinate axes is reversible', () => {
  const a = fresh();
  const b = sceneReducer(a, { type: 'TOGGLE_AXES' });
  assert.equal(b.showAxes, false);
  assert.equal(sceneReducer(b, { type: 'TOGGLE_AXES' }).showAxes, true);
});
test('12: pausing beacon is reversible', () => {
  const a = fresh();
  const b = sceneReducer(a, { type: 'TOGGLE_MOTION' });
  assert.equal(b.animateBeacon, false);
  assert.equal(sceneReducer(b, { type: 'TOGGLE_MOTION' }).animateBeacon, true);
});
test('13: reset restores defaults after combined edits', () => {
  let state = sceneReducer(fresh(), { type: 'SET_CAMERA', preset: 'top' });
  state = sceneReducer(state, { type: 'TOGGLE_GRID' });
  state = sceneReducer(state, { type: 'TOGGLE_AXES' });
  state = sceneReducer(state, { type: 'TOGGLE_MOTION' });
  assert.deepEqual(sceneReducer(state, { type: 'RESET' }), INITIAL_SCENE);
});
test('14: reducer never mutates its input', () => {
  const original = Object.freeze(fresh());
  assert.doesNotThrow(() => sceneReducer(original, { type: 'TOGGLE_GRID' }));
  assert.equal(original.showGrid, true);
});
test('15: reducer rejects invalid commands', () => {
  assert.throws(() => sceneReducer(fresh(), { type: 'INVALID' }), /Unknown scene action/);
});
test('16: workspace is symmetric, metric and has a sensible grid', () => {
  assert.equal(WORKSPACE.width, WORKSPACE.depth);
  assert.equal(WORKSPACE.unit, 'm');
  assert.equal(WORKSPACE.gridDivisions, 20);
  assert.ok(WORKSPACE.groundY < 0);
});
test('17: top camera is practically vertical', () => {
  const { x, y, z } = CAMERA_PRESETS.top;
  assert.ok(y > 10);
  assert.ok(Math.hypot(x, z) < 0.1);
});
test('18: immutable camera configurations', () => {
  assert.ok(Object.isFrozen(CAMERA_PRESETS));
  for (const pose of Object.values(CAMERA_PRESETS)) assert.ok(Object.isFrozen(pose));
});
