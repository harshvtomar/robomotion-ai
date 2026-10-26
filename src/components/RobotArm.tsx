import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { degreesToRadians, easeJoint, fingerOffset, HOME_POSE } from '../core/robot';
import type { JointKey, RobotPose } from '../core/robot';

/** Procedural, articulated robot; all axes defined in local parent space.
 * No external meshes/assets, inverse kinematics, grasp physics or hardware claims.
 * Rotations are applied by refs each frame to avoid rerendering heavy geometry.
 */
const BODY = '#234763';
const EDGE = '#466c83';
const DEEP = '#11283b';
const ACCENT = '#f7a365';
const LIGHT = '#a2dae6';
const STEEL = '#91a9b8';

function Hinge({ radius = 0.23 }: { radius?: number }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, 0.42, 48]} />
        <meshStandardMaterial color={DEEP} metalness={0.8} roughness={0.29} />
      </mesh>
      {[-0.24, 0.24].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[radius + 0.035, radius + 0.035, 0.055, 48]} />
            <meshStandardMaterial color={EDGE} metalness={0.82} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0, Math.sign(z) * 0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[radius * 0.42, radius * 0.42, 0.018, 40]} />
            <meshStandardMaterial color={ACCENT} metalness={0.65} roughness={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Link({ length, width, lean = 0 }: { length: number; width: number; lean?: number }) {
  return (
    <group rotation={[0, 0, lean]}>
      <mesh castShadow receiveShadow position={[0, length / 2, 0]}>
        <boxGeometry args={[width, length, width * 0.83]} />
        <meshStandardMaterial color={BODY} metalness={0.73} roughness={0.29} />
      </mesh>
      <mesh castShadow position={[-width * 0.45, length / 2, width * 0.44]}>
        <boxGeometry args={[0.055, length * 0.83, 0.042]} />
        <meshStandardMaterial color={ACCENT} metalness={0.47} roughness={0.28} emissive="#ab431d" emissiveIntensity={0.12} />
      </mesh>
      <mesh position={[width * 0.15, length / 2, width * 0.45]}>
        <boxGeometry args={[width * 0.44, length * 0.65, 0.02]} />
        <meshStandardMaterial color={EDGE} metalness={0.75} roughness={0.24} />
      </mesh>
      <mesh position={[0, length / 2, -width * 0.43]}>
        <boxGeometry args={[width * 0.58, length * 0.64, 0.022]} />
        <meshStandardMaterial color={DEEP} metalness={0.75} roughness={0.32} />
      </mesh>
      {[0.19, 0.81].map((fraction) => (
        <mesh key={fraction} position={[0, length * fraction, width * 0.45]}>
          <boxGeometry args={[width * 0.68, 0.025, 0.02]} />
          <meshStandardMaterial color={STEEL} metalness={0.7} roughness={0.32} />
        </mesh>
      ))}
    </group>
  );
}

function Finger({ side }: { side: -1 | 1 }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.16, 0]}>
        <boxGeometry args={[0.085, 0.35, 0.14]} />
        <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.23} />
      </mesh>
      <mesh castShadow position={[-side * 0.045, 0.335, 0]}>
        <boxGeometry args={[0.17, 0.075, 0.14]} />
        <meshStandardMaterial color={DEEP} roughness={0.47} metalness={0.25} />
      </mesh>
      <mesh position={[0, -0.02, 0.085]}>
        <boxGeometry args={[0.10, 0.09, 0.035]} />
        <meshStandardMaterial color={ACCENT} metalness={0.6} roughness={0.33} />
      </mesh>
    </group>
  );
}

export function RobotArm({ pose }: { pose: RobotPose }) {
  const base = useRef<Group>(null);
  const shoulder = useRef<Group>(null);
  const elbow = useRef<Group>(null);
  const wristPitch = useRef<Group>(null);
  const wristRoll = useRef<Group>(null);
  const fingerLeft = useRef<Group>(null);
  const fingerRight = useRef<Group>(null);
  const current = useRef<Record<JointKey, number>>({ ...HOME_POSE });

  useFrame((_, delta) => {
    for (const key of Object.keys(current.current) as JointKey[]) {
      current.current[key] = easeJoint(current.current[key], pose[key], delta);
    }
    const values = current.current;
    if (base.current) base.current.rotation.y = degreesToRadians(values.base);
    if (shoulder.current) shoulder.current.rotation.z = degreesToRadians(values.shoulder);
    if (elbow.current) elbow.current.rotation.z = degreesToRadians(values.elbow);
    if (wristPitch.current) wristPitch.current.rotation.z = degreesToRadians(values.wristPitch);
    if (wristRoll.current) wristRoll.current.rotation.y = degreesToRadians(values.wristRoll);
    const gap = fingerOffset(values.gripper);
    if (fingerLeft.current) fingerLeft.current.position.x = -gap;
    if (fingerRight.current) fingerRight.current.position.x = gap;
  });

  return (
    <group name="robo-motion-stage-2-arm" position={[0, 0.32, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.48, 0.54, 0.26, 64]} />
        <meshStandardMaterial color={DEEP} metalness={0.78} roughness={0.27} />
      </mesh>
      <mesh position={[0, 0.276, 0]}>
        <cylinderGeometry args={[0.41, 0.41, 0.036, 64]} />
        <meshStandardMaterial color={ACCENT} metalness={0.75} roughness={0.2} />
      </mesh>
      <group ref={base} position={[0, 0.30, 0]}>
        <mesh castShadow position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.37, 0.42, 0.28, 48]} />
          <meshStandardMaterial color={BODY} metalness={0.7} roughness={0.28} />
        </mesh>
        <mesh castShadow position={[0, 0.32, 0]}>
          <boxGeometry args={[0.56, 0.37, 0.55]} />
          <meshStandardMaterial color={BODY} metalness={0.76} roughness={0.27} />
        </mesh>
        <mesh position={[0, 0.24, 0.29]}>
          <boxGeometry args={[0.26, 0.13, 0.024]} />
          <meshStandardMaterial color={LIGHT} emissive="#67b6cc" emissiveIntensity={0.15} />
        </mesh>
        <group ref={shoulder} position={[0, 0.50, 0]}>
          <Hinge radius={0.30} />
          <Link length={1.16} width={0.34} />
          <group ref={elbow} position={[0, 1.16, 0]}>
            <Hinge radius={0.255} />
            <Link length={0.96} width={0.28} />
            <group ref={wristPitch} position={[0, 0.96, 0]}>
              <Hinge radius={0.185} />
              <mesh castShadow position={[0, 0.185, 0]}>
                <cylinderGeometry args={[0.15, 0.17, 0.35, 36]} />
                <meshStandardMaterial color={EDGE} metalness={0.78} roughness={0.26} />
              </mesh>
              <group ref={wristRoll} position={[0, 0.36, 0]}>
                <mesh castShadow position={[0, 0.06, 0]}>
                  <cylinderGeometry args={[0.21, 0.17, 0.13, 36]} />
                  <meshStandardMaterial color={DEEP} metalness={0.73} roughness={0.31} />
                </mesh>
                <mesh castShadow position={[0, 0.16, 0]}>
                  <boxGeometry args={[0.52, 0.13, 0.26]} />
                  <meshStandardMaterial color={BODY} metalness={0.77} roughness={0.3} />
                </mesh>
                <group ref={fingerLeft} position={[-fingerOffset(HOME_POSE.gripper), 0.20, 0]}>
                  <Finger side={-1} />
                </group>
                <group ref={fingerRight} position={[fingerOffset(HOME_POSE.gripper), 0.20, 0]}>
                  <Finger side={1} />
                </group>
                <mesh position={[0, 0.17, 0.14]}>
                  <boxGeometry args={[0.1, 0.07, 0.02]} />
                  <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.25} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
