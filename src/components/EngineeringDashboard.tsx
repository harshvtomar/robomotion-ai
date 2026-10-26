import { useMemo, useState } from 'react';
import type { RobotPose } from '../core/robot';
import type { Vector3 } from '../core/kinematics';
import { distance, formatMetres, forwardKinematics } from '../core/kinematics';
import type { ControlMode } from '../core/gesture-control';
import type { GestureName } from '../vision/gestures';
import { DEMO_STEPS, diagnosticCounts, nextDemoStep } from '../core/diagnostics';
import type { DemoStep, DiagnosticEvent, DiagnosticKind } from '../core/diagnostics';

type Props={
 pose:RobotPose; target:Vector3|null; mode:ControlMode; reason:string;
 observedGesture:GestureName|null; source:string; confidence:number|null; calibrated:boolean;
 moving:boolean; heldLabel:string|null; dockings:number; events:readonly DiagnosticEvent[];
 onExportCsv:()=>void;onExportJson:()=>void;onClear:()=>void;
};
const fmt=(n:number)=>Number.isFinite(n)?formatMetres(n):'—';
export function EngineeringDashboard({pose,target,mode,reason,observedGesture,source,confidence,calibrated,moving,heldLabel,dockings,events,onExportCsv,onExportJson,onClear}:Props){
 const [filter,setFilter]=useState<'all'|DiagnosticKind>('all');
 const [demoDone,setDemoDone]=useState<DemoStep[]>([]);
 const [demoActive,setDemoActive]=useState(false);
 const tool=forwardKinematics(pose);
 const error=target?distance(tool,target):null;
 const totals=useMemo(()=>diagnosticCounts(events),[events]);
 const visible=useMemo(()=>events.filter(e=>filter==='all'||e.kind===filter).slice(-50).reverse(),[events,filter]);
 const next=nextDemoStep(demoDone);
 return <section id="diagnostics" className="diagnostics-section" aria-label="Stage 7 engineering diagnostics">
   <div className="diagnostics-heading">
    <div><div className="section-kicker">STAGE 07 / ENGINEERING ANALYTICS</div><h2>Diagnostics & mission dashboard</h2><p>Current simulated pose, controller state, session-only events, and guided demonstration. No video frames or hand landmarks are stored or exported.</p></div>
    <span className="kinematics-tag">LOCAL SESSION</span>
   </div>
   <div className="diagnostic-summary" aria-label="Live simulator metrics">
    <article><span>TOOL POSITION</span><strong>{fmt(tool.x)} / {fmt(tool.y)} / {fmt(tool.z)}</strong><small>X / Y / Z metres · commanded FK</small></article>
    <article><span>TARGET ERROR</span><strong>{error===null?'—':`${fmt(error)} m`}</strong><small>Calculated, not physically measured</small></article>
    <article><span>GESTURE DRIVE</span><strong>{mode==='armed'?'ARMED':mode==='estop'?'E-STOP':'DISABLED'}</strong><small>{calibrated?'Calibrated':'Uncalibrated'} · {source}</small></article>
    <article><span>LIVE GESTURE</span><strong>{observedGesture??'No observation'}</strong><small>{confidence===null?'No current score':`${Math.round(confidence*100)}% classifier geometry score`}</small></article>
    <article><span>COMPLETED TARGETS</span><strong>{totals.motions}</strong><small>Session motion commands</small></article>
    <article><span>SAFETY INTERVENTIONS</span><strong>{totals.safety}</strong><small>Recorded blocks, stops and tracking loss</small></article>
    <article><span>DOCKED OBJECTS</span><strong>{dockings}</strong><small>{heldLabel?`Carrying ${heldLabel}`:'No virtual sample held'}</small></article>
    <article><span>JOINT / MOTION STATE</span><strong>{moving?'TARGET MOVING':'SETTLED / IDLE'}</strong><small>Base {pose.base.toFixed(1)}° · Shoulder {pose.shoulder.toFixed(1)}° · Elbow {pose.elbow.toFixed(1)}°</small></article>
   </div>
   <div className="diagnostic-columns">
    <div className="diagnostic-card">
     <div className="diagnostic-card-head"><h3>Safety and control</h3><span className={`drive-state drive-${mode}`}>{mode.toUpperCase()}</span></div>
     <p className="diagnostic-reason" role="status">{reason}</p>
     <dl className="diagnostic-detail"><div><dt>Gripper opening</dt><dd>{pose.gripper.toFixed(1)}%</dd></div><div><dt>Wrist pitch / roll</dt><dd>{pose.wristPitch.toFixed(1)}° / {pose.wristRoll.toFixed(1)}°</dd></div><div><dt>Manual override priority</dt><dd>Always enabled</dd></div><div><dt>Recorded arming events</dt><dd>{totals.teleopArms}</dd></div><div><dt>Completed target duration</dt><dd>{(totals.motionDurationMs/1000).toFixed(2)} s</dd></div></dl>
    </div>
    <div className="diagnostic-card">
     <div className="diagnostic-card-head"><h3>Guided five-step demo</h3><span>{demoDone.length}/5</span></div>
     <p className="diagnostic-muted">Instructions only. The dashboard never arms a camera or moves the robot automatically.</p>
     {DEMO_STEPS.map(step=><label key={step.id} className="demo-step"><input type="checkbox" disabled={!demoActive} checked={demoDone.includes(step.id)} onChange={e=>setDemoDone(old=>e.target.checked?[...old,step.id]:old.filter(s=>s!==step.id))}/><span><strong>{step.label}</strong><small>{step.instruction}</small></span></label>)}
     <div className="diagnostic-buttons"><button type="button" onClick={()=>{setDemoActive(true);setDemoDone([]);}}>{demoActive?'Restart guide':'Start guided demo'}</button><button type="button" disabled={!demoActive} onClick={()=>setDemoActive(false)}>End guide</button></div>
     <p className="diagnostic-muted" aria-live="polite">{!demoActive?'Begin when ready.':next?`Next step: ${DEMO_STEPS.find(x=>x.id===next)?.label}`:'Guide finished. Verify outcomes manually.'}</p>
    </div>
   </div>
   <div className="diagnostic-card event-panel">
    <div className="diagnostic-card-head"><div><h3>Session event timeline</h3><p className="diagnostic-muted">Newest first · capped at 240 events · cleared on page reload</p></div><span>{events.length} events</span></div>
    <div className="event-actions">
     <label>Category <select aria-label="Filter diagnostic events" value={filter} onChange={e=>setFilter(e.target.value as 'all'|DiagnosticKind)}><option value="all">All</option>{(['motion','safety','control','gesture','object','camera','system'] as const).map(x=><option key={x} value={x}>{x}</option>)}</select></label>
     <button type="button" onClick={onExportCsv} disabled={events.length===0}>Export CSV</button>
     <button type="button" onClick={onExportJson} disabled={events.length===0}>Export JSON</button>
     <button type="button" onClick={onClear} disabled={events.length===0}>Clear events</button>
    </div>
    <div className="event-scroll" role="region" aria-label="Session event log" tabIndex={0}>
     {visible.length===0?<p className="diagnostic-muted">No matching events.</p>:<table className="event-table"><thead><tr><th>Time</th><th>Category</th><th>Event</th><th>Details</th></tr></thead><tbody>{visible.map(event=><tr key={event.id}><td>{new Date(event.at).toLocaleTimeString()}</td><td><span className={`event-type type-${event.kind}`}>{event.kind}</span></td><td>{event.code.replaceAll('_',' ')}</td><td>{event.detail}</td></tr>)}</tbody></table>}
    </div>
   </div>
 </section>;
}
