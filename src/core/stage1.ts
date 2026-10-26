/** Pure Stage 1 domain contracts. No React, canvas or device dependencies. */
export type CameraPreset = 'isometric' | 'front' | 'top';
export type SceneAction =
  | { type: 'SET_CAMERA'; preset: CameraPreset }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_AXES' }
  | { type: 'TOGGLE_MOTION' }
  | { type: 'RESET' };

export interface SceneSettings {
  camera: CameraPreset;
  showGrid: boolean;
  showAxes: boolean;
  animateBeacon: boolean;
}

export interface CameraPosition {
  x: number;
  y: number;
  z: number;
}

export const INITIAL_SCENE: Readonly<SceneSettings> = Object.freeze({
  camera: 'isometric',
  showGrid: true,
  showAxes: true,
  animateBeacon: true,
});

/** All presets look toward the origin from outside the Stage 1 plinth. */
export const CAMERA_PRESETS: Readonly<Record<CameraPreset, CameraPosition>> = Object.freeze({
  isometric: Object.freeze({ x: 6.8, y: 5.2, z: 7.4 }),
  front: Object.freeze({ x: 0, y: 3.1, z: 10 }),
  top: Object.freeze({ x: 0.01, y: 11, z: 0.01 }),
});

export const WORKSPACE = Object.freeze({
  width: 10,
  depth: 10,
  groundY: -0.13,
  gridDivisions: 20,
  pedestalRadius: 1.35,
  unit: 'm',
});

export function sceneReducer(state: SceneSettings, action: SceneAction): SceneSettings {
  switch (action.type) {
    case 'SET_CAMERA':
      return { ...state, camera: action.preset };
    case 'TOGGLE_GRID':
      return { ...state, showGrid: !state.showGrid };
    case 'TOGGLE_AXES':
      return { ...state, showAxes: !state.showAxes };
    case 'TOGGLE_MOTION':
      return { ...state, animateBeacon: !state.animateBeacon };
    case 'RESET':
      return { ...INITIAL_SCENE };
    default:
      return assertNever(action);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unknown scene action: ${JSON.stringify(value)}`);
}

export function cameraDistance(preset: CameraPreset): number {
  const v = CAMERA_PRESETS[preset];
  return Math.hypot(v.x, v.y, v.z);
}

export const DEVELOPMENT_STAGES = Object.freeze([
  'Foundation & Workspace',
  '3D Robotic Arm',
  'Kinematics & Motion',
  'Object Manipulation',
  'Hand Gesture Recognition',
  'Gesture-to-Robot Control',
  'Engineering Dashboard',
  'Integration & QA',
] as const);

export const STAGE_NUMBER = 1 as const;
export const STAGE_TOTAL = DEVELOPMENT_STAGES.length;
