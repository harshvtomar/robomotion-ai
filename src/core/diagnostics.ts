/** Stage 7 privacy-safe, session-local engineering telemetry.
 * Only enumerated simulator events, non-identifying labels and optional numeric measurements.
 * Never accepts webcam frames, landmarks, names, facial/biometric data or network transport.
 */
export type DiagnosticKind = 'system'|'camera'|'gesture'|'control'|'motion'|'safety'|'object';
export type DiagnosticCode =
  | 'SESSION_STARTED'|'CAMERA_AVAILABLE'|'CAMERA_UNAVAILABLE'|'GESTURE_CHANGED'
  | 'CONTROL_ARMED'|'CONTROL_ARM_REJECTED'|'CONTROL_DISABLED'|'CONTROL_STOPPED'|'STOP_RESET'|'TRACKING_LOST'
  | 'MANUAL_OVERRIDE'|'GESTURE_TARGET_REJECTED'|'TRAJECTORY_REJECTED'|'TARGET_REJECTED'
  | 'TARGET_STARTED'|'TARGET_REACHED'|'TARGET_CANCELLED'|'GESTURE_GRIPPER'
  | 'SAMPLE_GRASPED'|'SAMPLE_DOCKED'|'SAMPLE_REJECTED'|'OBJECTS_RESET';
export type DiagnosticEvent = Readonly<{
  id:number; at:number; kind:DiagnosticKind; code:DiagnosticCode; detail:string;
  durationMs?:number;
}>;
export type DiagnosticState = Readonly<{nextId:number; events:readonly DiagnosticEvent[]}>;
export const MAX_EVENTS = 240;
const EVENT_MAP:Readonly<Record<DiagnosticCode, DiagnosticKind>> = {
 SESSION_STARTED:'system',CAMERA_AVAILABLE:'camera',CAMERA_UNAVAILABLE:'camera',GESTURE_CHANGED:'gesture',
 CONTROL_ARMED:'control',CONTROL_ARM_REJECTED:'safety',CONTROL_DISABLED:'control',CONTROL_STOPPED:'safety',STOP_RESET:'control',TRACKING_LOST:'safety',
 MANUAL_OVERRIDE:'control',GESTURE_TARGET_REJECTED:'safety',TRAJECTORY_REJECTED:'safety',TARGET_REJECTED:'safety',
 TARGET_STARTED:'motion',TARGET_REACHED:'motion',TARGET_CANCELLED:'motion',GESTURE_GRIPPER:'gesture',
 SAMPLE_GRASPED:'object',SAMPLE_DOCKED:'object',SAMPLE_REJECTED:'safety',OBJECTS_RESET:'object',
};
/** Whitelist characters in diagnostics: camera geometry cannot be serialized here. */
export function cleanDetail(value:string):string {
 return value.replace(/[^\w\s.,:;()/%+\-°]/g,'').replace(/\s+/g,' ').trim().slice(0,100);
}
export function emptyDiagnostics():DiagnosticState { return {nextId:1,events:[]}; }
export function recordEvent(state:DiagnosticState,code:DiagnosticCode,detail:string,at:number,durationMs?:number):DiagnosticState {
 if(!Number.isFinite(at)||at<0) return state;
 if(durationMs!==undefined && (!Number.isFinite(durationMs)||durationMs<0)) return state;
 const event:DiagnosticEvent={id:state.nextId,at,kind:EVENT_MAP[code],code,detail:cleanDetail(detail),...(durationMs===undefined?{}:{durationMs})};
 return {nextId:state.nextId+1,events:[...state.events,event].slice(-MAX_EVENTS)};
}
export function diagnosticCounts(events:readonly DiagnosticEvent[]) {
 return {
  safety:events.filter(x=>x.kind==='safety').length,
  motions:events.filter(x=>x.code==='TARGET_REACHED').length,
  teleopArms:events.filter(x=>x.code==='CONTROL_ARMED').length,
  dockings:events.filter(x=>x.code==='SAMPLE_DOCKED').length,
  motionDurationMs:events.filter(x=>x.code==='TARGET_REACHED').reduce((sum,x)=>sum+(x.durationMs??0),0),
 };
}
const csvCell=(value:string|number):string => {
 let cell=String(value);
 if(/^[=+\-@\t\r]/.test(cell))cell="'"+cell;
 return '"'+cell.replaceAll('"','""')+'"';
};
export function diagnosticsCsv(events:readonly DiagnosticEvent[]):string {
 return ['id,time_iso,category,code,detail,duration_ms', ...events.map(event=>[
   event.id, new Date(event.at).toISOString(),event.kind,event.code,event.detail,event.durationMs??'',
 ].map(csvCell).join(','))].join('\r\n')+'\r\n';
}
export function diagnosticsJson(events:readonly DiagnosticEvent[]):string {
 return JSON.stringify({schema:'robomotion.telemetry.v1',privacy:'No images, landmarks, webcam frames or identifiers collected',events},null,2);
}
export type DemoStep = 'inspect'|'manual'|'target'|'webcam'|'safe-stop';
export const DEMO_STEPS:readonly {id:DemoStep;label:string;instruction:string}[]=[
 {id:'inspect',label:'Inspect the 3D arm',instruction:'Rotate and zoom the robotic workspace; verify all six joints are visible.'},
 {id:'manual',label:'Manual joint movement',instruction:'Use one joint slider or a pose preset; verify the pose updates.'},
 {id:'target',label:'Kinematics target',instruction:'Choose Demo point, move to target, and review the calculated target error.'},
 {id:'webcam',label:'Opt-in gesture demonstration',instruction:'Start the webcam, calibrate, deliberately arm, and move a visible open palm slowly.'},
 {id:'safe-stop',label:'Emergency-stop recovery',instruction:'Disarm, test the E-stop latch, reset it, and confirm the controller stays disabled.'},
];
export function nextDemoStep(done:readonly DemoStep[]):DemoStep|null {return DEMO_STEPS.find(x=>!done.includes(x.id))?.id??null;}
