import { lazy, Suspense, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { CSSProperties, Dispatch } from 'react';
import { SceneErrorBoundary } from './components/SceneErrorBoundary';
// Split the WebGL renderer into an independently loadable chunk. The simulation
// stays accessible even when the device cannot create a WebGL context.
const StarterScene = lazy(() => import('./components/StarterScene').then(m => ({default:m.StarterScene})));
import { Icon } from './components/Icons';
import { DEVELOPMENT_STAGES, INITIAL_SCENE, STAGE_TOTAL, WORKSPACE, sceneReducer } from './core/stage1';
import type { CameraPreset } from './core/stage1';
import { HOME_POSE, JOINT_KEYS, JOINT_SPECS, POSE_PRESETS, robotReducer } from './core/robot';
import type { RobotAction, RobotPose, PosePreset } from './core/robot';
import { distance, formatMetres, forwardKinematics, inverseKinematics, ROBOT_GEOMETRY } from './core/kinematics';
import type { Vector3 } from './core/kinematics';
import { planMotion, sampleMotion } from './core/motion';
import { ManipulationControls } from './components/ManipulationControls';
// The webcam UI is separate from the robot and never initializes a camera on import.
const GestureLab = lazy(() => import('./components/GestureLab').then(m => ({default:m.GestureLab})));
import { GestureControlPanel } from './components/GestureControlPanel';
import { EngineeringDashboard } from './components/EngineeringDashboard';
import { emptyDiagnostics, recordEvent, diagnosticsCsv, diagnosticsJson } from './core/diagnostics';
import type { DiagnosticCode } from './core/diagnostics';
import type { GestureName } from './vision/gestures';
import {initialGestureControl,armGestureControl,disableGestureControl,emergencyStop,resetEmergencyStop,handleGestureFrame,expireTracking,gesturePoseStep,canArm} from './core/gesture-control';
import type {GestureControlState,GestureFrame} from './core/gesture-control';
import { checkTrajectory, createInitialManipulation, graspObject, releaseObject, GRIP_CLOSED, GRIP_RELEASED, objectById, dockById } from './core/manipulation';

const CAMERA_LABELS: Record<CameraPreset, string> = {
  isometric: 'Isometric',
  front: 'Front',
  top: 'Top',
};

function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      {mobileOpen && <button className="sidebar-scrim" type="button" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-symbol" aria-hidden="true"><span>R</span><span>M</span></div>
          <div><div className="brand-title">ROBO<span>MOTION</span></div><div className="brand-subtitle">ENGINEERING LAB <b>AI</b></div></div>
          <button type="button" className="mobile-close icon-btn" aria-label="Close menu" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="sidebar-tag"><span className="tiny-dot" /> PROJECT WORKSPACE <span className="tag-version">V0.8</span></div>
        <div className="nav-label">PROJECT</div>
        <nav aria-label="Project navigation" className="nav-list">
          <a href="#workspace" className="nav-item nav-active" onClick={onClose}><Icon name="cube" /> 3D Workspace <span className="nav-highlight" /></a>
          <a href="#joint-controls" className="nav-item" onClick={onClose}><Icon name="orbit" /> Joint Controls</a>
          <a href="#target-controls" className="nav-item" onClick={onClose}><Icon name="compass" /> Target Kinematics</a>
          <a href="#object-controls" className="nav-item" onClick={onClose}><Icon name="cube" /> Object Manipulation</a>
          <a href="#gesture-controls" className="nav-item" onClick={onClose}><Icon name="monitor" /> Hand Gesture Lab</a>
          <a href="#gesture-robot" className="nav-item" onClick={onClose}><Icon name="orbit" /> Gesture Robot Control</a>
          <a href="#diagnostics" className="nav-item" onClick={onClose}><Icon name="shield" /> Engineering Diagnostics <span className="soon">LIVE</span></a>
          <a href="#overview" className="nav-item" onClick={onClose}><Icon name="layers" /> Overview</a>
          <a href="#build-roadmap" className="nav-item" onClick={onClose}><Icon name="compass" /> Build Roadmap</a>
        </nav>
        <div className="nav-label nav-label-second">ENGINEERING</div>
        <div className="nav-list">
          <a href="#target-controls" className="nav-item" onClick={onClose}><Icon name="orbit" /> Inverse Kinematics <span className="soon">LIVE</span></a>
          <a href="#gesture-controls" className="nav-item" onClick={onClose}><Icon name="monitor" /> Gesture Recognition <span className="soon">LIVE</span></a>
          <a href="#diagnostics" className="nav-item" onClick={onClose}><Icon name="shield" /> Diagnostics <span className="soon">LIVE</span></a>
        </div>
        <div className="sidebar-bottom">
          <div className="side-progress">
            <div className="side-progress-top"><span>BUILD PROGRESS</span><strong>08 <em>/ 08</em></strong></div>
            <div className="progress-track"><span style={{ width: `${800 / STAGE_TOTAL}%` }} /></div>
            <p>Integrated simulator &amp; portfolio release</p>
          </div>
          <div className="side-signature"><span className="signature-mark">◈</span><span>Designed to build real understanding.<br /><strong>One stage at a time.</strong></span></div>
        </div>
      </aside>
    </>
  );
}

function RobotControls({ pose, dispatch, locked }: { pose: RobotPose; dispatch: Dispatch<RobotAction>; locked:boolean }) {
  const activePreset = (Object.keys(POSE_PRESETS) as PosePreset[]).find(
    (key) => JOINT_KEYS.every((joint) => pose[joint] === POSE_PRESETS[key][joint]),
  );
  return (
    <section className="joint-section" id="joint-controls" aria-label="Manual robotic arm controls">
      <div className="joint-section-header">
        <div><div className="section-kicker">ARTICULATED ARM / MANUAL DRIVE</div><h2>Joint control console</h2><p>Move six independent channels. Commands stay within mechanical limits and animate smoothly in the 3D viewport.</p></div>
        <button type="button" className="pose-reset" disabled={locked} onClick={() => dispatch({ type: 'RESET_POSE' })}><Icon name="reset" size={15}/> Reset pose</button>
      </div>
      <div className="preset-row" aria-label="Robot pose presets">
        <span>QUICK POSES</span>
        {(Object.keys(POSE_PRESETS) as PosePreset[]).map((preset) => (
          <button key={preset} type="button" aria-pressed={activePreset === preset} disabled={locked} className={`preset-pill ${activePreset === preset ? 'preset-selected' : ''}`} onClick={() => dispatch({ type: 'APPLY_PRESET', preset })}>{preset}</button>
        ))}
      </div>
      <div className="joint-grid">
        {JOINT_KEYS.map((joint, index) => {
          const spec = JOINT_SPECS[joint];
          return (
            <div className="joint-card" key={joint}>
              <div className="joint-head"><span className="joint-number">J{String(index + 1).padStart(2, '0')}</span><label htmlFor={`joint-${joint}`}>{spec.label}</label><output htmlFor={`joint-${joint}`} className="joint-value">{pose[joint]}<span>{spec.unit}</span></output></div>
              <div className="joint-subtitle">{spec.description}</div>
              <div className="joint-input-row">
                <button type="button" className="nudge-button" aria-label={`Decrease ${spec.label}`} disabled={locked || pose[joint] <= spec.min} onClick={() => dispatch({ type: 'NUDGE_JOINT', joint, direction: -1 })}>−</button>
                <input type="range" id={`joint-${joint}`} disabled={locked} min={spec.min} max={spec.max} step={spec.step} value={pose[joint]} onChange={(event) => dispatch({ type: 'SET_JOINT', joint, value: Number(event.target.value) })} aria-valuetext={`${pose[joint]}${spec.unit}`} style={{ '--joint-fill': `${((pose[joint] - spec.min) / (spec.max - spec.min)) * 100}%` } as CSSProperties} />
                <button type="button" className="nudge-button" aria-label={`Increase ${spec.label}`} disabled={locked || pose[joint] >= spec.max} onClick={() => dispatch({ type: 'NUDGE_JOINT', joint, direction: 1 })}>+</button>
              </div>
              <div className="joint-extents"><span>{spec.min}{spec.unit}</span><span>{spec.max}{spec.unit}</span></div>
            </div>
          );
        })}
      </div>
      <div className="joint-footnote"><Icon name="shield" size={15}/><span>Manual controls remain available in Stage 3. Target motion uses a position-only IK solution; full-arm collision avoidance and real hardware control are not implemented.</span></div>
    </section>
  );
}

type TargetDraft = Record<'x'|'y'|'z', string>;
function pointFromDraft(draft:TargetDraft): Vector3 | null {
  if (Object.values(draft).some(v => v.trim().length===0)) return null;
  const p={ x:Number(draft.x), y:Number(draft.y), z:Number(draft.z) };
  return Object.values(p).every(Number.isFinite) ? p : null;
}
function targetDraftFrom(p:Vector3):TargetDraft { return {x:p.x.toFixed(3),y:p.y.toFixed(3),z:p.z.toFixed(3)}; }
const DEMO_POSE:RobotPose = { ...HOME_POSE, base:40, shoulder:-18, elbow:78, wristPitch:-60 };

function TargetControls({draft,onDraft,pose,onMove,onStop,moving,message,locked}: {
  draft:TargetDraft; onDraft:(value:TargetDraft)=>void; pose:RobotPose;
  onMove:()=>void; onStop:()=>void; moving:boolean; message:string; locked:boolean;
}) {
  const point=pointFromDraft(draft);
  const solution=point ? inverseKinematics(point,pose) : null;
  const tool=forwardKinematics(pose);
  const miss=point ? distance(point,tool) : null;
  return (
    <section className="kinematics-section" id="target-controls" aria-label="Stage 3 kinematics and target controls">
      <div className="kinematics-head">
        <div><div className="section-kicker">STAGE 03 / ENGINEERING MOTION</div><h2>Target kinematics console</h2><p>Enter a world-space position in metres. The analytic IK solver keeps the gripper upright and rejects targets outside geometric or joint-limit constraints.</p></div>
        <span className="kinematics-tag">POSITION IK</span>
      </div>
      <div className="kinematics-grid">
        <div className="kin-card">
          <h3>Desired tool position <small>WORLD / METRES</small></h3>
          <div className="target-inputs">{(['x','y','z'] as const).map(axis=>(
            <label key={axis}><span>{axis.toUpperCase()}</span><input type="number" step="0.05" value={draft[axis]} onChange={e=>onDraft({...draft,[axis]:e.target.value})} aria-label={`Target ${axis.toUpperCase()} in metres`}/></label>
          ))}</div>
          <div className="target-shortcuts">
            <button type="button" onClick={()=>onDraft(targetDraftFrom(forwardKinematics(HOME_POSE)))}>Home TCP</button>
            <button type="button" onClick={()=>onDraft(targetDraftFrom(tool))}>Current TCP</button>
            <button type="button" onClick={()=>onDraft(targetDraftFrom(forwardKinematics(DEMO_POSE)))}>Demo point</button>
          </div>
          <div className="target-actions">
            <button className="target-go" type="button" disabled={!solution?.ok || moving || locked} onClick={onMove}>{moving?'Moving…':'Move to target'}</button>
            <button className="target-stop" type="button" onClick={onStop} disabled={!moving}>Stop motion</button>
          </div>
          <p className="motion-message" role="status" aria-live="polite">{message}</p>
        </div>
        <div className="kin-card">
          <h3>Forward kinematics <small>COMMANDED TCP</small></h3>
          <dl className="kin-values">
            {(['x','y','z'] as const).map(axis=><div key={axis}><dt>{axis.toUpperCase()}</dt><dd>{formatMetres(tool[axis])} m</dd></div>)}
            <div><dt>Target error</dt><dd>{miss===null?'—':formatMetres(miss)+' m'}</dd></div>
          </dl>
          <p className="kin-help">Calculated from the current commanded joint angles. Visual animation may lag slightly; no physical encoder or measured position is available.</p>
        </div>
        <div className="kin-card">
          <h3>Inverse kinematics <small>REACH CHECK</small></h3>
          <div className={`ik-status ${solution?.ok?'ik-good':'ik-invalid'}`} role="status">{solution?.ok?'● REACHABLE':solution ? `● ${solution.reason.replace('_',' ')}` : '● INVALID TARGET'}</div>
          <p className="kin-help">{solution ? solution.message : 'Enter a finite coordinate in every field.'}</p>
          {solution?.ok && <dl className="kin-values compact"><div><dt>Proposed shoulder</dt><dd>{solution.pose.shoulder.toFixed(2)}°</dd></div><div><dt>Proposed elbow</dt><dd>{solution.pose.elbow.toFixed(2)}°</dd></div><div><dt>FK residual</dt><dd>{formatMetres(solution.residual)} m</dd></div></dl>}
          <p className="kin-help">Tool pose: upright. Geometry envelope: max radial reach {ROBOT_GEOMETRY.upperArm+ROBOT_GEOMETRY.forearm+ROBOT_GEOMETRY.toolExtension} m, floor clearance {ROBOT_GEOMETRY.minToolHeight} m. Joint limits may reduce this area.</p>
        </div>
      </div>
      <div className="joint-footnote">Stage 3 is a digital position controller, not a physical robot. Stage 4 adds discrete grasping and sampled tool/object clearance checks, but not full-body collision avoidance or grasp-force physics.</div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return <div className="metric"><span className="metric-label">{label}</span><div className="metric-value">{value}</div><div className="metric-sub">{sub}</div></div>;
}

export default function App() {
  const [settings, dispatch] = useReducer(sceneReducer, INITIAL_SCENE);
  const [robotPose, robotDispatch] = useReducer(robotReducer, HOME_POSE);
  // Only event codes and non-biometric descriptive labels are recorded in memory.
  const [diagnostics,setDiagnostics]=useState(()=>recordEvent(emptyDiagnostics(),'SESSION_STARTED','Stage 8 simulator session',Date.now()));
  function logDiagnostic(code:DiagnosticCode,detail:string,durationMs?:number){
    setDiagnostics(state=>recordEvent(state,code,detail,Date.now(),durationMs));
  }
  const [cameraSummary,setCameraSummary]=useState<{gesture:GestureName|null;source:string;confidence:number|null;calibrated:boolean}>({gesture:null,source:'idle',confidence:null,calibrated:false});
  const lastRecordedGesture=useRef<string|null>(null);
  const lastSummaryAt=useRef(0);
  function downloadDiagnostics(format:'csv'|'json'){
    const content=format==='csv'?diagnosticsCsv(diagnostics.events):diagnosticsJson(diagnostics.events);
    const blob=new Blob([content],{type:format==='csv'?'text/csv;charset=utf-8':'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    try { const anchor=document.createElement('a');anchor.href=url;anchor.download=`robomotion-session-events.${format}`;document.body.append(anchor);anchor.click();anchor.remove(); }
    finally { window.setTimeout(()=>URL.revokeObjectURL(url),1000); }
  }
  const [gestureControl,setGestureControl] = useState<GestureControlState>(initialGestureControl);
  const gestureRef=useRef<GestureControlState>(gestureControl);
  const latestGestureFrame=useRef<GestureFrame|null>(null);
  const [liveEligible,setLiveEligible]=useState(false);
  function updateGestureControl(next:GestureControlState){
    const previous=gestureRef.current;
    gestureRef.current=next;setGestureControl(next);
    if(previous.mode!==next.mode){
      if(next.mode==='armed') logDiagnostic('CONTROL_ARMED','Live calibrated camera armed');
      if(next.mode==='estop') logDiagnostic('CONTROL_STOPPED','Emergency stop latched');
      if(previous.mode==='estop'&&next.mode==='disabled') logDiagnostic('STOP_RESET','Stop reset; remains disabled');
      else if(previous.mode==='armed'&&next.mode==='disabled'){
        if(/stale|gap|hand lost|camera|frame/i.test(next.reason))logDiagnostic('TRACKING_LOST','Tracking unavailable; disarmed');
        else logDiagnostic('CONTROL_DISABLED','Gesture controller disarmed');
      }
    }
  }
  function disableTeleop(reason='Manual controls took priority; gesture control disarmed.'){
    if(gestureRef.current.mode==='armed') {logDiagnostic('MANUAL_OVERRIDE','Manual command took control');updateGestureControl(disableGestureControl(gestureRef.current,reason));}
  }
  function eStop(){cancelMotion();updateGestureControl(emergencyStop(gestureRef.current));setMotionMessage('EMERGENCY STOP: all simulated motion disabled until reset.');}
  function onGestureUnavailable(reason:string){
    latestGestureFrame.current=null;setLiveEligible(false);disableTeleop(reason);
    setCameraSummary({gesture:null,source:'idle',confidence:null,calibrated:false});
    lastRecordedGesture.current=null;logDiagnostic('CAMERA_UNAVAILABLE','Camera unavailable or hand observation ended');
  }
  function onGestureFrame(frame:GestureFrame){
    latestGestureFrame.current=frame;
    const summaryAt=performance.now();
    if(summaryAt-lastSummaryAt.current>300){
      lastSummaryAt.current=summaryAt;
      setCameraSummary({gesture:frame.gesture,source:frame.source,confidence:frame.observation?.confidence??null,calibrated:!!frame.calibration});
    }
    if(frame.source==='camera'&&frame.gesture!==lastRecordedGesture.current){
      if(lastRecordedGesture.current===null)logDiagnostic('CAMERA_AVAILABLE','Live camera observations started');
      lastRecordedGesture.current=frame.gesture;
      logDiagnostic('GESTURE_CHANGED',`Observed: ${frame.gesture}`);
    }

    setLiveEligible(canArm(frame,performance.now(),manipulation.heldId)===null);
    const before=gestureRef.current;
    if(before.mode!=='armed') return;
    const outcome=handleGestureFrame(before,frame,manipulation.heldId);
    if(outcome.state!==before && (outcome.state.mode!==before.mode || outcome.state.reason!==before.reason)) updateGestureControl(outcome.state);
    else gestureRef.current=outcome.state;
    if(outcome.state.mode!=='armed'||outcome.command.kind==='hold') return;
    const dt=Math.min(0.15,Math.max(0,(frame.atMs-(before.lastCommandAt??frame.atMs))/1000));
    if(dt<=0) return;
    const step=gesturePoseStep(currentPose.current,outcome.command,dt);
    if(!step.ok){if(before.reason!==step.reason)logDiagnostic('GESTURE_TARGET_REJECTED','Gesture IK target rejected');updateGestureControl({...outcome.state,reason:step.reason,lastCommandAt:frame.atMs});return;}
    const safety=checkTrajectory(manipulation,currentPose.current,step.pose);
    if(!safety.ok){if(before.reason!==safety.reason)logDiagnostic('TRAJECTORY_REJECTED','Gesture path blocked');updateGestureControl({...outcome.state,reason:`Gesture motion blocked: ${safety.reason}`,lastCommandAt:frame.atMs});return;}
    currentPose.current=step.pose;
    robotDispatch({type:'SET_POSE',pose:step.pose});
    gestureRef.current={...outcome.state,lastCommandAt:frame.atMs};
  }
  function armLiveGesture(){
    if(gestureRef.current.mode==='estop') return;
    const next=armGestureControl(gestureRef.current,latestGestureFrame.current,currentPose.current,performance.now(),manipulation.heldId);
    if(next.mode==='armed') {cancelMotion();setApproachingObjectId(null);setMotionMessage('Live gesture control active. Manual actions disarm it.');}
    if(next.mode!=='armed')logDiagnostic('CONTROL_ARM_REJECTED','Arming rejected: live calibrated hand required');
    updateGestureControl(next);
  }
  useEffect(()=>{
    const interval=window.setInterval(()=>{
      const state=gestureRef.current;
      const expired=expireTracking(state,performance.now());
      if(expired!==state) updateGestureControl(expired);
    },150);
    return()=>window.clearInterval(interval);
  },[]);

  const [sceneReady, setSceneReady] = useState(false);
  const [focusRobot,setFocusRobot] = useState(true);
  const [manipulation,setManipulation] = useState(createInitialManipulation);
  const [selectedObjectId,setSelectedObjectId] = useState('sample-1');
  const [selectedDockId,setSelectedDockId] = useState('dock-a');
  const [manipulationMessage,setManipulationMessage] = useState('Select a sample, load its pickup position, move the arm, then grasp.');
  const [approachingObjectId,setApproachingObjectId] = useState<string|null>(null);
  const [resetVersion, setResetVersion] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moving, setMoving] = useState(false);
  const [motionMessage,setMotionMessage] = useState('Enter or select a reachable target.');
  const [targetDraft,setTargetDraft] = useState<TargetDraft>(()=>targetDraftFrom(forwardKinematics(HOME_POSE)));
  const goal=useMemo(()=>pointFromDraft(targetDraft),[targetDraft]);
  const motionFrame=useRef<number|null>(null);
  const currentPose=useRef<RobotPose>(robotPose);
  currentPose.current=robotPose;
  function cancelMotion() {
    if(motionFrame.current!==null){cancelAnimationFrame(motionFrame.current);motionFrame.current=null;logDiagnostic('TARGET_CANCELLED','Target motion interrupted');}
    setMoving(false);
  }
  useEffect(()=>()=>{if(motionFrame.current!==null) cancelAnimationFrame(motionFrame.current);},[]);
  function dispatchManual(action:RobotAction) {
    if(gestureRef.current.mode==='estop'){setMotionMessage('EMERGENCY STOP latched: reset stop to move.');return;}
    disableTeleop();
    const from = currentPose.current;
    const next=robotReducer(from,action);
    if(manipulation.heldId && next.gripper>=GRIP_RELEASED){
      const drop=releaseObject(manipulation,selectedDockId,from);
      if(!drop.ok){ setManipulationMessage(`Opening blocked: ${drop.reason}`);return; }
      setManipulation(drop.state);
      setManipulationMessage(drop.message);
    }
    const safety=checkTrajectory(manipulation,from,next);
    if(!safety.ok){setManipulationMessage(`Motion rejected: ${safety.reason}`);logDiagnostic('TRAJECTORY_REJECTED','Manual joint trajectory blocked');return;}
    cancelMotion();
    setApproachingObjectId(null);
    setMotionMessage('Manual joint control active. Target trajectory cancelled.');
    robotDispatch(action);
  }
  function loadPickup(){
    if(gestureRef.current.mode==='estop'){setManipulationMessage('E-stop active: reset first.');return;}
    disableTeleop();cancelMotion();
    const object=objectById(manipulation,selectedObjectId);
    if(!object){setManipulationMessage('Unknown sample.');return;}
    setApproachingObjectId(object.id);
    setTargetDraft(targetDraftFrom(object.position));
    setManipulationMessage(`Pickup position for ${object.label} loaded. Move to target, then grasp.`);
  }
  function loadDock(){
    if(gestureRef.current.mode==='estop'){setManipulationMessage('E-stop active: reset first.');return;}
    disableTeleop();cancelMotion();
    const station=dockById(selectedDockId);
    if(!station){setManipulationMessage('Unknown dock.');return;}
    setApproachingObjectId(null);
    setTargetDraft(targetDraftFrom(station.position));
    setManipulationMessage(`Coordinates for ${station.label} loaded. Move to target, then release.`);
  }
  function graspSelected(){
    if(gestureRef.current.mode==='estop'){setManipulationMessage('E-stop active: reset first.');return;}
    disableTeleop();
    if(moving){setManipulationMessage('Allow the robot to finish moving before grasping.');return;}
    const closed={...currentPose.current,gripper:GRIP_CLOSED};
    const result=graspObject(manipulation,selectedObjectId,closed);
    if(!result.ok){setManipulationMessage(result.reason);logDiagnostic('SAMPLE_REJECTED','Grasp constraints rejected');return;}
    cancelMotion();
    logDiagnostic('SAMPLE_GRASPED',`Grasped ${selectedObjectId}`);
    robotDispatch({type:'SET_JOINT',joint:'gripper',value:GRIP_CLOSED});
    setManipulation(result.state);
    setManipulationMessage(result.message);
    setApproachingObjectId(null);
  }
  function releaseSelected(){
    if(gestureRef.current.mode==='estop'){setManipulationMessage('E-stop active: reset first.');return;}
    disableTeleop();
    if(moving){setManipulationMessage('Allow the robot to finish moving before releasing.');return;}
    const result=releaseObject(manipulation,selectedDockId,currentPose.current);
    if(!result.ok){setManipulationMessage(result.reason);logDiagnostic('SAMPLE_REJECTED','Release constraints rejected');return;}
    cancelMotion();
    logDiagnostic('SAMPLE_DOCKED',`Docked at ${selectedDockId}`);
    setManipulation(result.state);
    robotDispatch({type:'SET_JOINT',joint:'gripper',value:GRIP_RELEASED});
    setManipulationMessage(result.message);
  }
  function resetObjects(){
    if(gestureRef.current.mode==='estop'){setManipulationMessage('E-stop active: reset first.');return;}
    disableTeleop();cancelMotion();
    logDiagnostic('OBJECTS_RESET','Virtual sample stations restored');
    setManipulation(createInitialManipulation());
    setSelectedObjectId('sample-1');setSelectedDockId('dock-a');setApproachingObjectId(null);
    setManipulationMessage('Three samples restored to source stations.');
  }
  function moveToTarget(){
    if(gestureRef.current.mode==='estop'){setMotionMessage('E-stop active: reset before target movement.');return;}
    disableTeleop();cancelMotion();
    const point=pointFromDraft(targetDraft);
    if(!point){setMotionMessage('Target must contain three valid coordinates.');logDiagnostic('TARGET_REJECTED','Invalid target coordinates');return;}
    const result=inverseKinematics(point,currentPose.current);
    if(!result.ok){setMotionMessage(result.message);logDiagnostic('TARGET_REJECTED','Target outside reach or joint constraints');return;}
    const allowPickup=approachingObjectId && objectById(manipulation,approachingObjectId);
    const safety=checkTrajectory(manipulation,currentPose.current,result.pose,
      allowPickup && distance(point,allowPickup.position)<0.015 ? approachingObjectId : null);
    if(!safety.ok){setMotionMessage(safety.reason);setManipulationMessage(`Target motion blocked: ${safety.reason}`);logDiagnostic('TRAJECTORY_REJECTED','Target trajectory blocked');return;}
    const plan=planMotion(currentPose.current,result.pose);
    logDiagnostic('TARGET_STARTED','Coordinated target requested');
    const started=performance.now();
    setMoving(true);
    setMotionMessage(`Coordinated motion in progress (${plan.durationSeconds.toFixed(2)} s planned).`);
    const tick=(now:number)=>{
      const elapsed=(now-started)/1000;
      robotDispatch({type:'SET_POSE',pose:sampleMotion(plan,elapsed)});
      if(elapsed<plan.durationSeconds){motionFrame.current=requestAnimationFrame(tick);}
      else { motionFrame.current=null; setMoving(false);logDiagnostic('TARGET_REACHED','Coordinated target command complete',Math.max(0,now-started));setMotionMessage(`Target command reached; planned duration ${plan.durationSeconds.toFixed(2)} s. Await visual settling.`); }
    };
    motionFrame.current=requestAnimationFrame(tick);
  }

  function resetWorkspace() {
    disableTeleop();
    dispatch({ type: 'RESET' });
    setFocusRobot(true);
    setResetVersion((version) => version + 1);
  }

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="main" id="workspace">
        <header className="topbar">
          <div className="topbar-left"><button type="button" className="mobile-menu icon-btn" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Icon name="menu" /></button><span>RoboMotion AI</span><span className="breadcrumb-slash">/</span><strong>Workspace</strong><span className="topbar-stage">STAGE 08</span></div>
          <div className="topbar-right"><span className="dot-status" /><span>FINAL BUILD · SIMULATION ONLY</span><span className="version-pill">v0.8.0</span></div>
        </header>

        <div className="page-content">
          <section className="intro" id="overview">
            <div className="eyebrow"><span className="eyebrow-line" /> ROBOTICS LABORATORY <span className="eyebrow-num">/ 008</span></div>
            <div className="intro-heading"><div><h1>The future is <em>built.</em></h1><p>Your interactive engineering workspace. Explore the 3D scene, establish the coordinate system, manually control the arm, solve target coordinates with forward/inverse kinematics, run time-bounded joint motion, manipulate virtual samples between elevated stations, and optionally use a calibrated live webcam to control the simulated arm behind deliberate safety interlocks.</p></div><div className="intro-orbit" aria-hidden="true"><span className="orbit-ring orb-a" /><span className="orbit-ring orb-b" /><span className="orbit-center" /></div></div>
          </section>

          <section className="workspace-section" aria-label="3D engineering environment">
            <div className="section-line"><div><span className="section-number">01</span><h2>Simulation workspace</h2></div><span className="section-aside">EXPLORE · ROTATE · INSPECT</span></div>
            <div className="workspace-layout">
              <div className="viewport-card">
                <div className="viewport-top"><div className="viewport-title"><span className="live-ring" /> LIVE 3D VIEWPORT <span className="viewport-divider">/</span> <span className="view-soft">ARTICULATED ARM</span></div><div className="viewport-top-right"><span>WEBGL</span><span className="mini-separator">·</span><span>{sceneReady ? 'RENDERER READY' : 'INITIALIZING'}</span></div></div>
                <div className="scene-window">
                  <SceneErrorBoundary>
                    <Suspense fallback={<div className="scene-loading" role="status">Loading interactive 3D renderer…</div>}><StarterScene settings={settings} resetVersion={resetVersion} pose={robotPose} target={goal} objects={manipulation.objects} heldId={manipulation.heldId} frozen={gestureControl.mode==='estop'} focusRobot={focusRobot} onReady={() => setSceneReady(true)} /></Suspense>
                  </SceneErrorBoundary>
                  <div className="scene-corner scene-top-left"><span className="scene-corner-title">ROBOT / RM-08</span><span>6 joints · Position IK · Procedural model</span></div>
                  <div className="scene-corner scene-bottom-left"><span className="scene-led" /> <span>{settings.animateBeacon ? 'BEACON ACTIVE' : 'BEACON PAUSED'}</span></div>
                  <div className="scene-corner scene-bottom-right"><span>DRAG TO ROTATE</span><span className="zoom-help">SCROLL TO ZOOM</span></div>
                </div>
                <div className="viewport-toolbar" aria-label="Scene tools">
                  <div className="toolbar-group">
                    <button className={`tool-button ${settings.showGrid ? 'tool-active' : ''}`} type="button" aria-pressed={settings.showGrid} onClick={() => dispatch({ type: 'TOGGLE_GRID' })} title="Toggle reference grid"><Icon name="grid" size={16} /> Grid</button>
                    <button className={`tool-button ${settings.showAxes ? 'tool-active' : ''}`} type="button" aria-pressed={settings.showAxes} onClick={() => dispatch({ type: 'TOGGLE_AXES' })} title="Toggle coordinate axes"><Icon name="axis" size={16} /> Axes</button>
                    <button type="button" className={`tool-button ${focusRobot ? 'tool-active' : ''}`} aria-pressed={focusRobot} onClick={()=>setFocusRobot(v=>!v)} title={focusRobot ? "Switch to wide scene" : "Focus camera on robotic arm"} aria-label={focusRobot ? "Switch to wide scene" : "Focus camera on robotic arm"}>{focusRobot?'Focus arm':'Wide scene'}</button>
                    <span className="tool-divider" />
                    <button className="tool-button" type="button" aria-pressed={settings.animateBeacon} onClick={() => dispatch({ type: 'TOGGLE_MOTION' })}><Icon name={settings.animateBeacon ? 'pause' : 'play'} size={16} /> {settings.animateBeacon ? 'Pause beacon' : 'Play beacon'}</button>
                  </div>
                  <button className="tool-button reset-btn" type="button" onClick={resetWorkspace}><Icon name="reset" size={16} /> Reset view</button>
                </div>
              </div>

              <aside className="inspector" aria-label="Scene inspector">
                <div className="inspector-heading"><div><span className="inspector-kicker">INSPECTOR PANEL</span><h3>Scene controls</h3></div><Icon name="layers" size={20} /></div>
                <div className="inspector-body">
                  <label className="control-label" htmlFor="camera-preset">CAMERA PRESET</label>
                  <div className="select-wrap"><select id="camera-preset" value={settings.camera} onChange={(event) => dispatch({ type: 'SET_CAMERA', preset: event.target.value as CameraPreset })}>
                    {Object.entries(CAMERA_LABELS).map(([value, name]) => <option key={value} value={value}>{name} view</option>)}
                  </select><Icon name="compass" size={17} /></div>
                  <div className="inspector-rule" />
                  <span className="control-label">SCENE INFORMATION</span>
                  <dl className="property-list"><div><dt>Coordinate system</dt><dd>Right-handed</dd></div><div><dt>Up axis</dt><dd>+Y</dd></div><div><dt>Workspace size</dt><dd>{WORKSPACE.width} × {WORKSPACE.depth} m</dd></div><div><dt>Grid divisions</dt><dd>{WORKSPACE.gridDivisions}</dd></div><div><dt>Camera</dt><dd>{CAMERA_LABELS[settings.camera]}</dd></div><div><dt>Manual channels</dt><dd>6</dd></div></dl>
                  <div className="inspector-rule" />
                  <div className="foundation-callout"><span className="callout-symbol"><Icon name="spark" size={17}/></span><div><strong>Stage 8 · Integrated digital-twin demonstration</strong><p>Manual controls and analytic target positioning are available. Six elevated test stations still support virtual sample pickup and placement. Live webcam gestures can operate only the simulated robot after explicit arming.</p></div></div>
                </div>
                <div className="inspector-footer"><span className="footer-led"/>STAGE 08 / 08 <span className="footer-right">DIAGNOSTICS</span></div>
              </aside>
            </div>
          </section>

          <RobotControls pose={robotPose} dispatch={dispatchManual} locked={gestureControl.mode==='estop'} />
          <TargetControls draft={targetDraft} onDraft={value=>{disableTeleop();if(moving){cancelMotion();setMotionMessage("Motion cancelled because target coordinates changed.");}setApproachingObjectId(null);setTargetDraft(value);}} pose={robotPose} onMove={moveToTarget} onStop={()=>{cancelMotion();setMotionMessage('Motion stopped by user.');}} moving={moving} message={motionMessage} locked={gestureControl.mode==='estop'} />

          <ManipulationControls state={manipulation} selectedId={selectedObjectId} selectedDockId={selectedDockId}
            onSelect={id=>{setSelectedObjectId(id);setApproachingObjectId(null);}} onDock={setSelectedDockId}
            onLoadPickup={loadPickup} onLoadDock={loadDock} onGrasp={graspSelected} onRelease={releaseSelected}
            onReset={resetObjects} message={manipulationMessage}/>

          <Suspense fallback={<div className="gesture-loading" role="status">Loading opt-in gesture laboratory…</div>}><GestureLab onFrame={onGestureFrame} onUnavailable={onGestureUnavailable} /></Suspense>
          <GestureControlPanel mode={gestureControl.mode} reason={gestureControl.reason} ready={liveEligible} held={!!manipulation.heldId}
            onArm={armLiveGesture} onDisable={()=>updateGestureControl(disableGestureControl(gestureRef.current))}
            onEmergency={eStop} onReset={()=>updateGestureControl(resetEmergencyStop(gestureRef.current))} />

          <EngineeringDashboard pose={robotPose} target={goal} mode={gestureControl.mode} reason={gestureControl.reason}
            observedGesture={cameraSummary.gesture} source={cameraSummary.source} confidence={cameraSummary.confidence} calibrated={cameraSummary.calibrated}
            moving={moving} heldLabel={manipulation.objects.find(o=>o.id===manipulation.heldId)?.label??null} dockings={manipulation.placedCount}
            events={diagnostics.events} onExportCsv={()=>downloadDiagnostics('csv')} onExportJson={()=>downloadDiagnostics('json')}
            onClear={()=>setDiagnostics(emptyDiagnostics())}/>

          <section className="metrics-section" aria-label="Project engineering indicators">
            <Stat label="DEVELOPMENT STAGE" value="08 / 08" sub="Engineering diagnostics" />
            <Stat label="SCENE RENDERER" value="Three.js" sub="WebGL · React Three Fiber" />
            <Stat label="REFERENCE AXES" value="X · Y · Z" sub="Right-handed coordinate system" />
            <Stat label="ROBOT CONTROL" value="TELEOP + QA" sub="Session-local diagnostics" />
          </section>

          <section className="roadmap" id="build-roadmap">
            <div className="section-line roadmap-line"><div><span className="section-number">03</span><h2>The build roadmap</h2></div><span className="section-aside">8 DEVELOPMENT STAGES</span></div>
            <div className="roadmap-list">
              {DEVELOPMENT_STAGES.map((stage, index) => (
                <div className={`roadmap-item ${index === 7 ? 'roadmap-current' : ''}`} key={stage}>
                  <span className="roadmap-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="roadmap-title">{stage}</span>
                  <span className={`roadmap-status ${index === 7 ? 'current-status' : ''}`}>{index < 7 ? 'COMPLETE' : index === 7 ? 'RELEASE CANDIDATE' : 'UPCOMING'}</span>
                  <span className="roadmap-indicator">{index <= 7 ? <Icon name="check" size={15}/> : <Icon name="arrow" size={16}/>}</span>
                </div>
              ))}
            </div>
          </section>
          <footer className="page-footer"><span>ROBOMOTION AI <b>·</b> ENGINEERING FIRST</span><span>Stage 8 · Verified-source digital twin · Simulation only</span></footer>
        </div>
      </main>
    </div>
  );
}
