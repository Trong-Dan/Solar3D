import { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { planets } from '../../data/planets';
import { Sun } from './Sun';
import { Planet } from './Planet';
import { AsteroidBelt } from './AsteroidBelt';
import { CosmicDust } from './CosmicDust';
import { useSolarStore } from '../../store/solarStore';
import { QualityPreset } from '../../types/planet';


function GalaxyBackdrop() {
  const groupRef = useRef<THREE.Group>(null);
  const starData = useMemo(() => {
    const total = 2800;
    const positions = new Float32Array(total * 3);
    const colors = new Float32Array(total * 3);
    const colorA = new THREE.Color('#7dd3fc');
    const colorB = new THREE.Color('#a78bfa');
    const colorC = new THREE.Color('#facc15');

    for (let i = 0; i < total; i += 1) {
      const arm = i % 2;
      const armAngle = (i / total) * Math.PI * 2 * 3 + arm * Math.PI * 0.7;
      const radius = Math.pow(Math.random(), 1.35) * 120 + 12;
      const x = Math.cos(armAngle) * radius;
      const z = Math.sin(armAngle) * radius;
      const y = (Math.random() - 0.5) * 30;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const tint = i % 3 === 0 ? colorA : i % 3 === 1 ? colorB : colorC;
      colors[i * 3] = tint.r;
      colors[i * 3 + 1] = tint.g;
      colors[i * 3 + 2] = tint.b;
    }

    return { positions, colors };
  }, []);

  const galaxyMatRef = useRef<THREE.PointsMaterial>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.18;
    // Ambient breathing layer: imperceptible luminosity drift (motion-design: ambient <=20% energy)
    if (galaxyMatRef.current) {
      galaxyMatRef.current.opacity = 0.81 + Math.sin(state.clock.elapsedTime * 0.35) * 0.09;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starData.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[starData.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={galaxyMatRef}
          size={0.42}
          vertexColors
          transparent
          opacity={0.9}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

const qualitySettings: Record<
  QualityPreset,
  { dpr: [number, number]; antialias: boolean; farStars: number; nearStars: number; asteroids: number }
> = {
  low: { dpr: [1, 1.25], antialias: false, farStars: 1500, nearStars: 600, asteroids: 400 },
  medium: { dpr: [1, 1.5], antialias: true, farStars: 2500, nearStars: 1000, asteroids: 700 },
  high: { dpr: [1, 1.8], antialias: true, farStars: 4000, nearStars: 1500, asteroids: 1000 },
};

export function SolarCanvas() {
  const quality = useSolarStore((s) => s.quality);
  const q = qualitySettings[quality];

  return (
    <div className="canvas-container">
      <Canvas
        dpr={q.dpr}
        camera={{ position: [0, 30, 52], fov: 50, near: 0.1, far: 2000 }}
        gl={{ antialias: q.antialias, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <ambientLight intensity={0.22} />
        <directionalLight position={[40, 20, 30]} intensity={0.35} color="#cfe8ff" />
        <directionalLight position={[-50, -15, -40]} intensity={0.18} color="#7aa7ff" />

        {/* Environment reflections for planet materials */}
        {q.antialias && <Environment preset="night" environmentIntensity={0.06} />}

        <Stars radius={300} depth={80} count={q.farStars} factor={4} saturation={0.5} fade speed={1.2} />
        <Stars radius={150} depth={40} count={q.nearStars} factor={6} saturation={1} fade speed={0.8} />
        <GalaxyBackdrop />

        <Suspense fallback={null}>
          <Sun />
          <AsteroidBelt count={q.asteroids} innerRadius={18.0} outerRadius={21.8} />
          <CosmicDust count={q.asteroids > 500 ? 500 : 200} spread={130} />

          {planets.map((planet, i) => (
            <Planet key={planet.id} planet={planet} introIndex={i} />
          ))}

        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={30}
          maxDistance={120}
          rotateSpeed={0.45}
          zoomSpeed={0.65}
          dampingFactor={0.1}
          enableDamping={true}
          maxPolarAngle={Math.PI * 0.88}
          minPolarAngle={Math.PI * 0.05}
        />

        {q.antialias && (
          <EffectComposer>
            <Bloom
              intensity={0.9}
              luminanceThreshold={0.92}
              luminanceSmoothing={0.3}
              mipmapBlur
              radius={0.72}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
