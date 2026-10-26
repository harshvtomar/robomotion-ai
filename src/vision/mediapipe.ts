/** Lazy-loaded inference adapter. MediaPipe is never loaded in synthetic mode. */
import type {Landmark} from './gestures';
export type HandResult = {points:Landmark[];handedness:string;score:number};
export type Tracker = {detect(video:HTMLVideoElement,timestampMs:number):HandResult|null;close():void};
const MEDIA_PIPE_VERSION='1.1.1';
const MODEL='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
export async function createHandTracker():Promise<Tracker>{
  const {HandLandmarker,FilesetResolver}=await import('@mediapipe/tasks-vision');
  const fileset=await FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIA_PIPE_VERSION}/wasm`);
  // CPU first for compatibility. Inference is synchronous: cap processing frequency in the UI.
  const detector=await HandLandmarker.createFromOptions(fileset,{
    baseOptions:{modelAssetPath:MODEL,delegate:'CPU'},runningMode:'VIDEO',numHands:1,
    minHandDetectionConfidence:.6,minHandPresenceConfidence:.6,minTrackingConfidence:.55,
  });
  return {detect(video,timestampMs){
    const result=detector.detectForVideo(video,timestampMs);
    const points=result.landmarks[0];if(!points) return null;
    const handed=result.handedness?.[0]?.[0];
    return {points:points.map(p=>({x:p.x,y:p.y,z:p.z})),handedness:handed?.categoryName??'Unknown',score:handed?.score??0};
  },close(){detector.close();}};
}
