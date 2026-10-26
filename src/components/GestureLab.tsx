import type {GestureFrame} from '../core/gesture-control';
import {useEffect,useRef,useState} from 'react';
import {analyseLandmarks,calibrate,calibratedOffset,HAND_CONNECTIONS,stableGesture,syntheticHand} from '../vision/gestures';
import type {Calibration,GestureName,Landmark,HandObservation} from '../vision/gestures';
import {createHandTracker} from '../vision/mediapipe';
import type {Tracker} from '../vision/mediapipe';

type Mode='idle'|'loading'|'camera'|'synthetic'|'error';
const DEMO_GESTURES=['Open palm','Fist','Point','Peace','Pinch'] as const;
function paint(canvas:HTMLCanvasElement | null,landmarks:readonly Landmark[]|null){
  if(!canvas) return;
  const ctx=canvas.getContext('2d');if(!ctx) return;
  const w=canvas.width,h=canvas.height;
  ctx.clearRect(0,0,w,h);
  if(!landmarks) return;
  ctx.lineWidth=3;ctx.strokeStyle='#61d9cb';ctx.lineCap='round';
  for(const [a,b] of HAND_CONNECTIONS){const start=landmarks[a],end=landmarks[b];if(!start||!end) continue;ctx.beginPath();ctx.moveTo(start.x*w,start.y*h);ctx.lineTo(end.x*w,end.y*h);ctx.stroke();}
  for(let i=0;i<landmarks.length;i++){const point=landmarks[i];if(!point) continue;ctx.fillStyle=i===4||i===8?'#ffaa77':'#e5f5fa';ctx.beginPath();ctx.arc(point.x*w,point.y*h,i===4||i===8?6:4,0,Math.PI*2);ctx.fill();}
}
const safeCameraError=(error:unknown):string=>{
  const obj=error as {name?:string;message?:string};
  if(obj?.name==='NotAllowedError'||obj?.name==='PermissionDeniedError') return 'Camera permission denied. Use Chrome site settings to allow access, or try Synthetic mode.';
  if(obj?.name==='NotFoundError') return 'No webcam found. Connect a camera or use Synthetic mode.';
  if(obj?.name==='NotReadableError') return 'Camera busy or unavailable. Close competing camera apps and retry.';
  return `Camera or model could not start: ${obj?.message??'unknown error'}. Synthetic mode works offline.`;
};

/** Stage 5 is explicitly observational: NO robot joint, IK or manipulation dispatches. */
export function GestureLab({onFrame,onUnavailable}: {onFrame?:(frame:GestureFrame)=>void;onUnavailable?:(reason:string)=>void}){
  const onFrameRef=useRef(onFrame);onFrameRef.current=onFrame;
  const onUnavailableRef=useRef(onUnavailable);onUnavailableRef.current=onUnavailable;
  const calibrationRef=useRef<Calibration|null>(null);
  const videoRef=useRef<HTMLVideoElement>(null);
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const streamRef=useRef<MediaStream|null>(null);
  const trackerRef=useRef<Tracker|null>(null);
  const rafRef=useRef<number|null>(null);
  const sessionRef=useRef(0);
  const historyRef=useRef<GestureName[]>([]);
  const calibrationSamplesRef=useRef<Landmark[][]>([]);
  const calibrationPendingRef=useRef(false);
  const lastSeenFrameRef=useRef(-1);
  const lastDetectedRef=useRef(-Infinity);
  const [mode,setMode]=useState<Mode>('idle');
  const [message,setMessage]=useState('Webcam is OFF. Start it explicitly, or explore using synthetic gestures.');
  const [latest,setLatest]=useState<HandObservation|null>(null);
  const [stable,setStable]=useState<GestureName>('No hand');
  const [handedness,setHandedness]=useState('—');
  const [modelScore,setModelScore]=useState(0);
  const [calibration,setCalibration]=useState<Calibration|null>(null);
  const [calibrationProgress,setCalibrationProgress]=useState(0);
  const [syntheticSelected,setSyntheticSelected]=useState<GestureName>('Open palm');
  const [frames,setFrames]=useState(0);

  function releaseCamera(){
    onUnavailableRef.current?.('Live webcam session stopped or replaced.');
    sessionRef.current++;
    if(rafRef.current!==null){cancelAnimationFrame(rafRef.current);rafRef.current=null;}
    for(const track of streamRef.current?.getTracks()??[]) track.stop();
    streamRef.current=null;
    if(videoRef.current){videoRef.current.pause();videoRef.current.srcObject=null;}
    trackerRef.current?.close();trackerRef.current=null;
  }
  function resetTracking(){historyRef.current=[];setStable('No hand');setLatest(null);setFrames(0);setHandedness('—');setModelScore(0);lastSeenFrameRef.current=-1;lastDetectedRef.current=-Infinity;paint(canvasRef.current,null);}
  function stop(){releaseCamera();resetTracking();setMode('idle');setMessage('Webcam stopped and tracks released.');calibrationPendingRef.current=false;setCalibrationProgress(0);setCalibration(null);calibrationRef.current=null;}
  useEffect(()=>{
    const hidden=()=>{if(document.visibilityState==='hidden'&&streamRef.current) stop();};
    document.addEventListener('visibilitychange',hidden);
    return()=>{document.removeEventListener('visibilitychange',hidden);releaseCamera();};
    // Lifecycle intentionally installs once; releaseCamera is ref-based.
  },[]); // eslint-disable-line react-hooks/exhaustive-deps

  function ingest(points:Landmark[]|null,origin:'camera'|'synthetic',label='—',score=0){
    const observation=analyseLandmarks(points);
    const detected=observation?.gesture??'No hand';
    historyRef.current=[...historyRef.current.slice(-4),detected];
    const stableNow=stableGesture(historyRef.current);
    setStable(stableNow);
    setLatest(observation);
    setFrames(value=>value+1);
    setHandedness(label);
    setModelScore(score);
    paint(canvasRef.current,points);
    if(calibrationPendingRef.current&&points&&observation?.gesture==='Open palm'){
      calibrationSamplesRef.current.push(points.map(p=>({...p})));
      setCalibrationProgress(calibrationSamplesRef.current.length);
      if(calibrationSamplesRef.current.length>=12){
        const result=calibrate(calibrationSamplesRef.current);
        calibrationPendingRef.current=false;
        setCalibrationProgress(0);
        if(result){setCalibration(result);calibrationRef.current=result;setMessage(`Calibration saved from ${result.samples} ${origin} samples. Offsets are for display only.`);}
        else setMessage('Calibration was unstable. Keep your hand steady and retry.');
      }
    }
    onFrameRef.current?.({source:origin,gesture:stableNow,observation,calibration:calibrationRef.current,atMs:performance.now()});
  }
  async function startCamera(){
    if(mode==='loading'||mode==='camera') return;
    releaseCamera();resetTracking();setCalibration(null);calibrationRef.current=null;setMode('loading');setMessage('Requesting camera access and loading the MediaPipe model…');
    const session=sessionRef.current;
    try {
      if(!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new Error('A secure localhost or HTTPS origin and a working camera are required');
      const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:640},height:{ideal:480},frameRate:{ideal:24,max:30}}});
      if(session!==sessionRef.current){stream.getTracks().forEach(t=>t.stop());return;}
      streamRef.current=stream;
      stream.getVideoTracks()[0]?.addEventListener('ended',()=>{if(streamRef.current===stream)stop();},{once:true});
      const video=videoRef.current;
      if(!video) throw new Error('Camera preview was not mounted');
      video.srcObject=stream;
      await video.play();
      const tracker=await createHandTracker();
      if(session!==sessionRef.current){tracker.close();return;}
      trackerRef.current=tracker;
      setMode('camera');setMessage('Live landmark detection is active. No video is uploaded or recorded by this application.');
      const frame=(timestamp:number)=>{
        if(session!==sessionRef.current||!trackerRef.current||!streamRef.current) return;
        // Limit expensive synchronous inference to ~10 fps; also avoid duplicate decoded frames.
        if(timestamp-lastDetectedRef.current>=95&&video.readyState>=2&&video.currentTime!==lastSeenFrameRef.current){
          lastDetectedRef.current=timestamp;lastSeenFrameRef.current=video.currentTime;
          try {
            const result=trackerRef.current.detect(video,timestamp);
            ingest(result?.points??null,'camera',result?.handedness??'—',result?.score??0);
          } catch(err){setMessage(safeCameraError(err));releaseCamera();setMode('error');return;}
        }
        rafRef.current=requestAnimationFrame(frame);
      };
      rafRef.current=requestAnimationFrame(frame);
    } catch(err){if(session===sessionRef.current){releaseCamera();resetTracking();setMode('error');setMessage(safeCameraError(err));}}
  }
  function synthetic(gesture:GestureName){
    releaseCamera();resetTracking();setCalibration(null);calibrationRef.current=null;setMode('synthetic');setSyntheticSelected(gesture);
    const points=gesture==='No hand'||gesture==='Unclassified'?null:syntheticHand(gesture);
    for(let i=0;i<5;i++) ingest(points,'synthetic','Fixture',1);
    setMessage(`${gesture} is a deterministic synthetic fixture, NOT a live camera prediction. Robot control remains disconnected.`);
  }
  function beginCalibration(){
    if(mode!=='camera'&&mode!=='synthetic'){setMessage('Start live video or select a synthetic gesture before calibrating.');return;}
    onUnavailableRef.current?.('Recalibration started; motion disarmed.');
    calibrationRef.current=null;setCalibration(null);
    calibrationSamplesRef.current=[];calibrationPendingRef.current=true;setCalibrationProgress(0);
    setMessage('Hold a steady, fully visible OPEN PALM for 12 detected frames.');
    if(mode==='synthetic'){
      const pts=syntheticSelected==='No hand'||syntheticSelected==='Unclassified'?null:syntheticHand(syntheticSelected);
      if(!pts){calibrationPendingRef.current=false;setMessage('Select a hand fixture before calibrating.');return;}
      for(let i=0;i<12;i++) ingest(pts,'synthetic','Fixture',1);
    }
  }
  const offset=latest?calibratedOffset(latest,calibration):null;
  return (
    <section className="gesture-section" id="gesture-controls" aria-label="Stage 5 hand gesture recognition laboratory">
      <div className="joint-section-header"><div><div className="section-kicker">STAGE 05 / COMPUTER VISION</div><h2>Hand gesture laboratory</h2><p>Observe 21 hand landmarks, classify gestures and calibrate a neutral palm position. Stage 5 recognizes hand landmarks; the independent Stage 6 panel can optionally drive only the virtual robot after explicit arming.</p></div><span className="gesture-live-tag">OBSERVATION ONLY</span></div>
      <div className="gesture-layout">
        <div className="gesture-visual-panel">
          <div className="gesture-media" aria-label="Camera and landmark overlay">
            <video ref={videoRef} playsInline muted autoPlay aria-label="Local webcam preview" className={mode==='camera'?'gesture-video gesture-visible':'gesture-video'} />
            <canvas ref={canvasRef} width={640} height={480} className="gesture-overlay" aria-label="Detected hand skeleton overlay" />
            {mode!=='camera'&&<div className="gesture-empty"><span className="gesture-empty-symbol">✋</span><strong>{mode==='synthetic'?'SYNTHETIC HAND FIXTURE':'WEBCAM OFF'}</strong><span>{mode==='synthetic'?'The displayed landmarks are simulated':'Start camera to request permission'}</span></div>}
            <span className="gesture-media-status">{mode.toUpperCase()} · {mode==='camera'?'LOCAL VIDEO':'NO LIVE VIDEO'}</span>
          </div>
          <div className="gesture-action-row">
            <button type="button" className="gesture-primary" onClick={startCamera} disabled={mode==='camera'||mode==='loading'}>{mode==='loading'?'Loading model…':'Start webcam'}</button>
            <button type="button" className="gesture-secondary" onClick={stop}>Stop & release</button>
            <button type="button" className="gesture-secondary" onClick={beginCalibration} disabled={mode!=='camera'&&mode!=='synthetic'}>Calibrate</button>
          </div>
          <p className="gesture-message" role="status" aria-live="polite">{message}</p>
          <p className="gesture-privacy">Webcam is opt-in. Inference runs locally through MediaPipe. Model/WASM assets load from Google CDN/storage and jsDelivr; MediaPipe may collect SDK diagnostics. Camera frames are not deliberately transmitted by this app.</p>
        </div>
        <div className="gesture-info">
          <div className="gesture-stat-card"><span>SMOOTHED GESTURE</span><strong>{stable}</strong><small>Requires at least 3 agreeing readings in 5 frames</small></div>
          <div className="gesture-info-grid"><div><span>RAW CLASSIFICATION</span><b>{latest?.gesture??'No hand'}</b></div><div><span>LANDMARKS</span><b>{latest?'21 / 21':'0 / 21'}</b></div><div><span>HANDEDNESS</span><b>{handedness}</b></div><div><span>HANDEDNESS SCORE</span><b>{modelScore?`${(modelScore*100).toFixed(0)}%`:'—'}</b></div><div><span>FRAMES PROCESSED</span><b>{frames}</b></div><div><span>GEOMETRY HEURISTIC</span><b>{latest?`${Math.round(latest.confidence*100)}%`:'—'}</b></div></div>
          <div className="gesture-calibration"><h3>Neutral-palm calibration</h3><p>{calibration?`Calibrated from ${calibration.samples} frames (palm width ${calibration.palmWidth.toFixed(3)}).`:'Not calibrated yet. Keep a steady hand centered in the frame and press Calibrate.'}</p><div className="gesture-progress"><span style={{width:`${calibrationPendingRef.current?calibrationProgress/12*100:calibration?100:0}%`}} /></div><small>{calibrationPendingRef.current?`${calibrationProgress} / 12 samples`:offset?`Normalized offset x ${offset.x.toFixed(2)}, y ${offset.y.toFixed(2)}, scale ${offset.scale.toFixed(2)}×`:'Calibration does not move the robot'}</small></div>
        </div>
      </div>
      <div className="gesture-synthetic"><div><div className="section-kicker">OFFLINE / DETERMINISTIC</div><h3>Synthetic gesture test bench</h3><p>Inject known 21-point fixtures without camera access. Useful for repeatable gesture-classifier checks and Stage 6 preparation.</p></div><div className="gesture-fixture-buttons">{DEMO_GESTURES.map(g=><button type="button" key={g} onClick={()=>synthetic(g)} aria-pressed={mode==='synthetic'&&syntheticSelected===g}>{g}</button>)}<button type="button" onClick={()=>synthetic('No hand')}>No hand</button></div></div>
      <div className="joint-footnote">Stage 5 recognition remains independent of arm motion. Stage 6 may consume live, calibrated observations only after explicit operator arming. Synthetic fixtures cannot command the robot; no physical hardware is connected.</div>
    </section>
  );
}
