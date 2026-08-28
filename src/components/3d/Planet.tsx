import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlanetData } from '../../types/planet';
import { useSolarStore } from '../../store/solarStore';
import { OrbitPath } from './OrbitPath';
import { Html } from '@react-three/drei';
import { PlanetBody } from './PlanetBody';

interface PlanetProps {
  planet: PlanetData;
  introIndex?: number;
}

export function Planet({ planet, introIndex = 0 }: PlanetProps) {
  const orbitGroupRef = useRef<THREE.Group>(null);
  const ringMeshRef = useRef<THREE.Mesh>(null);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);
  const driftRef = useRef(Math.random() * Math.PI * 2);
  // Entrance choreography state (center-out stagger)
  const introT0Ref = useRef<number | null>(null);
  const introDoneRef = useRef(false);

  const selectedPlanetId = useSolarStore((s) => s.selectedPlanetId);
  const hoveredPlanetId = useSolarStore((s) => s.hoveredPlanetId);
  const selectPlanet = useSolarStore((s) => s.selectPlanet);
  const timeScale = useSolarStore((s) => s.timeScale);
  const isPaused = useSolarStore((s) => s.isPaused);
  const reverseTime = useSolarStore((s) => s.reverseTime);
  const scaleMode = useSolarStore((s) => s.scaleMode);
  const showOrbits = useSolarStore((s) => s.showOrbits);
  const showLabels = useSolarStore((s) => s.showLabels);
  const showMoons = useSolarStore((s) => s.showMoons);

  const isSelected = selectedPlanetId === planet.id;
  const isHovered = hoveredPlanetId === planet.id;

  // Calculate size according to scaleMode
  const planetRadius = useMemo(() => {
    if (scaleMode === 'readable') {
      return planet.radius;
    }
    // Realistic proportions (normalized for visibility)
    return (planet.physical.diameterKm / 12742) * 0.7;
  }, [scaleMode, planet.radius, planet.physical.diameterKm]);

  const currentMultiplier = isPaused ? 0 : (reverseTime ? -1 : 1) * timeScale;

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Entrance choreography: center-out stagger, ease-out cubic, no overshoot (Premium)
    if (!introDoneRef.current && orbitGroupRef.current) {
      if (introT0Ref.current === null) introT0Ref.current = t;
      const introDelay = 0.25 + introIndex * 0.055;
      const introDur = 0.55;
      const p = Math.min(1, Math.max(0, (t - introT0Ref.current - introDelay) / introDur));
      const eased = 1 - Math.pow(1 - p, 3);
      orbitGroupRef.current.scale.setScalar(eased);
      if (p >= 1) introDoneRef.current = true;
    }

    // Pulse the selection/hover ring
    if (ringMatRef.current) {
      const base = isSelected ? 0.9 : 0.45;
      const pulse = (Math.sin(t * 4) + 1) / 2;
      ringMatRef.current.opacity = base - pulse * 0.25;
      if (ringMeshRef.current) {
        const s = 1 + Math.sin(t * 4) * 0.03;
        ringMeshRef.current.scale.set(s, s, s);
      }
    }

    if (currentMultiplier !== 0) {
      angleRef.current += planet.orbitSpeed * currentMultiplier * 0.8;
    }

    const orbitWave = Math.sin(t * 0.8 + driftRef.current + planet.distanceFromSun * 0.2) * 0.9;
    const orbitRadius = planet.distanceFromSun + orbitWave;
    const x = Math.cos(angleRef.current) * orbitRadius;
    const z = Math.sin(angleRef.current) * orbitRadius;
    const y = Math.sin(t * 1.2 + angleRef.current * 2.5 + driftRef.current) * (0.45 + planet.distanceFromSun * 0.02);

    if (orbitGroupRef.current) {
      orbitGroupRef.current.position.set(x, y, z);
    }
  });

  return (
    <>
      {/* Orbit Circle */}
      <OrbitPath
        radius={planet.distanceFromSun}
        isSelected={isSelected}
        isHovered={isHovered}
        visible={showOrbits}
      />

      {/* Planet Group positioned at (x, y, z) */}
      <group ref={orbitGroupRef} name={`planet-${planet.id}`}>
        {/* Pure Visual Mesh (Texture, Atmospheres, Rings, Moon) */}
        <PlanetBody
          planet={planet}
          radius={planetRadius}
          showMoon={showMoons}
          interactive={true}
          rotationMultiplier={currentMultiplier}
        />

        {/* Selection Indicator Ring */}
        {(isSelected || isHovered) && (
          <mesh ref={ringMeshRef} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[planetRadius * 1.35, planetRadius * 1.48, 48]} />
            <meshBasicMaterial
              ref={ringMatRef}
              color={isSelected ? '#38bdf8' : '#93c5fd'}
              transparent
              opacity={isSelected ? 0.9 : 0.45}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Hover Tooltip (name + distance) */}
        {isHovered && !isSelected && (
          <Html
            position={[0, planetRadius + (showLabels ? 1.7 : 0.8), 0]}
            center
            distanceFactor={24}
            zIndexRange={[120, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div className="planet-hover-tooltip">
              <span className="tooltip-name">{planet.name}</span>
              <span className="tooltip-dist">
                {planet.orbit.distanceMillionKm.toLocaleString('vi-VN')} triệu km • {planet.orbit.distanceAU} AU
              </span>
            </div>
          </Html>
        )}

        {/* 3D Label */}
        {showLabels && (
          <Html
            position={[0, planetRadius + 0.8, 0]}
            center
            distanceFactor={24}
            zIndexRange={[100, 0]}
          >
            <div
              className={`planet-3d-tag ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                selectPlanet(planet.id);
              }}
            >
              <div className="tag-dot" style={{ backgroundColor: planet.color }} />
              <span className="planet-tag-name">{planet.name}</span>
            </div>
          </Html>
        )}
      </group>
    </>
  );
}
