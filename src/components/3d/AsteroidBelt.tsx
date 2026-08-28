import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSolarStore } from '../../store/solarStore';

interface AsteroidBeltProps {
  count?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export function AsteroidBelt({
  count = 1000,
  innerRadius = 18.0,
  outerRadius = 21.8,
}: AsteroidBeltProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const showAsteroidBelt = useSolarStore((s) => s.showAsteroidBelt);
  const timeScale = useSolarStore((s) => s.timeScale);
  const isPaused = useSolarStore((s) => s.isPaused);
  const reverseTime = useSolarStore((s) => s.reverseTime);

  // Generate asteroid orbital parameters
  const asteroids = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.007 + Math.random() * 0.004) * (18 / radius);
      const yOffset = (Math.random() - 0.5) * 1.6;
      const scale = 0.03 + Math.random() * 0.07;
      const rotSpeedX = (Math.random() - 0.5) * 0.05;
      const rotSpeedY = (Math.random() - 0.5) * 0.05;
      const rotSpeedZ = (Math.random() - 0.5) * 0.05;

      data.push({
        radius,
        angle,
        speed,
        yOffset,
        scale,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        rotSpeedX,
        rotSpeedY,
        rotSpeedZ,
      });
    }
    return data;
  }, [count, innerRadius, outerRadius]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize rock colors
  useEffect(() => {
    if (!meshRef.current) return;
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      // Grey, brownish, and dark charcoal shades
      const shade = 0.35 + Math.random() * 0.35;
      const redTint = Math.random() * 0.08;
      color.setRGB(shade + redTint, shade, shade - 0.04);
      meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [count]);

  useFrame((_, delta) => {
    if (!meshRef.current || !showAsteroidBelt) return;

    const currentMultiplier = isPaused ? 0 : (reverseTime ? -1 : 1) * timeScale;

    for (let i = 0; i < count; i++) {
      const ast = asteroids[i];
      if (currentMultiplier !== 0) {
        ast.angle += ast.speed * currentMultiplier * 0.5;
        ast.rotX += ast.rotSpeedX * currentMultiplier;
        ast.rotY += ast.rotSpeedY * currentMultiplier;
      }

      const x = Math.cos(ast.angle) * ast.radius;
      const z = Math.sin(ast.angle) * ast.radius;

      dummy.position.set(x, ast.yOffset, z);
      dummy.rotation.set(ast.rotX, ast.rotY, ast.rotZ);
      dummy.scale.set(ast.scale, ast.scale, ast.scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!showAsteroidBelt) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 1]} />
      <meshStandardMaterial roughness={0.9} metalness={0.1} />
    </instancedMesh>
  );
}
