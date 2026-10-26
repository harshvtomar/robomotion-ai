/** Bounded joint-space control shared by Stage 2 manual and Stage 3 target modes. */
export const JOINT_KEYS = ['base', 'shoulder', 'elbow', 'wristPitch', 'wristRoll', 'gripper'] as const;
export type JointKey = (typeof JOINT_KEYS)[number];

export interface JointSpec {
  label: string;
  min: number;
  max: number;
  step: number;
  unit: '°' | '%';
  description: string;
}

export const JOINT_SPECS: Readonly<Record<JointKey, Readonly<JointSpec>>> = Object.freeze({
  base: Object.freeze({ label: 'Base rotation', min: -170, max: 170, step: 1, unit: '°', description: 'Yaw · vertical rotation' }),
  shoulder: Object.freeze({ label: 'Shoulder', min: -80, max: 80, step: 1, unit: '°', description: 'Upper arm pitch' }),
  elbow: Object.freeze({ label: 'Elbow', min: -135, max: 135, step: 1, unit: '°', description: 'Forearm relative pitch' }),
  wristPitch: Object.freeze({ label: 'Wrist pitch', min: -100, max: 100, step: 1, unit: '°', description: 'Tool head pitch' }),
  wristRoll: Object.freeze({ label: 'Wrist roll', min: -170, max: 170, step: 1, unit: '°', description: 'Tool head roll' }),
  gripper: Object.freeze({ label: 'Gripper opening', min: 0, max: 100, step: 1, unit: '%', description: 'Parallel finger spacing' }),
});

export type RobotPose = Readonly<Record<JointKey, number>>;
export const HOME_POSE: RobotPose = Object.freeze({
  base: 25, shoulder: -28, elbow: 66, wristPitch: -38, wristRoll: 0, gripper: 55,
});

export const POSE_PRESETS = Object.freeze({
  home: HOME_POSE,
  upright: Object.freeze({ base: 0, shoulder: 0, elbow: 0, wristPitch: 0, wristRoll: 0, gripper: 70 }),
  inspect: Object.freeze({ base: -40, shoulder: -40, elbow: 95, wristPitch: -55, wristRoll: 38, gripper: 100 }),
  folded: Object.freeze({ base: 15, shoulder: 43, elbow: -108, wristPitch: 55, wristRoll: 0, gripper: 12 }),
} satisfies Record<string, RobotPose>);
export type PosePreset = keyof typeof POSE_PRESETS;

export type RobotAction =
  | { type: 'SET_JOINT'; joint: JointKey; value: number }
  | { type: 'NUDGE_JOINT'; joint: JointKey; direction: -1 | 1 }
  | { type: 'APPLY_PRESET'; preset: PosePreset }
  | { type: 'RESET_POSE' }
  | { type: 'SET_POSE'; pose: RobotPose };

export function clampJoint(joint: JointKey, value: number): number {
  if (!Object.prototype.hasOwnProperty.call(JOINT_SPECS, joint)) throw new Error(`Unknown joint: ${joint}`);
  if (!Number.isFinite(value)) throw new Error(`Non-finite joint value: ${joint}`);
  const { min, max } = JOINT_SPECS[joint];
  return Math.round(Math.min(max, Math.max(min, value)) * 100) / 100;
}

export function robotReducer(pose: RobotPose, action: RobotAction): RobotPose {
  switch (action.type) {
    case 'SET_JOINT': {
      const value = clampJoint(action.joint, action.value);
      return pose[action.joint] === value ? pose : { ...pose, [action.joint]: value };
    }
    case 'NUDGE_JOINT': {
      const value = clampJoint(action.joint, pose[action.joint] + action.direction * JOINT_SPECS[action.joint].step);
      return pose[action.joint] === value ? pose : { ...pose, [action.joint]: value };
    }
    case 'APPLY_PRESET': {
      const preset = POSE_PRESETS[action.preset];
      if (!preset) throw new Error(`Unknown preset: ${action.preset}`);
      return { ...preset };
    }
    case 'RESET_POSE':
      return { ...HOME_POSE };
    case 'SET_POSE':
      return Object.fromEntries(JOINT_KEYS.map((joint) => [joint, clampJoint(joint, action.pose[joint])])) as unknown as RobotPose;
    default:
      throw new Error(`Unknown robot action: ${JSON.stringify(action)}`);
  }
}

/** Delta-time invariant exponential smoothing for visuals, never overshoots target. */
export function easeJoint(current: number, target: number, deltaSeconds: number, rate = 9): number {
  if (![current, target, deltaSeconds, rate].every(Number.isFinite)) throw new Error('Invalid joint interpolation input');
  if (deltaSeconds <= 0 || rate <= 0) return current;
  if (Math.abs(target - current) < 0.015) return target;
  const alpha = 1 - Math.exp(-rate * Math.min(deltaSeconds, 0.1));
  return current + (target - current) * alpha;
}

/** Gripper is a width command, not a physics-based grasp (reserved for Stage 4). */
export function fingerOffset(openingPercent: number): number {
  const proportion = clampJoint('gripper', openingPercent) / 100;
  return 0.10 + 0.16 * proportion;
}

export const degreesToRadians = (degrees: number): number => degrees * Math.PI / 180;
