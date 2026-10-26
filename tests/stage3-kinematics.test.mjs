import test from 'node:test';
import assert from 'node:assert/strict';
import { HOME_POSE, JOINT_KEYS, JOINT_SPECS, POSE_PRESETS, robotReducer } from '../src/core/robot.ts';
import { forwardKinematics, inverseKinematics, distance, MAX_REACH, MAX_TOOL_HEIGHT, ROBOT_GEOMETRY, validPoint, formatMetres } from '../src/core/kinematics.ts';
import { planMotion, sampleMotion, MAX_JOINT_SPEED } from '../src/core/motion.ts';
const approx=(a,b,tol=0.015)=>assert.ok(Math.abs(a-b)<tol,`${a} vs ${b}`);
const assertPoseValid=p=>{for(const k of JOINT_KEYS){assert.ok(Number.isFinite(p[k]));assert.ok(p[k]>=JOINT_SPECS[k].min&&p[k]<=JOINT_SPECS[k].max)}};
const poses=[
  HOME_POSE,
  POSE_PRESETS.upright,
  { ...HOME_POSE,base:40,shoulder:-18,elbow:78,wristPitch:-60 },
  { ...HOME_POSE,base:-68,shoulder:25,elbow:-62,wristPitch:37 },
  { ...HOME_POSE,base:92,shoulder:32,elbow:42,wristPitch:-74 },
];
for(let i=0;i<poses.length;i++){
  test(`S3 FK/IK deterministic roundtrip fixture ${i+1}`,()=>{
    const seed=poses[i]; const tcp=forwardKinematics(seed); const result=inverseKinematics(tcp,seed);
    assert.equal(result.ok,true,JSON.stringify(result));
    assertPoseValid(result.pose);
    assert.ok(distance(forwardKinematics(result.pose),tcp)<=ROBOT_GEOMETRY.tolerance);
  });
}
test('S3 FK matches exact stage 2 vertical geometric hierarchy',()=>{
 const p=forwardKinematics(POSE_PRESETS.upright);approx(p.x,0,1e-12);approx(p.z,0,1e-12);approx(p.y,MAX_TOOL_HEIGHT,1e-12);
});
test('S3 home FK exact numeric regression',()=>{
 const p=forwardKinematics(HOME_POSE);approx(p.x,-0.042096187,1e-6);approx(p.y,3.620709531,1e-6);approx(p.z,0.019629774,1e-6);
});
test('S3 FK invariant to wrist roll',()=>{
 const p1=forwardKinematics(HOME_POSE),p2=forwardKinematics({...HOME_POSE,wristRoll:170});assert.deepEqual(p1,p2);
});
test('S3 FK invariant to gripper opening',()=>{
 const p1=forwardKinematics(HOME_POSE),p2=forwardKinematics({...HOME_POSE,gripper:0});assert.deepEqual(p1,p2);
});
test('S3 yaw rotation preserves total radial distance and height',()=>{
 const p=forwardKinematics(HOME_POSE);for(const yaw of [-140,-20,0,89,169]) { const q=forwardKinematics({...HOME_POSE,base:yaw});approx(Math.hypot(p.x,p.z),Math.hypot(q.x,q.z),1e-10);approx(p.y,q.y,1e-10); }
});
test('S3 finite targets accepted',()=>{assert.equal(validPoint({x:0,y:1,z:-2}),true)});
for(const axis of ['x','y','z']) for(const bad of [NaN,Infinity,-Infinity]){
 test(`S3 invalid ${axis} ${String(bad)} rejected`,()=>{
  const result=inverseKinematics({...forwardKinematics(HOME_POSE),[axis]:bad},HOME_POSE);
  assert.equal(result.ok,false);assert.equal(result.reason,'INVALID_INPUT');
 });
}
test('S3 invalid seed rejected',()=>{
  const result=inverseKinematics({x:0,y:2,z:0},{...HOME_POSE,shoulder:Infinity});assert.equal(result.ok,false);assert.equal(result.reason,'INVALID_INPUT');
});
test('S3 floor clearance rejection',()=>{const r=inverseKinematics({x:0,y:0,z:0},HOME_POSE);assert.equal(r.ok,false);assert.equal(r.reason,'WORKSPACE')});
test('S3 height ceiling rejection',()=>{const r=inverseKinematics({x:0,y:MAX_TOOL_HEIGHT+1,z:0},HOME_POSE);assert.equal(r.ok,false);assert.equal(r.reason,'WORKSPACE')});
test('S3 radial ceiling rejection',()=>{const r=inverseKinematics({x:MAX_REACH+1,y:2,z:0},HOME_POSE);assert.equal(r.ok,false);assert.equal(r.reason,'WORKSPACE')});
test('S3 inner geometry exclusion at shoulder center while upright',()=>{const r=inverseKinematics({x:0,y:ROBOT_GEOMETRY.shoulderHeight+ROBOT_GEOMETRY.toolExtension,z:0},HOME_POSE);assert.equal(r.ok,false);assert.equal(r.reason,'GEOMETRIC')});
test('S3 joint limit exclusion independent of rough workspace box',()=>{
 const target={x:0,y:0.6,z:0.2};const r=inverseKinematics(target,HOME_POSE);assert.equal(r.ok,false);assert.ok(['GEOMETRIC','JOINT_LIMITS'].includes(r.reason));
});
test('S3 solution does not mutate seed',()=>{const seed=Object.freeze({...HOME_POSE});const r=inverseKinematics(forwardKinematics(seed),seed);assert.equal(r.ok,true);assert.deepEqual(seed,HOME_POSE)});
test('S3 case-insensitive NaN formatting not propagated',()=>{assert.equal(formatMetres(NaN),'—');assert.equal(formatMetres(1.123456),'1.123')});
test('S3 roundtrip 240 varied feasible, upright-tool configurations',()=>{
 let total=0;
 for(let i=0;i<240;i++){
  const yaw=-148+(i*37)%297;
  const shoulder=-55+(i*11)%106;
  const elbow=-85+(i*19)%171;
  const wristPitch=-shoulder-elbow;
  if(Math.abs(wristPitch)>98) continue;
  const pose={...HOME_POSE,base:yaw,shoulder,elbow,wristPitch};
  const goal=forwardKinematics(pose);
  const result=inverseKinematics(goal,pose);
  // physical clearance envelope is enforced even if pose itself could put fingers near the floor
  if(goal.y<ROBOT_GEOMETRY.minToolHeight) continue;
  assert.equal(result.ok,true,JSON.stringify({i,pose,goal,result}));
  assert.ok(distance(forwardKinematics(result.pose),goal)<ROBOT_GEOMETRY.tolerance);
  assertPoseValid(result.pose);
  total++;
 }
 assert.ok(total>100,`only ${total} fixture cases`);
});
test('S3 bounded pose interpolation reducer accepts plan sample',()=>{
 const to={...HOME_POSE,base:125,shoulder:18,elbow:-80,wristPitch:50,gripper:70};
 const plan=planMotion(HOME_POSE,to);
 const pose=robotReducer(HOME_POSE,{type:'SET_POSE',pose:sampleMotion(plan,plan.durationSeconds/2)});
 assertPoseValid(pose);
});
test('S3 coordinated motion starts exactly at the initial pose',()=>{
 const plan=planMotion(HOME_POSE,POSE_PRESETS.inspect);assert.deepEqual(sampleMotion(plan,0),HOME_POSE)
});
test('S3 coordinated motion ends exactly at destination',()=>{
 const plan=planMotion(HOME_POSE,POSE_PRESETS.inspect);assert.deepEqual(sampleMotion(plan,plan.durationSeconds),POSE_PRESETS.inspect)
});
test('S3 coordinated motion clamps before/after interval',()=>{
 const plan=planMotion(HOME_POSE,POSE_PRESETS.inspect);assert.deepEqual(sampleMotion(plan,-10),HOME_POSE);assert.deepEqual(sampleMotion(plan,plan.durationSeconds+10),POSE_PRESETS.inspect)
});
test('S3 trajectory midpoint equals arithmetic midpoint',()=>{
 const to={...HOME_POSE,base:80};const plan=planMotion(HOME_POSE,to);approx(sampleMotion(plan,plan.durationSeconds/2).base,52.5,1e-8)
});
test('S3 trajectory components monotonic and within limits',()=>{
 const plan=planMotion(POSE_PRESETS.folded,POSE_PRESETS.inspect);let prev=sampleMotion(plan,0);
 for(let i=1;i<=150;i++){const next=sampleMotion(plan,plan.durationSeconds*i/150);assertPoseValid(next);for(const k of JOINT_KEYS){const delta=plan.to[k]-plan.from[k];assert.ok((next[k]-prev[k])*delta>=-1e-10)}prev=next}
});
test('S3 smoothstep has zero endpoint velocity numerically',()=>{
 const plan=planMotion(POSE_PRESETS.folded,POSE_PRESETS.inspect);const dt=.0001;
 const left=Math.abs(sampleMotion(plan,dt).base-sampleMotion(plan,0).base)/dt;
 const right=Math.abs(sampleMotion(plan,plan.durationSeconds).base-sampleMotion(plan,plan.durationSeconds-dt).base)/dt;
 assert.ok(left<0.1&&right<0.1)
});
test('S3 trajectory speed limits respected numerically',()=>{
 const plan=planMotion(POSE_PRESETS.folded,POSE_PRESETS.inspect);for(let i=1;i<=1000;i++){const a=sampleMotion(plan,plan.durationSeconds*(i-1)/1000);const b=sampleMotion(plan,plan.durationSeconds*i/1000);const dt=plan.durationSeconds/1000;for(const k of JOINT_KEYS)assert.ok(Math.abs((b[k]-a[k])/dt)<=MAX_JOINT_SPEED[k]+0.001)}});
test('S3 plan rejects NaN and out-of-range joint poses',()=>{
 assert.throws(()=>planMotion(HOME_POSE,{...HOME_POSE,elbow:Infinity}),/Non-finite/);
 assert.throws(()=>planMotion(HOME_POSE,{...HOME_POSE,elbow:200}),/joint limits/)
});
test('S3 sample rejects non-finite elapsed time',()=>{
 assert.throws(()=>sampleMotion(planMotion(HOME_POSE,POSE_PRESETS.home),NaN),/Invalid/)
});
test('S3 no mutation of trajectory inputs',()=>{
 const p=Object.freeze({...HOME_POSE}),q=Object.freeze({...POSE_PRESETS.folded});const plan=planMotion(p,q);sampleMotion(plan,.12);assert.deepEqual(p,HOME_POSE);assert.deepEqual(q,POSE_PRESETS.folded)
});
