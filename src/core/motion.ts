/** Stage 3 coordinated finite-duration, joint-space motion trajectory (commanded, not encoder feedback). */
import { JOINT_KEYS, JOINT_SPECS } from './robot.ts';
import type { JointKey, RobotPose } from './robot.ts';
export const MAX_JOINT_SPEED: Readonly<Record<JointKey,number>> = Object.freeze({base:65, shoulder:55, elbow:65, wristPitch:80, wristRoll:85, gripper:65});
export interface MotionPlan { from:RobotPose; to:RobotPose; durationSeconds:number }
export function planMotion(from:RobotPose,to:RobotPose): MotionPlan {
  let duration=0.35;
  for(const joint of JOINT_KEYS){
    if(!Number.isFinite(from[joint]) || !Number.isFinite(to[joint])) throw new Error('Non-finite pose');
    const s=JOINT_SPECS[joint];
    if(from[joint]<s.min||from[joint]>s.max||to[joint]<s.min||to[joint]>s.max) throw new Error('Pose exceeds joint limits');
    // Smoothstep derivative max=1.5, hence duration must account for peak speed.
    duration=Math.max(duration, 1.5*Math.abs(to[joint]-from[joint])/MAX_JOINT_SPEED[joint]);
  }
  return {from:{...from},to:{...to},durationSeconds:duration};
}
export function sampleMotion(plan:MotionPlan,seconds:number):RobotPose {
  if(!Number.isFinite(seconds)) throw new Error('Invalid trajectory time');
  const progress=Math.min(1,Math.max(0,seconds/plan.durationSeconds));
  const alpha=progress*progress*(3-2*progress);
  return Object.fromEntries(JOINT_KEYS.map(j=>[j,plan.from[j]+(plan.to[j]-plan.from[j])*alpha])) as unknown as RobotPose;
}
