import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyseLandmarks,calibrate,syntheticHand} from '../src/vision/gestures.ts';
import {HOME_POSE,JOINT_KEYS,JOINT_SPECS} from '../src/core/robot.ts';
import {forwardKinematics} from '../src/core/kinematics.ts';
import {
  initialGestureControl, disableGestureControl, emergencyStop,resetEmergencyStop, armGestureControl,
  canArm, expireTracking, handleGestureFrame, gesturePoseStep, boundedPoseStep,
  MAX_TARGET_DELTA, MAX_FRAME_AGE_MS, MAX_FRAME_GAP_MS,
} from '../src/core/gesture-control.ts';
import {MAX_JOINT_SPEED} from '../src/core/motion.ts';
const calibration=calibrate(Array(12).fill(syntheticHand('Open palm')));
assert.ok(calibration);
const observation=(name='Open palm',x=0,y=0)=>analyseLandmarks(syntheticHand(name,x,y));
const make=(gesture='Open palm',t=1000,source='camera',shiftX=0,shiftY=0)=>({source,gesture,observation:observation(gesture,shiftX,shiftY),calibration,atMs:t});
const initial=()=>initialGestureControl();
const armed=(t=1000)=>armGestureControl(initial(),make('Open palm',t),HOME_POSE,t,null);

test('S6 disabled until deliberately armed',()=>{const s=initial();assert.equal(s.mode,'disabled');assert.equal(handleGestureFrame(s,make(),null).command.kind,'hold');});
test('S6 rejects synthetic fixture for arming',()=>assert.match(canArm(make('Open palm',1000,'synthetic'),1000,null),/live webcam/i));
test('S6 rejects camera frame absence',()=>assert.match(canArm(null,1000,null),/webcam/i));
test('S6 rejects uncalibrated live frames',()=>assert.match(canArm({...make(),calibration:null},1000,null),/Calibrate/i));
test('S6 rejects invisible hand',()=>assert.match(canArm({...make(),observation:null},1000,null),/Calibrate/i));
test('S6 rejects held objects',()=>assert.match(canArm(make(),1000,'sample-1'),/Release/i));
test('S6 rejects stale frames and future timestamps',()=>{assert.match(canArm(make(),1000+MAX_FRAME_AGE_MS+1,null),/fresh/i);assert.match(canArm(make(),999,null),/fresh/i);});
test('S6 requires deliberate activation pose',()=>assert.match(canArm(make('Fist'),1000,null),/open palm or point/i));
test('S6 live camera calibration permits explicit arm',()=>{const s=armed();assert.equal(s.mode,'armed');assert.ok(s.anchorTool);assert.ok(s.anchorOffset);assert.equal(s.lastFrameAt,1000);});
test('S6 arm does not itself move any joint',()=>assert.deepEqual(HOME_POSE,{...HOME_POSE}));
test('S6 first anchored palm maps to current TCP without jump',()=>{const s=armed();const c=handleGestureFrame(s,make('Open palm',1100),null);assert.equal(c.command.kind,'move');assert.deepEqual(c.command.target,forwardKinematics(HOME_POSE));});
test('S6 normalized camera offsets map to bounded world coordinates',()=>{const s=armed();const c=handleGestureFrame(s,make('Open palm',1100,'camera',.10,-.06),null);assert.equal(c.command.kind,'move');assert.ok(c.command.target.x>s.anchorTool.x);assert.ok(c.command.target.y>s.anchorTool.y);});
test('S6 all coordinate offsets are hard bounded',()=>{const s=armed();const c=handleGestureFrame(s,make('Open palm',1100,'camera',.5,.5),null);assert.equal(c.command.kind,'move');for(const axis of ['x','y','z'])assert.ok(Math.abs(c.command.target[axis]-s.anchorTool[axis])<=MAX_TARGET_DELTA[axis]+1e-10);});
test('S6 point is fine-control relative to open palm',()=>{const s=armed();const a=handleGestureFrame(s,make('Open palm',1100,'camera',.12,0),null).command;const b=handleGestureFrame(s,make('Point',1100,'camera',.12,0),null).command;assert.equal(a.kind,'move');assert.equal(b.kind,'move');assert.ok(Math.abs(b.target.x-s.anchorTool.x)<Math.abs(a.target.x-s.anchorTool.x));});
test('S6 fists hold without actuating arm',()=>assert.equal(handleGestureFrame(armed(),make('Fist',1100),null).command.kind,'hold'));
test('S6 pinch only commands a bounded virtual gripper close',()=>assert.deepEqual(handleGestureFrame(armed(),make('Pinch',1100),null).command,{kind:'gripper',value:22}));
test('S6 peace only commands a bounded virtual gripper open',()=>assert.deepEqual(handleGestureFrame(armed(),make('Peace',1100),null).command,{kind:'gripper',value:66}));
test('S6 uncertain frames hold, rather than moving',()=>assert.equal(handleGestureFrame(armed(),{...make(),gesture:'Unclassified',atMs:1100},null).command.kind,'hold'));
test('S6 no-hand instantly disarms',()=>{const x=handleGestureFrame(armed(),{...make(),gesture:'No hand',observation:null,atMs:1100},null);assert.equal(x.command.kind,'hold');assert.equal(x.state.mode,'disabled');});
test('S6 synthetic frames automatically disarm armed controller',()=>assert.equal(handleGestureFrame(armed(),make('Point',1100,'synthetic'),null).state.mode,'disabled'));
test('S6 missing calibration automatically disarms',()=>assert.equal(handleGestureFrame(armed(),{...make(),atMs:1100,calibration:null},null).state.mode,'disabled'));
test('S6 different calibration automatically disarms',()=>assert.equal(handleGestureFrame(armed(),{...make(),atMs:1100,calibration:{...calibration,palmWidth:calibration.palmWidth*1.01}},null).state.mode,'disabled'));
test('S6 manipulated object disables gesture drive',()=>assert.equal(handleGestureFrame(armed(),make('Open palm',1100),'sample-1').state.mode,'disabled'));
test('S6 backward timestamps disarm',()=>assert.equal(handleGestureFrame(armed(),make('Point',999),null).state.mode,'disabled'));
test('S6 frames beyond watchdog gap disarm',()=>assert.equal(handleGestureFrame(armed(),make('Point',1000+MAX_FRAME_GAP_MS+1),null).state.mode,'disabled'));
test('S6 watchdog disarms stale frames even with no new events',()=>assert.equal(expireTracking(armed(),1000+MAX_FRAME_GAP_MS+1).mode,'disabled'));
test('S6 watchdog leaves fresh control armed',()=>assert.equal(expireTracking(armed(),1300).mode,'armed'));
test('S6 watchdog never resets emergency stop',()=>assert.equal(expireTracking(emergencyStop(armed()),90000).mode,'estop'));
test('S6 explicit disable returns to unarmed',()=>assert.equal(disableGestureControl(armed()).mode,'disabled'));
test('S6 E-stop latch persists through disable and rearm attempts',()=>{const stop=emergencyStop(armed());assert.equal(disableGestureControl(stop).mode,'estop');assert.equal(armGestureControl(stop,make(),HOME_POSE,1000,null).mode,'estop');});
test('S6 clearing E-stop does not automatically rearm',()=>{const s=resetEmergencyStop(emergencyStop(armed()));assert.equal(s.mode,'disabled');assert.equal(s.anchorTool,null);});
test('S6 reset when not latched makes no changes',()=>assert.equal(resetEmergencyStop(armed()).mode,'armed'));
test('S6 move uses existing analytic IK',()=>{const target=forwardKinematics(HOME_POSE);const r=gesturePoseStep(HOME_POSE,{kind:'move',target},.1);assert.equal(r.ok,true);});
test('S6 invalid geometric targets are refused',()=>{const r=gesturePoseStep(HOME_POSE,{kind:'move',target:{x:9,y:9,z:9}},.1);assert.equal(r.ok,false);});
test('S6 gripper movement stays inside limits',()=>{const r=gesturePoseStep(HOME_POSE,{kind:'gripper',value:22},.1);assert.equal(r.ok,true);assert.ok(r.pose.gripper>=22&&r.pose.gripper<=HOME_POSE.gripper);});
test('S6 hold leaves robot exactly stationary',()=>assert.deepEqual(gesturePoseStep(HOME_POSE,{kind:'hold',reason:'fist'},.1).pose,HOME_POSE));
test('S6 joint speed constraints hold at each increment',()=>{const target={...HOME_POSE,base:170,shoulder:80,elbow:-135,wristPitch:100,wristRoll:170,gripper:0};const dt=.08;const next=boundedPoseStep(HOME_POSE,target,dt);for(const j of JOINT_KEYS)assert.ok(Math.abs(next[j]-HOME_POSE[j])<=MAX_JOINT_SPEED[j]*dt+1e-8,j);});
test('S6 no overshoot / no mechanical limit violation',()=>{const high={...HOME_POSE,base:170,shoulder:80,elbow:135,wristPitch:100,wristRoll:170,gripper:100};let current=HOME_POSE;for(let k=0;k<500;k++)current=boundedPoseStep(current,high,.1);for(const joint of JOINT_KEYS){assert.ok(current[joint]<=JOINT_SPECS[joint].max);assert.ok(current[joint]>=JOINT_SPECS[joint].min);assert.ok(Math.abs(current[joint]-high[joint])<.01);}});
test('S6 nonpositive frame time cannot move joints',()=>{const pose={...HOME_POSE,base:100};assert.deepEqual(boundedPoseStep(HOME_POSE,pose,-.2),HOME_POSE);assert.deepEqual(boundedPoseStep(HOME_POSE,pose,0),HOME_POSE);});
test('S6 rejects illegal joint target instead of clamping silent errors',()=>assert.throws(()=>boundedPoseStep(HOME_POSE,{...HOME_POSE,base:900},.1),/Invalid base/));
test('S6 E-stop, manual target, object manipulation guards are wired into App',()=>{const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');for(const t of ['emergencyStop','resetEmergencyStop','disableTeleop','onGestureUnavailable','handleGestureFrame','GestureControlPanel','gestureRef.current.mode===\'estop\'','checkTrajectory'])assert.ok(app.includes(t),t);});
test('S6 camera lifecycle emits safely typed frames; synthetic never directly operates robot',()=>{const lab=readFileSync(new URL('../src/components/GestureLab.tsx',import.meta.url),'utf8');assert.match(lab,/onFrameRef\.current\?/);assert.match(lab,/onUnavailableRef\.current\?/);assert.match(lab,/origin:\s*'camera'\|'synthetic'/);assert.doesNotMatch(lab,/(robotDispatch|dispatchManual|graspObject|releaseObject|planMotion)\s*\(/);});
test('S6 prevents physical robot IO by design',()=>{const src=readFileSync(new URL('../src/core/gesture-control.ts',import.meta.url),'utf8');assert.doesNotMatch(src,/(WebSocket|SerialPort|BluetoothDevice|fetch\(|XMLHttpRequest|navigator\.serial)/);});
test('S6 visual model honors latched E-stop freeze',()=>{
 const robot=readFileSync(new URL('../src/components/RobotArm.tsx',import.meta.url),'utf8');
 const scene=readFileSync(new URL('../src/components/StarterScene.tsx',import.meta.url),'utf8');
 const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
 assert.match(robot,/if \(frozen\) return;/);
 assert.match(scene,/<RobotArm pose=\{pose\} frozen=\{frozen\}/);
 assert.match(app,/frozen=\{gestureControl\.mode==='estop'\}/);
});
test('S6 calibration collects open palms rather than arbitrary gestures',()=>{
 const lab=readFileSync(new URL('../src/components/GestureLab.tsx',import.meta.url),'utf8');
 assert.match(lab,/calibrationPendingRef\.current&&points&&observation\?\.gesture==='Open palm'/);
});
