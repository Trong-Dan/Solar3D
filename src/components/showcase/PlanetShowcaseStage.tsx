import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetData } from '../../types/planet';
import { PlanetBody } from '../3d/PlanetBody';

interface PlanetShowcaseStageProps {
  planet: PlanetData;
  rotationMultiplier?: number;
}

// easeOutBack easing function with ~1.06 gentle overshoot
function easeOutBack(x: number): number {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function AnimatedPlanetGroup({ planet, rotationMultiplier }: { planet: PlanetData; rotationMultiplier?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Group>(null);
  const startTimeRef = useRef<number | null>(null);

  const showcaseRadius = useMemo(() => {
    switch (planet.id) {
      case 'sun':
        return 2.2;
      case 'jupiter':
        return 2.1;
      case 'saturn':
        return 1.55;
      case 'uranus':
        return 1.85;
      case 'neptune':
        return 1.85;
      case 'earth':
        return 1.8;
      case 'venus':
        return 1.75;
      case 'mars':
        return 1.65;
      case 'mercury':
        return 1.55;
      default:
        return 1.8;
    }
  }, [planet.id]);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useFrame((state) => {
    if (!groupRef.current) return;
    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    const duration = prefersReduced ? 0.2 : 0.55; // 550ms matching --showcase-transition-spring
    const progress = Math.min(1, elapsed / duration);

    if (prefersReduced) {
      groupRef.current.scale.set(1, 1, 1);
    } else {
      const ease = easeOutBack(progress);
      const s = 0.4 + 0.6 * ease;
      groupRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={groupRef} key={planet.id} position={[1.1, 0, 0]}>
      <group ref={planetRef}>
        <PlanetBody
          planet={planet}
          radius={showcaseRadius}
          showMoon={planet.id !== 'earth'}
          interactive
          selectable={false}
          rotationMultiplier={rotationMultiplier ?? 0.5}
        />
      </group>
    </group>
  );
}

function ShowcaseStageBackdrop() {
  const pointsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015;
    }
  });

  return (
    <group ref={pointsRef}>
      <Stars radius={100} depth={50} count={2500} factor={3.5} saturation={0.6} fade speed={1} />
    </group>
  );
}

function SkeletonFallback() {
  return null;
}

export function PlanetShowcaseStage({ planet, rotationMultiplier }: PlanetShowcaseStageProps) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Background ambient radial aura with dynamic chromatic glow */}
      <div
        className="showcase-stage-aura"
        style={{
          background: `radial-gradient(circle at 65% 50%, ${planet.color}33 0%, rgba(56, 189, 248, 0.08) 35%, transparent 70%)`,
        }}
      />

      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 8.5], fov: 38, near: 0.1, far: 500 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.35;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        {/* Studio-Grade Celestial Lighting Rig */}
        <ambientLight intensity={0.85} color="#f8fafc" />
        <hemisphereLight args={['#e0f2fe', '#0f172a', 1.2]} />
        
        {/* Key Light (Front-Right Top) */}
        <directionalLight position={[8, 8, 12]} intensity={2.8} color="#ffffff" />
        
        {/* Fill Light (Front-Left) */}
        <directionalLight position={[-8, 3, 10]} intensity={1.6} color="#bae6fd" />
        
        {/* Rim / Atmospheric Accent Light (Rear) */}
        <directionalLight position={[-4, 8, -8]} intensity={2.0} color={planet.color} />
        
        {/* Bottom Bounce Light */}
        <directionalLight position={[0, -8, 6]} intensity={0.9} color="#38bdf8" />

        <ShowcaseStageBackdrop />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate
          rotateSpeed={0.45}
          dampingFactor={0.08}
          enableDamping
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.8}
          target={[0.8, 0, 0]}
        />

        <Suspense fallback={<SkeletonFallback />}>
          <AnimatedPlanetGroup key={planet.id} planet={planet} rotationMultiplier={rotationMultiplier} />
        </Suspense>
      </Canvas>
    </div>
  );
}
