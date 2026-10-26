import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { Group } from 'three';
import { CAMERA_PRESETS, WORKSPACE } from '../core/stage1';
import type { CameraPreset, SceneSettings } from '../core/stage1';
import type { RobotPose } from '../core/robot';
import type { Vector3 } from '../core/kinematics';
import { RobotArm } from './RobotArm';
import { VirtualStations } from './VirtualObjects';
import type { VirtualObject } from '../core/manipulation';

function CameraRig({ preset, resetVersion, focusRobot }: { preset: CameraPreset; resetVersion: number; focusRobot: boolean }) {
  const { camera, invalidate } = useThree();
  useEffect(() => {
    const pose = CAMERA_PRESETS[preset];
    const scale=focusRobot ? 0.73 : 1;
    const targetY=focusRobot ? 1.8 : 1.35;
    camera.position.set(pose.x*scale, targetY+(pose.y-1.35)*scale, pose.z*scale);
    camera.lookAt(0, targetY, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, preset, resetVersion, focusRobot, invalidate]);
  return <OrbitControls key={`${preset}:${resetVersion}:${focusRobot}`} target={[0, focusRobot ? 1.8 : 1.35, 0]} enableDamping dampingFactor={0.08} minDistance={2.8} maxDistance={19} minPolarAngle={0.06} maxPolarAngle={Math.PI / 2.04} enablePan={false} />;
}

function CalibrationBeacon({ running }: { running: boolean }) {
  const beacon = useRef<Group>(null);
  useFrame((_, delta) => {
    if (beacon.current && running) beacon.current.rotation.y += Math.min(delta, 0.05) * 0.38;
  });
  return (
    <group ref={beacon} position={[0, 1.34, 0]}>
      <mesh>
        <octahedronGeometry args={[0.17, 0]} />
        <meshStandardMaterial color="#ffc78e" emissive="#dc7c40" emissiveIntensity={1.1} metalness={0.22} roughness={0.28} />
      </mesh>
      <mesh rotation={[Math.PI / 4, 0, Math.PI / 5]}>
        <torusGeometry args={[0.4, 0.012, 9, 80]} />
        <meshBasicMaterial color="#f5b879" transparent opacity={0.78} />
      </mesh>
      <mesh rotation={[-Math.PI / 4, Math.PI / 2, 0]}>
        <torusGeometry args={[0.52, 0.009, 9, 80]} />
        <meshBasicMaterial color="#61cddd" transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

function OriginPlinth({ running }: { running: boolean }) {
  return (
    <group>
      {/* Stage 1 plinth preserved under the articulated Stage 2 arm. */}
      <mesh position={[0, 0.02, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.45, 1.55, 0.25, 96]} />
        <meshStandardMaterial color="#1b2d3f" metalness={0.68} roughness={0.31} />
      </mesh>
      <mesh position={[0, 0.175, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.19, 1.29, 0.14, 96]} />
        <meshStandardMaterial color="#324c61" metalness={0.72} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.253, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.98, 1.08, 0.055, 96]} />
        <meshStandardMaterial color="#122332" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.293, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.86, 0.016, 8, 100]} />
        <meshBasicMaterial color="#6fd7e1" transparent opacity={0.85} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle) => (
        <group key={angle} position={[1.26 * Math.cos(angle), 0.26, 1.26 * Math.sin(angle)]}>
          <mesh castShadow>
            <boxGeometry args={[0.15, 0.11, 0.22]} />
            <meshStandardMaterial color="#eaa168" metalness={0.4} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <group position={[-1.8, 0, -1.6]} scale={0.52}><CalibrationBeacon running={running} /></group>
    </group>
  );
}

function StarterWorld({ settings, resetVersion, pose, target, objects, heldId, frozen, focusRobot }: { settings: SceneSettings; resetVersion: number; pose: RobotPose; target: Vector3 | null; objects: VirtualObject[]; heldId: string | null; frozen: boolean; focusRobot:boolean }) {
  return (
    <>
      <color attach="background" args={['#0b1727']} />
      <fog attach="fog" args={['#0b1727', 15, 26]} />
      <ambientLight intensity={1.3} />
      <hemisphereLight args={['#8ccce0', '#121f31', 1.5]} />
      <directionalLight position={[4, 8, 6]} intensity={2.9} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={20} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
      <pointLight position={[-3, 4, -3]} intensity={45} distance={12} color="#46a4db" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WORKSPACE.groundY - 0.02, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#0c1b2b" metalness={0.05} roughness={0.93} />
      </mesh>
      {settings.showGrid && (
        <gridHelper args={[WORKSPACE.width, WORKSPACE.gridDivisions, '#476476', '#233e51']} position={[0, WORKSPACE.groundY, 0]} />
      )}
      {settings.showAxes && <axesHelper args={[2.15]} position={[-2.3, 0.01, 2.2]} />}
      <OriginPlinth running={settings.animateBeacon} />
      <RobotArm pose={pose} frozen={frozen} held={objects.find(object => object.id === heldId) ?? null} />
      <VirtualStations objects={objects} heldId={heldId} />
      {target && Math.hypot(target.x, target.z) <= 4.5 && target.y >= 0 && target.y <= 4.5 && (
        <group position={[target.x, target.y, target.z]} name="stage-3-target-marker">
          <mesh><sphereGeometry args={[0.095, 24, 16]} /><meshStandardMaterial color="#77e4d5" emissive="#1b9e92" emissiveIntensity={0.75} transparent opacity={0.85} /></mesh>
          <mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[0.18,0.012,8,36]} /><meshBasicMaterial color="#6ff8e3" /></mesh>
          <axesHelper args={[0.32]} />
        </group>
      )}
      <CameraRig preset={settings.camera} resetVersion={resetVersion} focusRobot={focusRobot} />
    </>
  );
}

export function StarterScene({ settings, resetVersion, onReady, pose, target, objects, heldId, frozen = false, focusRobot = true }: {
  settings: SceneSettings;
  resetVersion: number;
  onReady: () => void;
  pose: RobotPose;
  target: Vector3 | null;
  objects: VirtualObject[];
  heldId: string | null;
  frozen?: boolean;
  focusRobot?: boolean;
}) {
  return (
    <Canvas
      aria-label="Interactive articulated robotic arm three-dimensional scene"
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 42, near: 0.1, far: 70, position: [6.8, 5.2, 7.4] }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onCreated={onReady}
      fallback={<div className="canvas-fallback" role="alert">3D rendering requires WebGL. Try Chrome or Safari with hardware acceleration enabled.</div>}
    >
      <StarterWorld settings={settings} resetVersion={resetVersion} pose={pose} target={target} objects={objects} heldId={heldId} frozen={frozen} focusRobot={focusRobot} />
    </Canvas>
  );
}
