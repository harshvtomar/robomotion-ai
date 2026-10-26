/** Stage 4 discrete virtual grasp/placement simulation.
 * NOT rigid-body physics, torque, continuous full-link collision, or hardware control.
 * Positions are metres in Stage 3's right-handed Y-up world.
 */
import { forwardKinematics, distance, validPoint } from './kinematics.ts';
import type { Vector3 } from './kinematics.ts';
import { planMotion, sampleMotion } from './motion.ts';
import type { RobotPose } from './robot.ts';
import { HOME_POSE } from './robot.ts';

export type ObjectShape = 'box' | 'sphere' | 'octahedron';
export interface VirtualObject {
  id: string;
  label: string;
  color: string;
  shape: ObjectShape;
  radius: number;
  position: Vector3;
  dockId: string | null;
}
export interface Station { id: string; label: string; position: Vector3; color: string; kind: 'source' | 'dock' }
export type ManipulationState = { objects: VirtualObject[]; heldId: string | null; placedCount: number };
export type ActionResult = { ok: true; state: ManipulationState; message: string } | { ok: false; state: ManipulationState; reason: string };
export type SafetyResult = { ok: true } | { ok: false; reason: string };

export const PICK_TOLERANCE = 0.19;
export const DOCK_TOLERANCE = 0.19;
export const GRIP_CLOSED = 22;
export const GRIP_RELEASED = 66;
export const TOOL_COLLISION_RADIUS = 0.075;
export const OBJECT_CLEARANCE = 0.025;
export const STATION_RADIUS = 0.23;
export const MAX_HORIZONTAL_POSITION = 5;
export const MIN_OBJECT_HEIGHT = 0.45;

const posePoint = (base:number, shoulder:number, elbow:number):Vector3 => forwardKinematics({
  ...HOME_POSE, base, shoulder, elbow, wristPitch:-shoulder-elbow, wristRoll:0,
});

export const SOURCE_STATIONS: ReadonlyArray<Station> = Object.freeze([
  { id:'src-a',label:'Pickup A',position:posePoint(-70,-15,70),color:'#f3a76f',kind:'source' },
  { id:'src-b',label:'Pickup B',position:posePoint(0,0,60),color:'#88d8e6',kind:'source' },
  { id:'src-c',label:'Pickup C',position:posePoint(70,-15,70),color:'#d7b0ff',kind:'source' },
]);
export const DROP_STATIONS: ReadonlyArray<Station> = Object.freeze([
  { id:'dock-a',label:'Dock A',position:posePoint(-118,20,40),color:'#f3a76f',kind:'dock' },
  { id:'dock-b',label:'Dock B',position:posePoint(0,20,40),color:'#88d8e6',kind:'dock' },
  { id:'dock-c',label:'Dock C',position:posePoint(118,20,40),color:'#d7b0ff',kind:'dock' },
]);
export const ALL_STATIONS: ReadonlyArray<Station> = [...SOURCE_STATIONS,...DROP_STATIONS];

export function createInitialManipulation():ManipulationState {
  const shapes:ObjectShape[]=['box','sphere','octahedron'];
  return { heldId:null, placedCount:0, objects:SOURCE_STATIONS.map((station,i)=>({
    id:`sample-${i+1}`, label:`Sample ${String.fromCharCode(65+i)}`, color:station.color,
    shape:shapes[i]!, radius:0.13, position:{...station.position},dockId:null,
  })) };
}
export function heldObject(state:ManipulationState):VirtualObject | null { return state.objects.find(o=>o.id===state.heldId)??null; }
export function objectById(state:ManipulationState,id:string):VirtualObject|null { return state.objects.find(o=>o.id===id)??null; }
export function dockById(id:string):Station|null {return DROP_STATIONS.find(d=>d.id===id)??null;}

function inWorkspace(p:Vector3, radius:number):boolean {
  return validPoint(p) && Math.abs(p.x)+radius<=MAX_HORIZONTAL_POSITION && Math.abs(p.z)+radius<=MAX_HORIZONTAL_POSITION && p.y-radius>=MIN_OBJECT_HEIGHT;
}
/** Rejects overlapping virtual object bounding spheres and out-of-bounds placement. */
export function validatePlacement(state:ManipulationState, objectId:string, p:Vector3):SafetyResult {
  const object=objectById(state,objectId);
  if(!object) return {ok:false,reason:'Unknown object.'};
  if(!inWorkspace(p,object.radius)) return {ok:false,reason:'Object would leave the supported workspace or floor clearance.'};
  for(const other of state.objects){
    if(other.id===objectId || other.id===state.heldId) continue;
    if(distance(p,other.position) < object.radius+other.radius+OBJECT_CLEARANCE)
      return {ok:false,reason:`Placement would overlap ${other.label}.`};
  }
  return {ok:true};
}
/** Object locks to the simulated TCP; requires physical proximity AND closed gripper. */
export function graspObject(state:ManipulationState,objectId:string,pose:RobotPose):ActionResult {
  if(state.heldId) return {ok:false,state,reason:'Release the held object before grasping another.'};
  const object=objectById(state,objectId);
  if(!object) return {ok:false,state,reason:'Select an existing sample.'};
  if(pose.gripper>GRIP_CLOSED) return {ok:false,state,reason:`Close gripper to ${GRIP_CLOSED}% or less before grasping.`};
  if(distance(forwardKinematics(pose),object.position)>PICK_TOLERANCE)
    return {ok:false,state,reason:`Move the tool to ${object.label} first (within ${PICK_TOLERANCE} m).`};
  return {ok:true,state:{...state,heldId:objectId},message:`${object.label} secured to the virtual gripper.`};
}
/** Supports stable docking only: rejects empty-space drops, occupied docks, and overlaps. */
export function releaseObject(state:ManipulationState,dockId:string,pose:RobotPose):ActionResult {
  if(!state.heldId) return {ok:false,state,reason:'The gripper is not carrying an object.'};
  const dock=dockById(dockId);
  if(!dock) return {ok:false,state,reason:'Select a valid destination dock.'};
  if(distance(forwardKinematics(pose),dock.position)>DOCK_TOLERANCE)
    return {ok:false,state,reason:`Move the gripper to ${dock.label} before releasing.`};
  const existing=state.objects.find(o=>o.id!==state.heldId && o.dockId===dock.id);
  if(existing) return {ok:false,state,reason:`${dock.label} is occupied by ${existing.label}.`};
  const valid=validatePlacement(state,state.heldId,dock.position);
  if(!valid.ok) return {ok:false,state,reason:valid.reason};
  const held=heldObject(state)!;
  return {ok:true, state:{...state,heldId:null,placedCount:state.placedCount+1,
    objects:state.objects.map(o=>o.id===held.id ? {...o,position:{...dock.position},dockId:dock.id}:o)},
    message:`${held.label} released safely onto ${dock.label}.`};
}
/** Short swept-point collision test (TCP + carried-object sphere) against other samples.
 * This intentionally does not model link self-collision, support-column collision, or rigid-body dynamics.
 */
export function checkTrajectory(state:ManipulationState,from:RobotPose,to:RobotPose,approachingId:string|null=null):SafetyResult {
  let plan;
  try { plan=planMotion(from,to); } catch(e){ return {ok:false,reason:`Invalid motion: ${String(e)}`}; }
  const carried=heldObject(state);
  const effectiveRadius=(carried?.radius??0)+TOOL_COLLISION_RADIUS;
  const steps=Math.max(24,Math.ceil(plan.durationSeconds*20));
  for(let i=0;i<=steps;i++){
    const p=forwardKinematics(sampleMotion(plan,plan.durationSeconds*i/steps));
    if(!inWorkspace(p,carried?.radius??0)) return {ok:false,reason:'Motion would cross a workspace boundary or floor clearance.'};
    for(const object of state.objects){
      if(object.id===state.heldId) continue;
      // An explicit pickup approach is allowed to touch the chosen sample only at the endpoint.
      if(object.id===approachingId && distance(forwardKinematics(to),object.position)<=PICK_TOLERANCE && i/steps>=0.5) continue;
      const margin=effectiveRadius+object.radius+OBJECT_CLEARANCE;
      if(distance(p,object.position)<margin)
        return {ok:false,reason:`Potential tool/object collision with ${object.label}.`};
    }
  }
  return {ok:true};
}
