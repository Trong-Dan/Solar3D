import { useMemo } from 'react';
import * as THREE from 'three';
import { getPlanetTexture } from '../../utils/textureGenerator';

interface SaturnRingProps {
  innerRadius: number;
  outerRadius: number;
}

export function SaturnRing({ innerRadius, outerRadius }: SaturnRingProps) {
  const texture = useMemo(() => getPlanetTexture('saturn_ring'), []);

  // Configure UV mapping for radial ring
  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, 128);
    const pos = geo.attributes.position;
    const uvs = geo.attributes.uv;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      const u = (dist - innerRadius) / (outerRadius - innerRadius);
      uvs.setXY(i, u, 0.5);
    }
    uvs.needsUpdate = true;
    return geo;
  }, [innerRadius, outerRadius]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={0.92}
        side={THREE.DoubleSide}
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
  );
}

export function UranusRing({ innerRadius = 1.8, outerRadius = 2.4 }: { innerRadius?: number; outerRadius?: number }) {
  const texture = useMemo(() => getPlanetTexture('uranus_ring'), []);

  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, 96);
    const pos = geo.attributes.position;
    const uvs = geo.attributes.uv;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      const u = (dist - innerRadius) / (outerRadius - innerRadius);
      uvs.setXY(i, u, 0.5);
    }
    uvs.needsUpdate = true;
    return geo;
  }, [innerRadius, outerRadius]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={0.55}
        side={THREE.DoubleSide}
        roughness={0.8}
      />
    </mesh>
  );
}
