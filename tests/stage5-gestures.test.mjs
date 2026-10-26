import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 analyseLandmarks,calibrate,calibratedOffset,stableGesture,syntheticHand,HAND_CONNECTIONS,GESTURE_NAMES,
} from '../src/vision/gestures.ts';
const all=['Open palm','Fist','Point','Peace','Pinch'];
for(const g of all) test(`S5 geometry classifies ${g}`,()=>{
 const points=syntheticHand(g);assert.equal(points.length,21);const result=analyseLandmarks(points);
 assert.equal(result.gesture,g);assert.ok(result.palmWidth>0.1);assert.ok(result.palmCenter.x>0);assert.equal(result.fingers.length,4);
});
test('S5 synthetic gestures remain valid with frame translation',()=>{
 for(const gesture of all){assert.equal(analyseLandmarks(syntheticHand(gesture,.13,-.15)).gesture,gesture);}
});
test('S5 rejects no hand and malformed frames',()=>{
 assert.equal(analyseLandmarks(null),null);assert.equal(analyseLandmarks([]),null);
 assert.equal(analyseLandmarks(syntheticHand('Open palm').slice(0,20)),null);
 assert.equal(analyseLandmarks(syntheticHand('Point').map((p,i)=>i===8?{...p,x:NaN}:p)),null);
});
test('S5 rejects collapsed palm geometry',()=>{
 const bad=Array.from({length:21},()=>({x:.5,y:.5}));assert.equal(analyseLandmarks(bad),null);
});
test('S5 stabilization needs a voting majority rather than one noisy frame',()=>{
 assert.equal(stableGesture(['Point']),'Unclassified');
 assert.equal(stableGesture(['Point','Point','Open palm','Point']),'Point');
 assert.equal(stableGesture(['Point','Fist','Point','Peace','Point']),'Point');
 assert.equal(stableGesture(['Point','Point','Point','No hand']),'No hand');
});
test('S5 no-hand reset wins even when prior frames were stable',()=>{
 assert.equal(stableGesture(['Fist','Fist','Fist','No hand']),'No hand');
 assert.equal(stableGesture([]),'No hand');
});
test('S5 ties below minimum are deliberately unclassified',()=>{
 assert.equal(stableGesture(['Point','Point','Peace','Peace']),'Unclassified');
});
test('S5 calibration demands six valid samples and no degenerate hand',()=>{
 assert.equal(calibrate([]),null);assert.equal(calibrate(Array(5).fill(syntheticHand('Open palm'))),null);
 const valid=Array.from({length:12},(_,i)=>syntheticHand('Open palm',i*.001,-i*.001));
 const c=calibrate(valid);assert.ok(c);assert.equal(c.samples,12);assert.ok(c.palmWidth>0);
});
test('S5 calibration offsets are normalized to palm scale',()=>{
 const fixed=syntheticHand('Peace');const calibration=calibrate(Array(12).fill(fixed));
 const raw=analyseLandmarks(fixed);const neutral=calibratedOffset(raw,calibration);
 assert.ok(Math.abs(neutral.x)<1e-12);assert.ok(Math.abs(neutral.y)<1e-12);assert.ok(Math.abs(neutral.scale-1)<1e-12);
 const shifted=analyseLandmarks(syntheticHand('Peace',.15,.07));
 const offset=calibratedOffset(shifted,calibration);assert.ok(offset.x>0.1);assert.ok(offset.y>0.1);
 assert.equal(calibratedOffset(raw,null),null);
});
test('S5 invalid calibration samples rejected',()=>{
 const a=Array(6).fill(Array.from({length:21},()=>({x:0,y:0})));
 assert.equal(calibrate(a),null);
});
test('S5 hand topology includes a valid 21 point graph',()=>{
 assert.equal(HAND_CONNECTIONS.length,21);for(const [a,b] of HAND_CONNECTIONS){assert.ok(a>=0&&b<=20&&a!==b);}
});
test('S5 declared labels contain expected offline fixtures',()=>{
 for(const gesture of [...all,'No hand','Unclassified'])assert.ok(GESTURE_NAMES.includes(gesture));
});
test('S5 new vision code is standalone and isolated from arm actuation',()=>{
 const src=readFileSync(new URL('../src/components/GestureLab.tsx',import.meta.url),'utf8');
 assert.match(src,/createHandTracker/);assert.match(src,/syntheticHand/);assert.match(src,/getUserMedia/);assert.match(src,/requestAnimationFrame/);
 assert.match(src,/track\.stop\(\)/);assert.match(src,/visibilitychange/);assert.match(src,/OBSERVATION ONLY/);
 assert.doesNotMatch(src,/(robotDispatch|dispatchManual|graspObject|releaseObject|planMotion)\s*\(/);
});
test('S5 adapter loads pinned WASM and the approved model only upon start',()=>{
 const src=readFileSync(new URL('../src/vision/mediapipe.ts',import.meta.url),'utf8');
 assert.match(src,/await import\('@mediapipe\/tasks-vision'\)/);assert.match(src,/1\.1\.1/);
 assert.match(src,/hand_landmarker\/hand_landmarker\/float16\/1\/hand_landmarker\.task/);
 assert.match(src,/detectForVideo/);assert.match(src,/detector\.close/);
});
test('S5 app links gesture lab without replacing the existing robot controls',()=>{
 const src=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
 for(const str of ['<GestureLab />','<RobotControls','<TargetControls','<ManipulationControls','05 / 08'])assert.ok(src.includes(str),str);
});
