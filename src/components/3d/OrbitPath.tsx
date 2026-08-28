import * as THREE from 'three';

interface OrbitPathProps {
  radius: number;
  isSelected?: boolean;
  isHovered?: boolean;
  color?: string;
  visible?: boolean;
}

export function OrbitPath({
  radius,
  isSelected = false,
  isHovered = false,
  color = '#3b82f6',
  visible = true,
}: OrbitPathProps) {
  if (!visible) return null;

  const lineColor = isSelected ? '#38bdf8' : isHovered ? '#60a5fa' : color;
  const lineOpacity = isSelected ? 0.75 : isHovered ? 0.45 : 0.18;
  const ringWidth = isSelected ? 0.08 : isHovered ? 0.06 : 0.04;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[Math.max(0.1, radius - ringWidth), radius + ringWidth, 128]} />
      <meshBasicMaterial
        color={lineColor}
        transparent
        opacity={lineOpacity}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}
