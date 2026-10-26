/** Stage 3 forward/inverse position kinematics for the exact Stage 2 scene hierarchy.
 * Coordinates: metres; right-handed world, Y up. Rotations: degrees. No collision dynamics.
 * TCP is the center of the parallel gripper's contact region (roll-axis invariant).
 */
import { clampJoint, degreesToRadians, JOINT_KEYS, JOINT_SPECS } from './robot.ts';
import type { RobotPose } from './robot.ts';

export interface Vector3 { x: number; y: number; z: number }
export const ROBOT_GEOMETRY = Object.freeze({
  shoulderHeight: 0.32 + 0.30 + 0.50,
  upperArm: 1.16,
  forearm: 0.96,
  toolExtension: 0.36 + 0.36,
  minToolHeight: 0.45,
  tolerance: 0.015,
});
export const MAX_TOOL_HEIGHT = ROBOT_GEOMETRY.shoulderHeight + ROBOT_GEOMETRY.upperArm + ROBOT_GEOMETRY.forearm + ROBOT_GEOMETRY.toolExtension;
export const MAX_REACH = ROBOT_GEOMETRY.upperArm + ROBOT_GEOMETRY.forearm + ROBOT_GEOMETRY.toolExtension;
export function distance(a: Vector3, b: Vector3): number { return Math.hypot(a.x-b.x, a.y-b.y, a.z-b.z); }
export function validPoint(p: Vector3): boolean { return Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z); }

/** Matches RobotArm's nested +Y link offsets and local Z pitch, followed by Y yaw. */
export function forwardKinematics(pose: RobotPose): Vector3 {
  const yaw = degreesToRadians(pose.base);
  const shoulder = degreesToRadians(pose.shoulder);
  const elbow = shoulder + degreesToRadians(pose.elbow);
  const tool = elbow + degreesToRadians(pose.wristPitch);
  const radial = ROBOT_GEOMETRY.upperArm*Math.sin(shoulder) + ROBOT_GEOMETRY.forearm*Math.sin(elbow) + ROBOT_GEOMETRY.toolExtension*Math.sin(tool);
  return {
    x: -radial*Math.cos(yaw),
    y: ROBOT_GEOMETRY.shoulderHeight + ROBOT_GEOMETRY.upperArm*Math.cos(shoulder) + ROBOT_GEOMETRY.forearm*Math.cos(elbow) + ROBOT_GEOMETRY.toolExtension*Math.cos(tool),
    z: radial*Math.sin(yaw),
  };
}

export type IKResult =
  | { ok: true; pose: RobotPose; residual: number; message: string }
  | { ok: false; reason: 'INVALID_INPUT' | 'WORKSPACE' | 'GEOMETRIC' | 'JOINT_LIMITS'; message: string };

const toDegrees = (a: number): number => a * 180 / Math.PI;
function wrapDegrees(n: number): number { return ((n + 180) % 360 + 360) % 360 - 180; }
function withinJoint(joint: 'base' | 'shoulder' | 'elbow' | 'wristPitch', n: number): boolean {
  const s=JOINT_SPECS[joint]; return n >= s.min-1e-8 && n <= s.max+1e-8;
}

/** Position-only analytic IK. Keeps tool upright (pitch relative to world = 0°).
 * Evaluates both elbow branches and both yaw directions, then selects nearest seed.
 * All joint-limit and FK-residual conditions must pass; impossible goals are never clipped.
 */
export function inverseKinematics(target: Vector3, seed: RobotPose): IKResult {
  if (!validPoint(target) || JOINT_KEYS.some(k => !Number.isFinite(seed[k]))) return { ok:false, reason:'INVALID_INPUT', message:'Enter finite X, Y and Z coordinates.' };
  const radius=Math.hypot(target.x,target.z);
  if (target.y < ROBOT_GEOMETRY.minToolHeight-1e-8 || target.y > MAX_TOOL_HEIGHT+1e-8 || radius > MAX_REACH+1e-8) {
    return { ok:false, reason:'WORKSPACE', message:'Target is outside the configured height or radial workspace bounds.' };
  }
  const { upperArm:l1,forearm:l2,toolExtension:lt,shoulderHeight:hs }=ROBOT_GEOMETRY;
  const h=target.y-hs-lt;
  const d2=radius*radius+h*h;
  const cosE=(d2-l1*l1-l2*l2)/(2*l1*l2);
  if (cosE > 1+1e-9 || cosE < -1-1e-9) return {ok:false,reason:'GEOMETRIC',message:'Target is outside the two-link reach for an upright gripper.'};
  const elbowMag=Math.acos(Math.min(1,Math.max(-1,cosE)));
  const yaws=radius < 1e-9 ? [seed.base, 0] : [toDegrees(Math.atan2(target.z,-target.x)), toDegrees(Math.atan2(-target.z,target.x))];
  const candidates: {pose:RobotPose;residual:number;cost:number}[]=[];
  for(const rawYaw of yaws){
    const yaw=wrapDegrees(rawYaw);
    if(!withinJoint('base',yaw)) continue;
    const yawRad=degreesToRadians(yaw);
    const signedRadial=-target.x*Math.cos(yawRad)+target.z*Math.sin(yawRad);
    for(const e of [elbowMag,-elbowMag]){
      const A=l1+l2*Math.cos(e), B=l2*Math.sin(e);
      const s=toDegrees(Math.atan2(signedRadial,h)-Math.atan2(B,A));
      const ee=toDegrees(e);
      const w=-s-ee;
      if(!withinJoint('shoulder',s)||!withinJoint('elbow',ee)||!withinJoint('wristPitch',w)) continue;
      const result:RobotPose={base:clampJoint('base',yaw),shoulder:clampJoint('shoulder',s),elbow:clampJoint('elbow',ee),wristPitch:clampJoint('wristPitch',w),wristRoll:seed.wristRoll,gripper:seed.gripper};
      const residual=distance(forwardKinematics(result),target);
      if(residual>ROBOT_GEOMETRY.tolerance) continue;
      const cost=(result.base-seed.base)**2*0.3+(result.shoulder-seed.shoulder)**2+(result.elbow-seed.elbow)**2+(result.wristPitch-seed.wristPitch)**2;
      candidates.push({pose:result,residual,cost});
    }
  }
  candidates.sort((a,b)=>a.cost-b.cost);
  if(!candidates.length) return {ok:false,reason:'JOINT_LIMITS',message:'Position cannot be reached with current joint limits while keeping the gripper upright.'};
  const {pose,residual}=candidates[0]!;
  return {ok:true,pose,residual,message:'Reachable upright-tool solution found within all joint limits.'};
}

export const formatMetres = (value:number): string => Number.isFinite(value) ? value.toFixed(3) : '—';
