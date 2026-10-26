/** Stage 6: pure, browser-independent safety gate for a SIMULATED robot only.
 * A camera observation never directly commands hardware, grasp actions or physics.
 * No movement can occur until an operator arms a calibrated LIVE stream.
 */
import { forwardKinematics, inverseKinematics, validPoint } from './kinematics.ts';
import type { Vector3 } from './kinematics.ts';
import { JOINT_KEYS, JOINT_SPECS } from './robot.ts';
import type { RobotPose } from './robot.ts';
import { MAX_JOINT_SPEED } from './motion.ts';
import { calibratedOffset } from '../vision/gestures.ts';
import type { Calibration, GestureName, HandObservation } from '../vision/gestures.ts';

export type GestureSource = 'camera' | 'synthetic' | 'idle';
export interface GestureFrame {
  source: GestureSource;
  gesture: GestureName;
  observation: HandObservation | null;
  calibration: Calibration | null;
  atMs: number;
}
export type ControlMode = 'disabled' | 'armed' | 'estop';
export interface GestureControlState {
  mode: ControlMode;
  reason: string;
  anchorTool: Vector3 | null;
  anchorOffset: Readonly<{x: number;y: number;scale: number}> | null;
  anchorCalibration: Calibration | null;
  lastFrameAt: number | null;
  lastCommandAt: number | null;
}
export type ControlCommand =
  | { kind: 'hold'; reason: string }
  | { kind: 'move'; target: Vector3 }
  | { kind: 'gripper'; value: number };
export interface ControlUpdate { state: GestureControlState; command: ControlCommand }
export const MAX_FRAME_AGE_MS = 600;
export const MAX_FRAME_GAP_MS = 650;
export const MAX_TARGET_DELTA = Object.freeze({x:0.42,y:0.40,z:0.30});
export const CAMERA_GAIN = Object.freeze({x:0.67,y:0.67,z:0.50});
const CLIP=(v:number,lim:number)=>Math.max(-lim,Math.min(lim,v));

export const initialGestureControl = ():GestureControlState=>({
  mode:'disabled',reason:'Gesture control disabled. Start the webcam, calibrate, then arm.',
  anchorTool:null,anchorOffset:null,anchorCalibration:null,lastFrameAt:null,lastCommandAt:null,
});
export function disableGestureControl(_state:GestureControlState,reason='Gesture control disabled by operator.'):GestureControlState {
  if(_state.mode==='estop') return _state;
  return {...initialGestureControl(),reason};
}
export function emergencyStop(_state:GestureControlState):GestureControlState {
  return {...initialGestureControl(),mode:'estop',reason:'EMERGENCY STOP LATCHED. Reset stop before any robot motion.'};
}
export function resetEmergencyStop(state:GestureControlState):GestureControlState {
  return state.mode==='estop' ? {...initialGestureControl(),reason:'Emergency stop cleared. Motion stays disabled until manually enabled.'} : state;
}
function calibrationMatches(a:Calibration,b:Calibration):boolean {
  return a.palmWidth===b.palmWidth && a.center.x===b.center.x && a.center.y===b.center.y && a.samples===b.samples;
}
export function canArm(frame:GestureFrame | null,nowMs:number,heldId:string|null):string|null {
  if(heldId) return 'Release your virtual sample using manual controls before enabling gesture motion.';
  if(!frame || frame.source!=='camera') return 'Only a live webcam (never synthetic fixtures) may arm the virtual robot.';
  if(!Number.isFinite(nowMs) || !Number.isFinite(frame.atMs) || nowMs-frame.atMs<0 || nowMs-frame.atMs>MAX_FRAME_AGE_MS)
    return 'A fresh live camera frame is required to arm.';
  if(!frame.calibration || !frame.observation) return 'Calibrate a visible live hand before arming.';
  if(frame.gesture!=='Open palm' && frame.gesture!=='Point') return 'Hold an open palm or point gesture steadily before arming.';
  const offset=calibratedOffset(frame.observation,frame.calibration);
  if(!offset || !Object.values(offset).every(Number.isFinite)) return 'Invalid live calibration.';
  return null;
}
export function armGestureControl(state:GestureControlState,frame:GestureFrame|null,pose:RobotPose,nowMs:number,heldId:string|null):GestureControlState {
  if(state.mode==='estop') return state;
  const rejection=canArm(frame,nowMs,heldId);
  if(rejection) return disableGestureControl(state,rejection);
  const f=frame!; const offset=calibratedOffset(f.observation!,f.calibration!)!;
  return {
    mode:'armed',reason:'Armed · move an open palm or pointed hand slowly. Fist holds; Pinch closes; Peace opens the virtual gripper.',
    anchorTool:{...forwardKinematics(pose)},anchorOffset:{...offset},anchorCalibration:f.calibration,
    lastFrameAt:f.atMs,lastCommandAt:nowMs,
  };
}
export function expireTracking(state:GestureControlState,nowMs:number):GestureControlState {
  if(state.mode!=='armed') return state;
  if(!Number.isFinite(nowMs) || state.lastFrameAt===null || nowMs-state.lastFrameAt>MAX_FRAME_GAP_MS || nowMs<state.lastFrameAt)
    return disableGestureControl(state,'Tracking stale: control automatically disarmed.');
  return state;
}
export function handleGestureFrame(state:GestureControlState,frame:GestureFrame,heldId:string|null):ControlUpdate {
  if(state.mode!=='armed') return {state,command:{kind:'hold',reason:'Control is not armed.'}};
  if(frame.source!=='camera') return {state:disableGestureControl(state,'Synthetic mode or camera stopped: disarmed.'),command:{kind:'hold',reason:'Non-live input blocked.'}};
  if(!Number.isFinite(frame.atMs) || state.lastFrameAt===null || frame.atMs<state.lastFrameAt || frame.atMs-state.lastFrameAt>MAX_FRAME_GAP_MS)
    return {state:disableGestureControl(state,'Frame gap or timestamp error: disarmed.'),command:{kind:'hold',reason:'Tracking stale.'}};
  if(heldId) return {state:disableGestureControl(state,'A sample is being held: disarmed to prevent unsafe release.'),command:{kind:'hold',reason:'Object held.'}};
  if(!frame.observation || frame.gesture==='No hand') return {state:disableGestureControl(state,'Hand lost: control automatically disarmed.'),command:{kind:'hold',reason:'Hand lost.'}};
  if(!state.anchorCalibration || !frame.calibration || !calibrationMatches(state.anchorCalibration,frame.calibration))
    return {state:disableGestureControl(state,'Calibration changed or disappeared: disarmed.'),command:{kind:'hold',reason:'Calibration changed.'}};
  const fresh={...state,lastFrameAt:frame.atMs};
  if(frame.gesture==='Fist') return {state:{...fresh,reason:'Fist: hold position.'},command:{kind:'hold',reason:'Fist hold.'}};
  if(frame.gesture==='Peace') return {state:{...fresh,reason:'Peace: open virtual gripper.'},command:{kind:'gripper',value:66}};
  if(frame.gesture==='Pinch') return {state:{...fresh,reason:'Pinch: close virtual gripper (no automatic grasp).'},command:{kind:'gripper',value:22}};
  if(frame.gesture!=='Point' && frame.gesture!=='Open palm') return {state:{...fresh,reason:'Gesture uncertain: holding.'},command:{kind:'hold',reason:'Unclassified gesture.'}};
  const now=calibratedOffset(frame.observation,frame.calibration);
  const at=state.anchorOffset,origin=state.anchorTool;
  if(!now || !at || !origin || !Object.values(now).every(Number.isFinite))
    return {state:disableGestureControl(state,'Invalid hand geometry: disarmed.'),command:{kind:'hold',reason:'Invalid geometry.'}};
  const fine=frame.gesture==='Point'?0.45:1;
  const target={
    x:origin.x+CLIP((now.x-at.x)*CAMERA_GAIN.x*fine,MAX_TARGET_DELTA.x),
    y:origin.y+CLIP(-(now.y-at.y)*CAMERA_GAIN.y*fine,MAX_TARGET_DELTA.y),
    z:origin.z+CLIP((now.scale-at.scale)*CAMERA_GAIN.z*fine,MAX_TARGET_DELTA.z),
  };
  if(!validPoint(target)) return {state:disableGestureControl(state,'Invalid gesture target: disarmed.'),command:{kind:'hold',reason:'Invalid target.'}};
  return {state:{...fresh,reason:`${frame.gesture}: bounded simulated target control.`},command:{kind:'move',target}};
}
/** Speed-constrained incremental motion. Not a dynamics or full-link collision simulator. */
export function boundedPoseStep(current:RobotPose,target:RobotPose,elapsedSeconds:number):RobotPose {
  if(!Number.isFinite(elapsedSeconds) || elapsedSeconds<=0) return {...current};
  const dt=Math.min(elapsedSeconds,0.15);
  return Object.fromEntries(JOINT_KEYS.map(j=>{
    const a=current[j],b=target[j],spec=JOINT_SPECS[j];
    if(!Number.isFinite(a)||!Number.isFinite(b)||b<spec.min||b>spec.max) throw new Error(`Invalid ${j} target`);
    // 0.3 s filter plus independent speed limiting: no instantaneous joint jumps.
    const alpha=1-Math.exp(-dt/0.30);
    const delta=CLIP((b-a)*alpha,MAX_JOINT_SPEED[j]*dt);
    return [j,Math.max(spec.min,Math.min(spec.max,a+delta))];
  })) as RobotPose;
}
export function gesturePoseStep(current:RobotPose,command:ControlCommand,elapsedSeconds:number):{ok:true;pose:RobotPose}|{ok:false;reason:string} {
  if(command.kind==='hold') return {ok:true,pose:current};
  if(command.kind==='gripper') return {ok:true,pose:boundedPoseStep(current,{...current,gripper:command.value},elapsedSeconds)};
  const ik=inverseKinematics(command.target,current);
  if(!ik.ok) return {ok:false,reason:`IK rejected target: ${ik.message}`};
  return {ok:true,pose:boundedPoseStep(current,ik.pose,elapsedSeconds)};
}
