import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlanetData } from '../../types/planet';
import { useSolarStore } from '../../store/solarStore';
import { getPlanetTexture, createEarthCloudsTexture, createMoonTexture } from '../../utils/textureGenerator';
import { SaturnRing, UranusRing } from './PlanetRings';

export interface PlanetBodyProps {
  planet: PlanetData;
  radius: number;
  showMoon?: boolean;
  interactive?: boolean;
  selectable?: boolean;
  rotationMultiplier?: number;
}

export function PlanetBody({
  planet,
  radius,
  showMoon = true,
  interactive = false,
  selectable = true,
  rotationMultiplier = 1,
}: PlanetBodyProps) {
  const planetBodyRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const cloudsMeshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const outerCoronaRef = useRef<THREE.Mesh>(null);
  const moonGroupRef = useRef<THREE.Group>(null);
  const moonAngleRef = useRef(Math.random() * Math.PI * 2);
  const currentMultiplierRef = useRef(rotationMultiplier);

  const selectPlanet = useSolarStore((s) => s.selectPlanet);
  const setHoveredPlanet = useSolarStore((s) => s.setHoveredPlanet);
  const selectedPlanetId = useSolarStore((s) => s.selectedPlanetId);
  const hoveredPlanetId = useSolarStore((s) => s.hoveredPlanetId);

  const isSelected = selectedPlanetId === planet.id;
  const isHovered = hoveredPlanetId === planet.id;

  // Textures
  const texture = useMemo(() => getPlanetTexture(planet.id), [planet.id]);
  const cloudsTexture = useMemo(
    () => (planet.id === 'earth' ? createEarthCloudsTexture() : null),
    [planet.id]
  );
  const moonTexture = useMemo(
    () => (planet.id === 'earth' ? createMoonTexture() : null),
    [planet.id]
  );

  const isSun = planet.id === 'sun';

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    // Smoothly ease the rotation multiplier toward its target so pause/resume
    // (showcase interaction) never snaps abruptly.
    const targetMultiplier = rotationMultiplier;
    const easedMultiplier = THREE.MathUtils.damp(
      currentMultiplierRef.current,
      targetMultiplier,
      6,
      delta
    );
    currentMultiplierRef.current = easedMultiplier;
    const mult = easedMultiplier;

    // Smooth hover/selection scale (buttery spring)
    if (interactive && planetBodyRef.current) {
      const targetScale = isSelected ? 1.08 : isHovered ? 1.05 : 1;
      const currentScale = planetBodyRef.current.scale.x;
      const next = THREE.MathUtils.damp(currentScale, targetScale, 7, delta);
      planetBodyRef.current.scale.set(next, next, next);
    }

    if (mult !== 0) {
      if (planetMeshRef.current) {
        planetMeshRef.current.rotation.y += (planet.rotationSpeed || 0.01) * mult * 1.15;
      }

      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += (planet.rotationSpeed || 0.01) * mult * 1.2;
      }

      if (isSun) {
        if (coronaRef.current) {
          coronaRef.current.rotation.z -= 0.004 * mult;
          const scale = 1.08 + Math.sin(t * 1.8) * 0.06;
          coronaRef.current.scale.set(scale, scale, scale);
        }
        if (outerCoronaRef.current) {
          outerCoronaRef.current.rotation.z += 0.0025 * mult;
          const pulse = 1.18 + Math.sin(t * 2.2) * 0.08;
          outerCoronaRef.current.scale.set(pulse, pulse, pulse);
        }
      }

      if (moonGroupRef.current) {
        moonAngleRef.current += 0.05 * mult;
        const moonDist = radius + 1.2;
        const mx = Math.cos(moonAngleRef.current) * moonDist;
        const mz = Math.sin(moonAngleRef.current) * moonDist;
        moonGroupRef.current.position.set(mx, Math.sin(moonAngleRef.current) * 0.28, mz);
      }
    }
  });

  const pointerProps = interactive
    ? {
        onClick: selectable
          ? (e: { stopPropagation: () => void }) => {
              e.stopPropagation();
              selectPlanet(planet.id);
            }
          : undefined,
        onPointerOver: (e: { stopPropagation: () => void }) => {
          e.stopPropagation();
          setHoveredPlanet(planet.id);
          document.body.style.cursor = 'pointer';
        },
        onPointerOut: () => {
          setHoveredPlanet(null);
          document.body.style.cursor = 'auto';
        },
      }
    : {};

  if (isSun) {
    return (
      <group ref={planetBodyRef} rotation={[0, 0, planet.tilt || 0]}>
        {/* Sun Core Sphere */}
        <mesh ref={planetMeshRef} {...pointerProps}>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshBasicMaterial map={texture} />
        </mesh>

        {/* Inner Glowing Corona Atmosphere */}
        <mesh ref={coronaRef}>
          <sphereGeometry args={[radius * 1.08, 32, 32]} />
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
          <sphereGeometry args={[radius * 1.25, 32, 32]} />
          <meshBasicMaterial
            color="#ff3300"
            transparent
            opacity={0.18}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={planetBodyRef} rotation={[0, 0, planet.tilt || 0]}>
      {/* Main Planet Sphere */}
      <mesh ref={planetMeshRef} castShadow receiveShadow {...pointerProps}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={planet.type === 'gas_giant' || planet.type === 'ice_giant' ? 0.45 : 0.75}
          metalness={0.04}
          emissive={new THREE.Color(planet.color)}
          emissiveIntensity={planet.id === 'uranus' || planet.id === 'neptune' ? 0.12 : 0.05}
        />
      </mesh>

      {/* Earth Atmosphere & Moving Clouds */}
      {planet.id === 'earth' && cloudsTexture && (
        <>
          <mesh ref={cloudsMeshRef}>
            <sphereGeometry args={[radius * 1.025, 48, 48]} />
            <meshStandardMaterial
              map={cloudsTexture}
              transparent
              opacity={0.85}
              depthWrite={false}
            />
          </mesh>

          <mesh>
            <sphereGeometry args={[radius * 1.08, 32, 32]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.22}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </>
      )}

      {/* Venus Atmosphere Glow */}
      {planet.id === 'venus' && (
        <mesh>
          <sphereGeometry args={[radius * 1.06, 32, 32]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.25}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Mars Atmosphere Glow */}
      {planet.id === 'mars' && (
        <mesh>
          <sphereGeometry args={[radius * 1.05, 32, 32]} />
          <meshBasicMaterial
            color="#f87171"
            transparent
            opacity={0.2}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Uranus Ethereal Ice-Cyan Atmosphere Glow */}
      {planet.id === 'uranus' && (
        <>
          <mesh>
            <sphereGeometry args={[radius * 1.04, 32, 32]} />
            <meshBasicMaterial
              color="#7ad1d6"
              transparent
              opacity={0.35}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[radius * 1.12, 32, 32]} />
            <meshBasicMaterial
              color="#2dd4bf"
              transparent
              opacity={0.18}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </>
      )}

      {/* Neptune Deep Royal Azure Atmosphere Glow */}
      {planet.id === 'neptune' && (
        <>
          <mesh>
            <sphereGeometry args={[radius * 1.04, 32, 32]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.38}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[radius * 1.12, 32, 32]} />
            <meshBasicMaterial
              color="#2563eb"
              transparent
              opacity={0.22}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </>
      )}

      {/* Saturn Rings */}
      {planet.id === 'saturn' && (
        <SaturnRing
          innerRadius={radius * 1.3}
          outerRadius={radius * 2.35}
        />
      )}

      {/* Uranus Rings */}
      {planet.id === 'uranus' && (
        <UranusRing
          innerRadius={radius * 1.25}
          outerRadius={radius * 1.75}
        />
      )}

      {/* Earth's Moon */}
      {planet.id === 'earth' && showMoon && (
        <group ref={moonGroupRef}>
          <mesh
            onClick={
              interactive && selectable
                ? (e) => {
                    e.stopPropagation();
                    selectPlanet('earth');
                  }
                : undefined
            }
          >
            <sphereGeometry args={[radius * 0.27, 32, 32]} />
            <meshStandardMaterial map={moonTexture || undefined} roughness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}
