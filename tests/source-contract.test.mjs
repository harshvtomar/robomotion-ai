import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(resolve(root, name), 'utf8');

test('19: main project deliverables exist', () => {
  for (const f of ['package.json', 'index.html', 'vite.config.ts', 'src/main.tsx', 'src/App.tsx', 'src/styles.css', 'src/components/StarterScene.tsx', 'src/core/stage1.ts', 'README.md', 'PROJECT_STATE.md', 'NEXT_STAGE.md', 'docs/ARCHITECTURE.md', 'docs/QA.md', 'STAGE_1_COMPLETION_REPORT.md']) assert.ok(existsSync(resolve(root, f)), `${f} missing`);
});
test('20: dependency families have compatible major versions', () => {
  const p = JSON.parse(read('package.json'));
  assert.match(p.dependencies.react, /19/);
  assert.match(p.dependencies['@react-three/fiber'], /9/);
  assert.match(p.dependencies['@react-three/drei'], /10/);
  assert.match(p.dependencies.three, /0\.18/);
});
test('21: scripts include actual dev, test and build commands', () => {
  const { scripts } = JSON.parse(read('package.json'));
  for (const key of ['dev', 'test', 'build', 'typecheck', 'typecheck:core', 'preflight']) assert.ok(scripts[key]);
});
test('22: application entry point is connected', () => {
  assert.match(read('index.html'), /src="\/src\/main\.tsx"/);
  assert.match(read('src/main.tsx'), /createRoot/);
});
test('23: interactive viewport uses real React Three Fiber canvas', () => {
  const source = read('src/components/StarterScene.tsx');
  assert.match(source, /from '@react-three\/fiber'/);
  assert.match(source, /<Canvas/);
  assert.match(source, /<OrbitControls/);
});
test('24: application exposes core toggles and camera selector', () => {
  const source = read('src/App.tsx');
  for (const v of ['TOGGLE_GRID', 'TOGGLE_AXES', 'TOGGLE_MOTION', 'SET_CAMERA', 'RESET', 'camera-preset']) assert.ok(source.includes(v), `${v} missing`);
});
test('25: Stage 3 preserves manual arm while clearly excluding collision physics', () => {
  assert.match(read('src/App.tsx'), /collision avoidance and real hardware control are not implemented/);
  assert.match(read('src/components/StarterScene.tsx'), /<RobotArm pose={pose}/);
});
test('26: repository does not commit dependencies', () => {
  assert.match(read('.gitignore'), /node_modules\//);
  assert.match(read('.gitignore'), /dist\//);
});
test('27: all user-facing navigation targets exist', () => {
  const source = read('src/App.tsx');
  for (const id of ['workspace', 'overview', 'build-roadmap']) assert.ok(source.includes(`id="${id}"`));
});
test('28: responsive layout and keyboard-focus indicators exist', () => {
  const css = read('src/styles.css');
  assert.match(css, /max-width: 760px/);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});
test('29: no user secrets are referenced', () => {
  const code = read('src/App.tsx') + read('src/components/StarterScene.tsx');
  assert.doesNotMatch(code, /api[_-]?key|access[_-]?token|password\s*=/i);
});
test('30: next-stage handoff preserves previous work and excludes Stage 7 implementation', () => {
  assert.match(read('NEXT_STAGE.md'), /Stage 7/);
  assert.match(read('NEXT_STAGE.md'), /Stage 6/);
  assert.match(read('NEXT_STAGE.md'), /not started/);
});
