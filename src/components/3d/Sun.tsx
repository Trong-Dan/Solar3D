import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSolarStore } from '../../store/solarStore';
import { sunData } from '../../data/planets';
import { getPlanetTexture } from '../../utils/textureGenerator';
import { Html } from '@react-three/drei';

export function Sun() {
  const sunMeshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const outerCoronaRef = useRef<THREE.Mesh>(null);
  const rootGroupRef = useRef<THREE.Group>(null);
  // Entrance choreography: hero enters first, largest presence
  const introT0Ref = useRef<number | null>(null);
  const introDoneRef = useRef(false);

  const selectedPlanetId = useSolarStore((s) => s.selectedPlanetId);
  const hoveredPlanetId = useSolarStore((s) => s.hoveredPlanetId);
  const selectPlanet = useSolarStore((s) => s.selectPlanet);
  const setHoveredPlanet = useSolarStore((s) => s.setHoveredPlanet);
  const showLabels = useSolarStore((s) => s.showLabels);

  const isSelected = selectedPlanetId === 'sun';
  const isHovered = hoveredPlanetId === 'sun';

  const texture = getPlanetTexture('sun');

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Hero entrance: first to appear, ease-out cubic deceleration
    if (!introDoneRef.current && rootGroupRef.current) {
      if (introT0Ref.current === null) introT0Ref.current = t;
      const p = Math.min(1, Math.max(0, (t - introT0Ref.current - 0.08) / 0.65));
      const eased = 1 - Math.pow(1 - p, 3);
      rootGroupRef.current.scale.setScalar(eased);
      if (p >= 1) introDoneRef.current = true;
    }

    if (sunMeshRef.current) {
      sunMeshRef.current.rotation.y += 0.005;
      sunMeshRef.current.rotation.x = Math.sin(t * 0.9) * 0.08;
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.z -= 0.004;
      const scale = 1.08 + Math.sin(t * 1.8) * 0.06;
      coronaRef.current.scale.set(scale, scale, scale);
    }
    if (outerCoronaRef.current) {
      outerCoronaRef.current.rotation.z += 0.0025;
      const pulse = 1.18 + Math.sin(t * 2.2) * 0.08;
      outerCoronaRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={rootGroupRef} position={[0, 0, 0]}>
      {/* Central Sunlight Source */}
      <pointLight color="#ffffff" intensity={4.5} distance={150} decay={0.5} />
      <pointLight color="#ffeedd" intensity={2.0} distance={400} decay={0.2} />

      {/* Main Sun Core Sphere */}
      <mesh
        ref={sunMeshRef}
        onClick={(e) => {
          e.stopPropagation();
          selectPlanet('sun');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredPlanet('sun');
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHoveredPlanet(null);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[sunData.radius, 64, 64]} />
        <meshBasicMaterial map={texture} />
      </mesh>

      {/* Inner Glowing Corona Atmosphere */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[sunData.radius * 1.08, 32, 32]} />
        <meshBasicMaterial
          color="#ff7700"
          transparent
          opacity={0.35}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer Golden Corona Halo */}
      <mesh ref={outerCoronaRef}>
        <sphereGeometry args={[sunData.radius * 1.25, 32, 32]} />
        <meshBasicMaterial
          color="#ff3300"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Selection Glow Indicator */}
      {(isSelected || isHovered) && (
        <mesh>
          <sphereGeometry args={[sunData.radius * 1.35, 32, 32]} />
          <meshBasicMaterial
            color="#ffe066"
            transparent
            opacity={isSelected ? 0.3 : 0.15}
            side={THREE.DoubleSide}
            wireframe
          />
        </mesh>
      )}

      {/* Hover Tooltip */}
      {isHovered && !isSelected && (
        <Html
          position={[0, sunData.radius + (showLabels ? 2.4 : 1.2), 0]}
          center
          distanceFactor={25}
          zIndexRange={[120, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="planet-hover-tooltip">
            <span className="tooltip-name">{sunData.name}</span>
            <span className="tooltip-dist">Trung tâm Hệ Mặt Trời</span>
          </div>
        </Html>
      )}

      {/* Sun Label */}
      {showLabels && (
        <Html position={[0, sunData.radius + 1.2, 0]} center distanceFactor={25} zIndexRange={[100, 0]}>
          <div
            className={`planet-3d-tag ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              selectPlanet('sun');
            }}
          >
            <span className="planet-tag-name">☀️ {sunData.name}</span>
          </div>
        </Html>
      )}
    </group>
  );
}
