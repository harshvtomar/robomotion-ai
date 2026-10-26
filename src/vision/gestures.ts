/** Stage 5 only: pure geometry and stability analysis, no commands to the robot. */
export type Landmark = Readonly<{ x:number; y:number; z?:number }>;
export type GestureName = 'Open palm' | 'Fist' | 'Point' | 'Peace' | 'Pinch' | 'Unclassified' | 'No hand';
export type HandObservation = { gesture: GestureName; palmCenter: {x:number;y:number}; palmWidth:number; confidence:number; fingers:readonly boolean[] };
export type Calibration = {center:{x:number;y:number}; palmWidth:number; samples:number};
export const HAND_CONNECTIONS: ReadonlyArray<readonly [number,number]> = [
  [0,1],[1,2],[2,3],[3,4], [0,5],[5,6],[6,7],[7,8], [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],[13,17],[0,17],[17,18],[18,19],[19,20],
];
export const GESTURE_NAMES:readonly GestureName[]=['Open palm','Fist','Point','Peace','Pinch','Unclassified','No hand'];
const dist=(a:Landmark,b:Landmark)=>Math.hypot(a.x-b.x,a.y-b.y);
const isFinitePoint=(p:Landmark)=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=-0.5&&p.x<=1.5&&p.y>=-0.5&&p.y<=1.5;
export function analyseLandmarks(points: readonly Landmark[] | null | undefined):HandObservation | null {
  if(!points || points.length!==21 || !points.every(isFinitePoint)) return null;
  const at=(i:number):Landmark=>points[i]!; // exactly 21 finite landmarks verified above
  const palmWidth=dist(at(5),at(17));
  if(palmWidth<0.005) return null;
  const palmCenter={x:(at(0).x+at(5).x+at(9).x+at(13).x+at(17).x)/5,
    y:(at(0).y+at(5).y+at(9).y+at(13).y+at(17).y)/5};
  // Finger extended when fingertip is farther from its MCP knuckle than its PIP is.
  // Four fingers: index/middle/ring/pinky; thumb is used only for pinch recognition.
  const fingers=[8,12,16,20].map(tip=>dist(at(tip),at(tip-3)) > dist(at(tip-2),at(tip-3))*1.35);
  const pinch=dist(at(4),at(8))/palmWidth<0.40;
  const count=fingers.filter(Boolean).length;
  let gesture:GestureName='Unclassified';
  if(pinch) gesture='Pinch';
  else if(count===4) gesture='Open palm';
  else if(count===0) gesture='Fist';
  else if(fingers[0] && !fingers[1] && !fingers[2] && !fingers[3]) gesture='Point';
  else if(fingers[0] && fingers[1] && !fingers[2] && !fingers[3]) gesture='Peace';
  // Heuristic shape score (not a calibrated probability or model confidence).
  const confidence=gesture==='Unclassified'?0.35:0.80;
  return {gesture,palmCenter,palmWidth,confidence,fingers};
}
export function calibrate(samples: readonly (readonly Landmark[])[]): Calibration | null {
  if(samples.length<6) return null;
  const valid=samples.map(analyseLandmarks).filter((v):v is HandObservation=>v!==null);
  if(valid.length<6) return null;
  const widths=valid.map(v=>v.palmWidth).sort((a,b)=>a-b);
  const median=widths[Math.floor(widths.length/2)]!; // >=6 validated observations
  if(median<.02) return null;
  const near=valid.filter(v=>v.palmWidth>=median*.55&&v.palmWidth<=median*1.8);
  if(near.length<6) return null;
  return {center:{x:near.reduce((sum,v)=>sum+v.palmCenter.x,0)/near.length,
    y:near.reduce((sum,v)=>sum+v.palmCenter.y,0)/near.length}, palmWidth:median,samples:near.length};
}
export function calibratedOffset(observation:HandObservation, calibration:Calibration | null) {
  if(!calibration) return null;
  return {x:(observation.palmCenter.x-calibration.center.x)/calibration.palmWidth,
    y:(observation.palmCenter.y-calibration.center.y)/calibration.palmWidth,
    scale:observation.palmWidth/calibration.palmWidth};
}
export function stableGesture(history:readonly GestureName[], minSamples=3, window=5):GestureName {
  const latest=history.slice(-window);
  if(latest.length===0) return 'No hand';
  if(latest[latest.length-1]==='No hand') return 'No hand';
  const candidates=latest.filter(g=>g!=='Unclassified'&&g!=='No hand');
  const tally=new Map<GestureName,number>();
  for(const gesture of candidates) tally.set(gesture,(tally.get(gesture)??0)+1);
  let winner:GestureName='Unclassified',score=0;
  for(const [gesture,count] of tally) if(count>score){winner=gesture;score=count;}
  return score>=minSamples ? winner : 'Unclassified';
}
/** Deterministic hand mock for offline tests and demo. Not actual webcam inference. */
export function syntheticHand(gesture:Exclude<GestureName,'No hand'|'Unclassified'>, dx=0, dy=0):Landmark[] {
  const p:Array<{x:number;y:number;z:number}>=Array.from({length:21},()=>({x:.5+dx,y:.65+dy,z:0}));
  p[0]={x:.5+dx,y:.82+dy,z:0};
  for(const [idx,mcpX] of [[5,.40],[9,.47],[13,.54],[17,.61]] as const) {
    const extended = gesture==='Open palm' || (gesture==='Point' && idx===5) ||
      (gesture==='Peace' && (idx===5 || idx===9));
    const tipIdx=idx+3;
    const baseY=.59+dy;
    for(let j=0;j<4;j++){
      const xs=mcpX+dx;
      const ys = extended ? baseY-j*.09 : ([baseY,baseY-.09,baseY-.03,baseY-.015][j]??baseY);
      p[idx+j]={x:xs,y:ys,z:0};
    }
    if(!extended){p[tipIdx]={x:mcpX+dx,y:baseY-.02,z:0};}
  }
  p[1]={x:.37+dx,y:.70+dy,z:0};p[2]={x:.34+dx,y:.65+dy,z:0};
  p[3]={x:.32+dx,y:.61+dy,z:0};p[4]={x:.30+dx,y:.57+dy,z:0};
  if(gesture==='Pinch') {p[8]={x:.40+dx,y:.53+dy,z:0};p[4]={x:.405+dx,y:.527+dy,z:0};}
  return p;
}
