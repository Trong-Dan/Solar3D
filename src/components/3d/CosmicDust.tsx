import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CosmicDustProps {
  count?: number;
  spread?: number;
}

export function CosmicDust({ count = 600, spread = 120 }: CosmicDustProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * spread * 2;
      const y = (Math.random() - 0.5) * spread * 0.6;
      const z = (Math.random() - 0.5) * spread * 2;
      const driftX = (Math.random() - 0.5) * 0.008;
      const driftY = (Math.random() - 0.5) * 0.002;
      const driftZ = (Math.random() - 0.5) * 0.008;
      const scale = 0.04 + Math.random() * 0.12;
      const brightness = 0.4 + Math.random() * 0.6;

      data.push({ x, y, z, driftX, driftY, driftZ, scale, brightness });
    }
    return data;
  }, [count, spread]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const px = p.x + Math.sin(t * 0.15 + i * 0.3) * p.driftX * 100;
      const py = p.y + Math.cos(t * 0.1 + i * 0.2) * p.driftY * 100;
      const pz = p.z + Math.sin(t * 0.12 + i * 0.4) * p.driftZ * 100;

      dummy.position.set(px, py, pz);
      const s = p.scale * (0.8 + Math.sin(t * 0.5 + i) * 0.2);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Color: warm yellows, cool blues, and white
      const hue = i % 3 === 0 ? 0.55 : i % 3 === 1 ? 0.1 : 0.0;
      const sat = i % 3 === 0 ? 0.4 : i % 3 === 1 ? 0.3 : 0.0;
      color.setHSL(hue, sat, 0.6 + p.brightness * 0.3);
      meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial transparent opacity={0.55} depthWrite={false} />
    </instancedMesh>
  );
}
