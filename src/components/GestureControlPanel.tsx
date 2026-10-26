import type {ControlMode} from '../core/gesture-control';

export function GestureControlPanel({mode,reason,ready,held,onArm,onDisable,onEmergency,onReset}: {
  mode:ControlMode; reason:string; ready:boolean; held:boolean;
  onArm:()=>void;onDisable:()=>void;onEmergency:()=>void;onReset:()=>void;
}){
  return <section className="gesture-drive" id="gesture-robot" aria-label="Stage 6 simulated robot gesture controller">
    <div className="gesture-drive-header">
      <div><div className="section-kicker">STAGE 06 / SIMULATION-ONLY TELEOPERATION</div><h2>Gesture-to-robot control</h2>
        <p>Explicitly arm a <strong>live calibrated webcam</strong> to steer the virtual robot. Synthetic fixtures cannot drive joints. No physical robot connections exist.</p></div>
      <span role="status" className={`drive-state drive-${mode}`}>{mode==='estop'?'● EMERGENCY STOP':mode==='armed'?'● ARMED · LIVE':'○ DISABLED'}</span>
    </div>
    <div className="gesture-drive-actions">
      <button type="button" className="drive-arm" onClick={onArm} disabled={mode!=='disabled'}>Arm live gestures</button>
      <button type="button" className="drive-disable" onClick={onDisable} disabled={mode!=='armed'}>Disable gesture control</button>
      <button type="button" className="drive-stop" onClick={onEmergency} disabled={mode==='estop'}>EMERGENCY STOP</button>
      <button type="button" className="drive-reset" onClick={onReset} disabled={mode!=='estop'}>Reset stop (stays disabled)</button>
    </div>
    <p className="drive-reason" role="status" aria-live="polite">{reason}</p>
    <div className="drive-guide">
      <div><b>Open palm</b><span>Bounded XYZ movement</span></div>
      <div><b>Point</b><span>Fine XYZ movement</span></div>
      <div><b>Fist</b><span>Hold position</span></div>
      <div><b>Pinch</b><span>Close virtual gripper</span></div>
      <div><b>Peace</b><span>Open virtual gripper</span></div>
      <div><b>No hand</b><span>Automatic disarm</span></div>
    </div>
    <p className="drive-safety">{held?'Virtual sample held: arming blocked. ':''} {ready?'Live camera + calibration available. ':'To arm: start the webcam, calibrate a steady hand, and present a stable open palm or point. '}Manual pose/IK/object commands override gestures. Losing the hand or webcam disarms immediately. An E-stop locks ALL simulated motion until manually reset. These are virtual safety interlocks, not certified physical safety controls.</p>
  </section>;
}
