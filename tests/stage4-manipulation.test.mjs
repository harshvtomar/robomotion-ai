import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {HOME_POSE} from '../src/core/robot.ts';
import {inverseKinematics,forwardKinematics,distance} from '../src/core/kinematics.ts';
import {
  createInitialManipulation, SOURCE_STATIONS, DROP_STATIONS, ALL_STATIONS,
  GRIP_CLOSED, GRIP_RELEASED, PICK_TOLERANCE, DOCK_TOLERANCE, checkTrajectory,
  graspObject, releaseObject, validatePlacement, objectById, heldObject,
} from '../src/core/manipulation.ts';
const solve = (point,seed=HOME_POSE)=>{
  const result=inverseKinematics(point,seed);
  assert.equal(result.ok,true,JSON.stringify(result));return result.pose;
};
const initial=()=>createInitialManipulation();
const pickup=(i=0)=>({ ...solve(SOURCE_STATIONS[i].position),gripper:GRIP_CLOSED });
const dock=(i=0,seed=HOME_POSE)=>solve(DROP_STATIONS[i].position,seed);

test('S4 initial scene has three distinct and separated samples, three reachable sources and docks',()=>{
 const state=initial();assert.equal(state.heldId,null);assert.equal(state.objects.length,3);assert.equal(state.placedCount,0);assert.equal(ALL_STATIONS.length,6);
 for(const st of ALL_STATIONS){const goal=solve(st.position);assert.ok(distance(forwardKinematics(goal),st.position)<0.015);}
 for(let i=0;i<state.objects.length;i++) for(let j=i+1;j<state.objects.length;j++) assert.ok(distance(state.objects[i].position,state.objects[j].position)>0.4);
});
test('S4 state reset creates fresh detached snapshots',()=>{
 let a=initial(),b=initial();assert.notStrictEqual(a,b);assert.notStrictEqual(a.objects,b.objects);a.objects[0].position.y=50;assert.notEqual(b.objects[0].position.y,50);
});
test('S4 lookup unknown sample never silently succeeds',()=>assert.equal(objectById(initial(),'absent'),null));
test('S4 an open gripper cannot grasp',()=>{
 const r=graspObject(initial(),'sample-1',{...pickup(),gripper:GRIP_RELEASED});assert.equal(r.ok,false);assert.match(r.reason,/Close gripper/);
});
test('S4 TCP must physically coincide with sample before grasp',()=>{
 const r=graspObject(initial(),'sample-1',{...HOME_POSE,gripper:GRIP_CLOSED});assert.equal(r.ok,false);assert.match(r.reason,/Move the tool/);
});
test('S4 invalid sample ID is rejected',()=>assert.equal(graspObject(initial(),'bad-id',pickup()).ok,false));
test('S4 grasp preserves object, locks only one sample, and rejects second grasp',()=>{
 const r=graspObject(initial(),'sample-1',pickup());assert.equal(r.ok,true);assert.equal(r.state.heldId,'sample-1');assert.equal(r.state.objects.length,3);assert.equal(heldObject(r.state)?.label,'Sample A');
 const second=graspObject(r.state,'sample-2',pickup(1));assert.equal(second.ok,false);assert.equal(second.state.heldId,'sample-1');
});
for(let i=0;i<3;i++) test(`S4 full successful pickup and matching docking ${i+1}`,()=>{
 const from=pickup(i);const held=graspObject(initial(),`sample-${i+1}`,from);assert.equal(held.ok,true);
 const to=dock(i,from);assert.equal(checkTrajectory(held.state,from,to).ok,true);
 const result=releaseObject(held.state,DROP_STATIONS[i].id,to);assert.equal(result.ok,true,JSON.stringify(result));
 assert.equal(result.state.heldId,null);assert.equal(result.state.placedCount,1);
 const moved=objectById(result.state,`sample-${i+1}`);assert.equal(moved.dockId,DROP_STATIONS[i].id);
 assert.deepEqual(moved.position,DROP_STATIONS[i].position);
});
test('S4 cannot release without any held item',()=>assert.equal(releaseObject(initial(),'dock-a',HOME_POSE).ok,false));
test('S4 cannot release to unknown dock',()=>{
 const state=graspObject(initial(),'sample-1',pickup()).state;
 assert.equal(releaseObject(state,'missing',pickup()).ok,false);
});
test('S4 release keeps item attached until tool arrives at dock',()=>{
 const state=graspObject(initial(),'sample-1',pickup()).state;
 const r=releaseObject(state,'dock-a',pickup());assert.equal(r.ok,false);assert.equal(r.state.heldId,'sample-1');
});
test('S4 occupied dock is rejected without dropping held sample',()=>{
 const a=graspObject(initial(),'sample-1',pickup());assert.equal(a.ok,true);
 const placed=releaseObject(a.state,'dock-a',dock());assert.equal(placed.ok,true);
 const b=graspObject(placed.state,'sample-2',pickup(1));assert.equal(b.ok,true);
 const result=releaseObject(b.state,'dock-a',dock(0,pickup(1)));
 assert.equal(result.ok,false);assert.match(result.reason,/occupied/);assert.equal(result.state.heldId,'sample-2');
});
test('S4 sample overlap is rejected',()=>{
 const state=graspObject(initial(),'sample-1',pickup()).state;
 assert.equal(validatePlacement(state,'sample-1',state.objects[1].position).ok,false);
});
test('S4 bound checks reject outside X, Z, and floor',()=>{
 const state=initial();for(const pos of [{x:5.5,y:3,z:0},{x:0,y:3,z:-5.5},{x:0,y:0.2,z:0},{x:NaN,y:2,z:0}]){
  assert.equal(validatePlacement(state,'sample-1',pos).ok,false);
 }
});
test('S4 trajectory to selected sample permits final approach but not unknown collisions',()=>{
 const state=initial();const target=solve(SOURCE_STATIONS[0].position);
 assert.equal(checkTrajectory(state,HOME_POSE,target,'sample-1').ok,true);
 assert.equal(checkTrajectory(state,HOME_POSE,target).ok,false);
});
test('S4 approaching exemption does not hide unrelated samples',()=>{
 const state=initial(),to=solve(SOURCE_STATIONS[1].position);
 assert.equal(checkTrajectory(state,HOME_POSE,to,'sample-1').ok,false);
});
test('S4 no exemption if destination is not selected sample',()=>{
 const state=initial(),to=solve(SOURCE_STATIONS[1].position);
 assert.equal(checkTrajectory(state,HOME_POSE,to,'sample-2').ok,true);
 assert.equal(checkTrajectory(state,HOME_POSE,to,'sample-1').ok,false);
});
test('S4 carried object clearance increases with radius',()=>{
 const state=graspObject(initial(),'sample-1',pickup()).state;
 assert.equal(checkTrajectory(state,pickup(),dock()).ok,true);
});
test('S4 invalid joint motion never gets a valid safety result',()=>{
 const state=initial();assert.equal(checkTrajectory(state,HOME_POSE,{...HOME_POSE,elbow:900}).ok,false);
});
test('S4 public tolerances are positive and release-opening is above closing threshold',()=>{
 assert.ok(PICK_TOLERANCE>0);assert.ok(DOCK_TOLERANCE>0);assert.ok(GRIP_RELEASED>GRIP_CLOSED);
});
test('S4 module does not mutate input state across grasp/release',()=>{
 const before=initial(),serialized=JSON.stringify(before);
 const grasp=graspObject(before,'sample-1',pickup());assert.equal(grasp.ok,true);
 releaseObject(grasp.state,'dock-a',dock());assert.equal(JSON.stringify(before),serialized);
});
test('S4 source provides wired 3D docking and gripper attachment instead of decorative buttons',()=>{
 const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
 const world=readFileSync(new URL('../src/components/StarterScene.tsx',import.meta.url),'utf8');
 const arm=readFileSync(new URL('../src/components/RobotArm.tsx',import.meta.url),'utf8');
 for(const str of ['graspObject(', 'releaseObject(', 'checkTrajectory(', '<ManipulationControls', 'objects={manipulation.objects}', 'onGrasp={graspSelected}', 'onRelease={releaseSelected}']) assert.ok(app.includes(str),str);
 assert.match(world,/<VirtualStations objects={objects} heldId={heldId}/);
 assert.match(arm,/<SampleMesh object={held}/);
});
test('S4 no Stage 5 gesture implementation slipped into source',()=>{
 const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(app,/MediaPipe|navigator\.mediaDevices|getUserMedia/);
});
