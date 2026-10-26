import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { CSSProperties, Dispatch } from 'react';
import { SceneErrorBoundary } from './components/SceneErrorBoundary';
import { StarterScene } from './components/StarterScene';
import { Icon } from './components/Icons';
import { DEVELOPMENT_STAGES, INITIAL_SCENE, STAGE_TOTAL, WORKSPACE, sceneReducer } from './core/stage1';
import type { CameraPreset } from './core/stage1';
import { HOME_POSE, JOINT_KEYS, JOINT_SPECS, POSE_PRESETS, robotReducer } from './core/robot';
import type { RobotAction, RobotPose, PosePreset } from './core/robot';
import { distance, formatMetres, forwardKinematics, inverseKinematics, ROBOT_GEOMETRY } from './core/kinematics';
import type { Vector3 } from './core/kinematics';
import { planMotion, sampleMotion } from './core/motion';
import { ManipulationControls } from './components/ManipulationControls';
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
        <div className="sidebar-tag"><span className="tiny-dot" /> PROJECT WORKSPACE <span className="tag-version">V0.4</span></div>
        <div className="nav-label">PROJECT</div>
        <nav aria-label="Project navigation" className="nav-list">
          <a href="#workspace" className="nav-item nav-active" onClick={onClose}><Icon name="cube" /> 3D Workspace <span className="nav-highlight" /></a>
          <a href="#joint-controls" className="nav-item" onClick={onClose}><Icon name="orbit" /> Joint Controls</a>
          <a href="#target-controls" className="nav-item" onClick={onClose}><Icon name="compass" /> Target Kinematics</a>
          <a href="#object-controls" className="nav-item" onClick={onClose}><Icon name="cube" /> Object Manipulation</a>
          <a href="#overview" className="nav-item" onClick={onClose}><Icon name="layers" /> Overview</a>
          <a href="#build-roadmap" className="nav-item" onClick={onClose}><Icon name="compass" /> Build Roadmap</a>
        </nav>
        <div className="nav-label nav-label-second">ENGINEERING</div>
        <div className="nav-list">
          <a href="#target-controls" className="nav-item" onClick={onClose}><Icon name="orbit" /> Inverse Kinematics <span className="soon">LIVE</span></a>
          <div className="nav-item nav-disabled" aria-disabled="true"><Icon name="monitor" /> Gesture Control <span className="soon">S5</span></div>
          <div className="nav-item nav-disabled" aria-disabled="true"><Icon name="shield" /> Diagnostics <span className="soon">S7</span></div>
        </div>
        <div className="sidebar-bottom">
          <div className="side-progress">
            <div className="side-progress-top"><span>BUILD PROGRESS</span><strong>04 <em>/ 08</em></strong></div>
            <div className="progress-track"><span style={{ width: `${400 / STAGE_TOTAL}%` }} /></div>
            <p>Virtual object manipulation</p>
          </div>
          <div className="side-signature"><span className="signature-mark">◈</span><span>Designed to build real understanding.<br /><strong>One stage at a time.</strong></span></div>
        </div>
      </aside>
    </>
  );
}

function RobotControls({ pose, dispatch }: { pose: RobotPose; dispatch: Dispatch<RobotAction> }) {
  const activePreset = (Object.keys(POSE_PRESETS) as PosePreset[]).find(
    (key) => JOINT_KEYS.every((joint) => pose[joint] === POSE_PRESETS[key][joint]),
  );
  return (
    <section className="joint-section" id="joint-controls" aria-label="Manual robotic arm controls">
      <div className="joint-section-header">
        <div><div className="section-kicker">ARTICULATED ARM / MANUAL DRIVE</div><h2>Joint control console</h2><p>Move six independent channels. Commands stay within mechanical limits and animate smoothly in the 3D viewport.</p></div>
        <button type="button" className="pose-reset" onClick={() => dispatch({ type: 'RESET_POSE' })}><Icon name="reset" size={15}/> Reset pose</button>
      </div>
      <div className="preset-row" aria-label="Robot pose presets">
        <span>QUICK POSES</span>
        {(Object.keys(POSE_PRESETS) as PosePreset[]).map((preset) => (
          <button key={preset} type="button" aria-pressed={activePreset === preset} className={`preset-pill ${activePreset === preset ? 'preset-selected' : ''}`} onClick={() => dispatch({ type: 'APPLY_PRESET', preset })}>{preset}</button>
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
                <button type="button" className="nudge-button" aria-label={`Decrease ${spec.label}`} disabled={pose[joint] <= spec.min} onClick={() => dispatch({ type: 'NUDGE_JOINT', joint, direction: -1 })}>−</button>
                <input type="range" id={`joint-${joint}`} min={spec.min} max={spec.max} step={spec.step} value={pose[joint]} onChange={(event) => dispatch({ type: 'SET_JOINT', joint, value: Number(event.target.value) })} aria-valuetext={`${pose[joint]}${spec.unit}`} style={{ '--joint-fill': `${((pose[joint] - spec.min) / (spec.max - spec.min)) * 100}%` } as CSSProperties} />
                <button type="button" className="nudge-button" aria-label={`Increase ${spec.label}`} disabled={pose[joint] >= spec.max} onClick={() => dispatch({ type: 'NUDGE_JOINT', joint, direction: 1 })}>+</button>
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

function TargetControls({draft,onDraft,pose,onMove,onStop,moving,message}: {
  draft:TargetDraft; onDraft:(value:TargetDraft)=>void; pose:RobotPose;
  onMove:()=>void; onStop:()=>void; moving:boolean; message:string;
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
            <button className="target-go" type="button" disabled={!solution?.ok || moving} onClick={onMove}>{moving?'Moving…':'Move to target'}</button>
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
  const [sceneReady, setSceneReady] = useState(false);
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
    if(motionFrame.current!==null){cancelAnimationFrame(motionFrame.current);motionFrame.current=null;}
    setMoving(false);
  }
  useEffect(()=>()=>{if(motionFrame.current!==null) cancelAnimationFrame(motionFrame.current);},[]);
  function dispatchManual(action:RobotAction) {
    const from = currentPose.current;
    const next=robotReducer(from,action);
    if(manipulation.heldId && next.gripper>=GRIP_RELEASED){
      const drop=releaseObject(manipulation,selectedDockId,from);
      if(!drop.ok){ setManipulationMessage(`Opening blocked: ${drop.reason}`);return; }
      setManipulation(drop.state);
      setManipulationMessage(drop.message);
    }
    const safety=checkTrajectory(manipulation,from,next);
    if(!safety.ok){setManipulationMessage(`Motion rejected: ${safety.reason}`);return;}
    cancelMotion();
    setApproachingObjectId(null);
    setMotionMessage('Manual joint control active. Target trajectory cancelled.');
    robotDispatch(action);
  }
  function loadPickup(){
    cancelMotion();
    const object=objectById(manipulation,selectedObjectId);
    if(!object){setManipulationMessage('Unknown sample.');return;}
    setApproachingObjectId(object.id);
    setTargetDraft(targetDraftFrom(object.position));
    setManipulationMessage(`Pickup position for ${object.label} loaded. Move to target, then grasp.`);
  }
  function loadDock(){
    cancelMotion();
    const station=dockById(selectedDockId);
    if(!station){setManipulationMessage('Unknown dock.');return;}
    setApproachingObjectId(null);
    setTargetDraft(targetDraftFrom(station.position));
    setManipulationMessage(`Coordinates for ${station.label} loaded. Move to target, then release.`);
  }
  function graspSelected(){
    if(moving){setManipulationMessage('Allow the robot to finish moving before grasping.');return;}
    const closed={...currentPose.current,gripper:GRIP_CLOSED};
    const result=graspObject(manipulation,selectedObjectId,closed);
    if(!result.ok){setManipulationMessage(result.reason);return;}
    cancelMotion();
    robotDispatch({type:'SET_JOINT',joint:'gripper',value:GRIP_CLOSED});
    setManipulation(result.state);
    setManipulationMessage(result.message);
    setApproachingObjectId(null);
  }
  function releaseSelected(){
    if(moving){setManipulationMessage('Allow the robot to finish moving before releasing.');return;}
    const result=releaseObject(manipulation,selectedDockId,currentPose.current);
    if(!result.ok){setManipulationMessage(result.reason);return;}
    cancelMotion();
    setManipulation(result.state);
    robotDispatch({type:'SET_JOINT',joint:'gripper',value:GRIP_RELEASED});
    setManipulationMessage(result.message);
  }
  function resetObjects(){
    cancelMotion();
    setManipulation(createInitialManipulation());
    setSelectedObjectId('sample-1');setSelectedDockId('dock-a');setApproachingObjectId(null);
    setManipulationMessage('Three samples restored to source stations.');
  }
  function moveToTarget(){
    cancelMotion();
    const point=pointFromDraft(targetDraft);
    if(!point){setMotionMessage('Target must contain three valid coordinates.');return;}
    const result=inverseKinematics(point,currentPose.current);
    if(!result.ok){setMotionMessage(result.message);return;}
    const allowPickup=approachingObjectId && objectById(manipulation,approachingObjectId);
    const safety=checkTrajectory(manipulation,currentPose.current,result.pose,
      allowPickup && distance(point,allowPickup.position)<0.015 ? approachingObjectId : null);
    if(!safety.ok){setMotionMessage(safety.reason);setManipulationMessage(`Target motion blocked: ${safety.reason}`);return;}
    const plan=planMotion(currentPose.current,result.pose);
    const started=performance.now();
    setMoving(true);
    setMotionMessage(`Coordinated motion in progress (${plan.durationSeconds.toFixed(2)} s planned).`);
    const tick=(now:number)=>{
      const elapsed=(now-started)/1000;
      robotDispatch({type:'SET_POSE',pose:sampleMotion(plan,elapsed)});
      if(elapsed<plan.durationSeconds){motionFrame.current=requestAnimationFrame(tick);}
      else { motionFrame.current=null; setMoving(false);setMotionMessage(`Target command reached; planned duration ${plan.durationSeconds.toFixed(2)} s. Await visual settling.`); }
    };
    motionFrame.current=requestAnimationFrame(tick);
  }

  function resetWorkspace() {
    dispatch({ type: 'RESET' });
    setResetVersion((version) => version + 1);
  }

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="main" id="workspace">
        <header className="topbar">
          <div className="topbar-left"><button type="button" className="mobile-menu icon-btn" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Icon name="menu" /></button><span>RoboMotion AI</span><span className="breadcrumb-slash">/</span><strong>Workspace</strong><span className="topbar-stage">STAGE 04</span></div>
          <div className="topbar-right"><span className="dot-status" /><span>OBJECT LAB ONLINE</span><span className="version-pill">v0.4.0</span></div>
        </header>

        <div className="page-content">
          <section className="intro" id="overview">
            <div className="eyebrow"><span className="eyebrow-line" /> ROBOTICS LABORATORY <span className="eyebrow-num">/ 004</span></div>
            <div className="intro-heading"><div><h1>The future is <em>built.</em></h1><p>Your interactive engineering workspace. Explore the 3D scene, establish the coordinate system, manually control the arm, solve target coordinates with forward/inverse kinematics, run time-bounded joint motion, and manipulate virtual samples between elevated stations.</p></div><div className="intro-orbit" aria-hidden="true"><span className="orbit-ring orb-a" /><span className="orbit-ring orb-b" /><span className="orbit-center" /></div></div>
          </section>

          <section className="workspace-section" aria-label="3D engineering environment">
            <div className="section-line"><div><span className="section-number">01</span><h2>Simulation workspace</h2></div><span className="section-aside">EXPLORE · ROTATE · INSPECT</span></div>
            <div className="workspace-layout">
              <div className="viewport-card">
                <div className="viewport-top"><div className="viewport-title"><span className="live-ring" /> LIVE 3D VIEWPORT <span className="viewport-divider">/</span> <span className="view-soft">ARTICULATED ARM</span></div><div className="viewport-top-right"><span>WEBGL</span><span className="mini-separator">·</span><span>{sceneReady ? 'RENDERER READY' : 'INITIALIZING'}</span></div></div>
                <div className="scene-window">
                  <SceneErrorBoundary>
                    <StarterScene settings={settings} resetVersion={resetVersion} pose={robotPose} target={goal} objects={manipulation.objects} heldId={manipulation.heldId} onReady={() => setSceneReady(true)} />
                  </SceneErrorBoundary>
                  <div className="scene-corner scene-top-left"><span className="scene-corner-title">ROBOT / RM-04</span><span>6 joints · Position IK · Procedural model</span></div>
                  <div className="scene-corner scene-bottom-left"><span className="scene-led" /> <span>{settings.animateBeacon ? 'BEACON ACTIVE' : 'BEACON PAUSED'}</span></div>
                  <div className="scene-corner scene-bottom-right"><span>DRAG TO ROTATE</span><span className="zoom-help">SCROLL TO ZOOM</span></div>
                </div>
                <div className="viewport-toolbar" aria-label="Scene tools">
                  <div className="toolbar-group">
                    <button className={`tool-button ${settings.showGrid ? 'tool-active' : ''}`} type="button" aria-pressed={settings.showGrid} onClick={() => dispatch({ type: 'TOGGLE_GRID' })} title="Toggle reference grid"><Icon name="grid" size={16} /> Grid</button>
                    <button className={`tool-button ${settings.showAxes ? 'tool-active' : ''}`} type="button" aria-pressed={settings.showAxes} onClick={() => dispatch({ type: 'TOGGLE_AXES' })} title="Toggle coordinate axes"><Icon name="axis" size={16} /> Axes</button>
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
                  <div className="foundation-callout"><span className="callout-symbol"><Icon name="spark" size={17}/></span><div><strong>Stage 4 · Object lab online</strong><p>Manual controls and analytic target positioning are available. Six elevated test stations support virtual sample pickup and placement.</p></div></div>
                </div>
                <div className="inspector-footer"><span className="footer-led"/>STAGE 04 / 08 <span className="footer-right">PICK & PLACE</span></div>
              </aside>
            </div>
          </section>

          <RobotControls pose={robotPose} dispatch={dispatchManual} />
          <TargetControls draft={targetDraft} onDraft={value=>{if(moving){cancelMotion();setMotionMessage("Motion cancelled because target coordinates changed.");}setApproachingObjectId(null);setTargetDraft(value);}} pose={robotPose} onMove={moveToTarget} onStop={()=>{cancelMotion();setMotionMessage('Motion stopped by user.');}} moving={moving} message={motionMessage} />

          <ManipulationControls state={manipulation} selectedId={selectedObjectId} selectedDockId={selectedDockId}
            onSelect={id=>{setSelectedObjectId(id);setApproachingObjectId(null);}} onDock={setSelectedDockId}
            onLoadPickup={loadPickup} onLoadDock={loadDock} onGrasp={graspSelected} onRelease={releaseSelected}
            onReset={resetObjects} message={manipulationMessage}/>

          <section className="metrics-section" aria-label="Project engineering indicators">
            <Stat label="DEVELOPMENT STAGE" value="04 / 08" sub="Object manipulation" />
            <Stat label="SCENE RENDERER" value="Three.js" sub="WebGL · React Three Fiber" />
            <Stat label="REFERENCE AXES" value="X · Y · Z" sub="Right-handed coordinate system" />
            <Stat label="ROBOT CONTROL" value="PICK + PLACE" sub="Discrete virtual grasping" />
          </section>

          <section className="roadmap" id="build-roadmap">
            <div className="section-line roadmap-line"><div><span className="section-number">03</span><h2>The build roadmap</h2></div><span className="section-aside">8 DEVELOPMENT STAGES</span></div>
            <div className="roadmap-list">
              {DEVELOPMENT_STAGES.map((stage, index) => (
                <div className={`roadmap-item ${index === 3 ? 'roadmap-current' : ''}`} key={stage}>
                  <span className="roadmap-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="roadmap-title">{stage}</span>
                  <span className={`roadmap-status ${index === 3 ? 'current-status' : ''}`}>{index < 3 ? 'COMPLETE' : index === 3 ? 'CURRENT STAGE' : 'UPCOMING'}</span>
                  <span className="roadmap-indicator">{index <= 3 ? <Icon name="check" size={15}/> : <Icon name="arrow" size={16}/>}</span>
                </div>
              ))}
            </div>
          </section>
          <footer className="page-footer"><span>ROBOMOTION AI <b>·</b> ENGINEERING FIRST</span><span>Stage 4 virtual manipulation · Discrete pick-and-place</span></footer>
        </div>
      </main>
    </div>
  );
}
