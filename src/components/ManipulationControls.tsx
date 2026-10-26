import { ALL_STATIONS, DROP_STATIONS, PICK_TOLERANCE } from '../core/manipulation';
import type { ManipulationState } from '../core/manipulation';

export function ManipulationControls({state,selectedId,selectedDockId,onSelect,onDock,onLoadPickup,onLoadDock,onGrasp,onRelease,onReset,message}:{
 state:ManipulationState;selectedId:string;selectedDockId:string;
 onSelect:(id:string)=>void;onDock:(id:string)=>void;
 onLoadPickup:()=>void;onLoadDock:()=>void;onGrasp:()=>void;onRelease:()=>void;onReset:()=>void;message:string;
}) {
 const selected=state.objects.find(o=>o.id===selectedId);
 const carrying=state.objects.find(o=>o.id===state.heldId);
 return <section className="manipulation-section" id="object-controls" aria-label="Stage 4 object manipulation controls">
  <div className="manipulation-head"><div><div className="section-kicker">STAGE 04 / VIRTUAL MANIPULATION</div><h2>Pick-and-place laboratory</h2><p>Move a selected sample between elevated test stations. Simulated contact and collision checks prevent unsafe virtual commands; no real hardware or full-body physics is represented.</p></div><span className="kinematics-tag">3 SAMPLES · 3 DOCKS</span></div>
  <div className="manipulation-status"><div><span className="manip-label">GRIPPER STATUS</span><strong>{carrying?`Carrying ${carrying.label}`:'Empty — ready to grasp'}</strong></div><div><span className="manip-label">SUCCESSFUL DOCKINGS</span><strong>{state.placedCount}</strong></div><button className="pose-reset" type="button" onClick={onReset}>Reset virtual objects</button></div>
  <div className="manipulation-grid">
    <div className="manip-card"><h3>01 <span>Pickup samples</span></h3>
    <label className="manip-label" htmlFor="pickup-select">SELECT SAMPLE</label>
    <select id="pickup-select" value={selectedId} onChange={e=>onSelect(e.target.value)}>{state.objects.map(o=><option key={o.id} value={o.id}>{o.label}{o.dockId?' · docked':''}</option>)}</select>
    <p>{selected?.label} · {selected?.shape} · radius {selected?.radius.toFixed(2)} m</p>
    <div className="manip-actions"><button type="button" onClick={onLoadPickup} disabled={!!state.heldId}>Load pickup coordinates</button><button className="manip-primary" type="button" onClick={onGrasp} disabled={!!state.heldId}>Grasp &amp; close</button></div>
    <div className="manip-hint">First load pickup coordinates, use <strong>Move to target</strong> in the kinematics console, then grasp within {PICK_TOLERANCE} m.</div></div>
    <div className="manip-card"><h3>02 <span>Placement docks</span></h3>
    <label className="manip-label" htmlFor="dock-select">SELECT DESTINATION</label>
    <select id="dock-select" value={selectedDockId} onChange={e=>onDock(e.target.value)}>{DROP_STATIONS.map(d=><option key={d.id} value={d.id}>{d.label} · {state.objects.some(o=>o.dockId===d.id)?'occupied':'available'}</option>)}</select>
    <p>Elevated fixtures match the limited upright-tool reachable workspace.</p>
    <div className="manip-actions"><button type="button" onClick={onLoadDock} disabled={!state.heldId}>Load destination</button><button className="manip-primary" type="button" onClick={onRelease} disabled={!state.heldId}>Release &amp; open</button></div>
    <div className="manip-hint">Release succeeds only near an unoccupied dock with sufficient object clearance. Invalid releases keep the object attached.</div></div>
    <div className="manip-card"><h3>03 <span>Engineering checks</span></h3><ul>
    <li>Workspace and floor clearance validation</li><li>Pickup proximity and gripper-closure checks</li><li>Sample-to-sample overlap rejection</li><li>Sampled tool / object path checks</li><li>Occupied-dock rejection</li></ul>
    <p>Six reference stations configured: {ALL_STATIONS.length}.</p></div>
  </div>
  <div className="manipulation-message" role="status" aria-live="polite">{message}</div>
  <div className="joint-footnote">Engineering limitation: collision checks approximate the tool tip and carried object against other samples; arm-link self-collision, support-column contact, gravity, grasp forces and real sensors are not simulated.</div>
 </section>;
}
