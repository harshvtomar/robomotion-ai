import type { VirtualObject } from '../core/manipulation';
import { ALL_STATIONS, SOURCE_STATIONS, STATION_RADIUS } from '../core/manipulation';

/** Simple visual props only: no rigid-body simulation is implied. */
export function SampleMesh({ object }: { object: VirtualObject }) {
  return (
    <group name={`virtual-object-${object.id}`}>
      <mesh castShadow receiveShadow>
        {object.shape === 'sphere' ? <sphereGeometry args={[object.radius, 24, 16]} />
          : object.shape === 'octahedron' ? <octahedronGeometry args={[object.radius * 1.3, 0]} />
          : <boxGeometry args={[object.radius * 1.65, object.radius * 1.65, object.radius * 1.65]} />}
        <meshStandardMaterial color={object.color} metalness={0.35} roughness={0.35} emissive={object.color} emissiveIntensity={0.12} />
      </mesh>
      <mesh position={[0, -object.radius - 0.028, 0]}>
        <cylinderGeometry args={[object.radius * 0.9, object.radius * 1.05, 0.022, 24]} />
        <meshStandardMaterial color="#d5e5f1" metalness={0.78} roughness={0.24} />
      </mesh>
    </group>
  );
}

export function VirtualStations({ objects, heldId }: { objects: VirtualObject[]; heldId: string | null }) {
  return (
    <group name="stage-4-elevated-transfer-stations">
      {ALL_STATIONS.map(station => {
        const padY = station.position.y - 0.18;
        const footY = 0.08;
        const height = padY - footY;
        return (
          <group key={station.id} name={station.id}>
            <mesh position={[station.position.x, footY + height / 2, station.position.z]}>
              <cylinderGeometry args={[0.033, 0.062, height, 10]} />
              <meshStandardMaterial color="#446078" metalness={0.76} roughness={0.35} transparent opacity={0.7} />
            </mesh>
            <mesh position={[station.position.x, padY, station.position.z]}>
              <cylinderGeometry args={[STATION_RADIUS, STATION_RADIUS, 0.04, 36]} />
              <meshStandardMaterial color={station.kind === 'dock' ? '#284b4b' : '#263b50'} metalness={0.45} roughness={0.4} />
            </mesh>
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[station.position.x, padY + 0.024, station.position.z]}>
              <torusGeometry args={[STATION_RADIUS*0.77,0.014,8,36]} />
              <meshBasicMaterial color={station.color} />
            </mesh>
          </group>
        );
      })}
      {objects.filter(item=>item.id!==heldId).map(item=><group key={item.id} position={[item.position.x,item.position.y,item.position.z]}><SampleMesh object={item}/></group>)}
      {/* Source supports and destination docks are digital test fixtures, not modeled obstacles. */}
      <group position={[0,0.05,0]}>
        {SOURCE_STATIONS.map(s=><mesh key={s.id} position={[s.position.x,0,s.position.z]}>
          <cylinderGeometry args={[0.10,0.15,0.1,16]}/><meshStandardMaterial color={s.color} metalness={0.3} roughness={0.65}/>
        </mesh>)}
      </group>
    </group>
  );
}
