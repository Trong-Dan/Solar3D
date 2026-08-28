import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { easing } from 'maath';
import { useSolarStore } from '../../store/solarStore';
import { planets, sunData } from '../../data/planets';

interface CameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl>;
}

export function CameraController({ controlsRef }: CameraControllerProps) {
  const { camera, scene } = useThree();
  const selectedPlanetId = useSolarStore((s) => s.selectedPlanetId);
  const scaleMode = useSolarStore((s) => s.scaleMode);
  const focusRequest = useSolarStore((s) => s.focusRequest);
  const isPanoramaMode = useSolarStore((s) => s.isPanoramaMode);

  const isTransitioningRef = useRef(false);
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0, 0));
  const targetCamPosRef = useRef(new THREE.Vector3(0, 30, 52));
  const lastPlanetIdRef = useRef<string | null>(null);
  const transitionTimerRef = useRef<number | null>(null);

  // Determine focus distance depending on planet size
  const getFocusDistance = (id: string) => {
    if (id === 'sun') return 12;
    const p = planets.find((item) => item.id === id);
    if (!p) return 8;
    const radius = scaleMode === 'readable' ? p.radius : (p.physical.diameterKm / 12742) * 0.7;
    return radius * 3.5 + 2.5;
  };

  // Trigger a smooth transition whenever the selected planet changes
  useEffect(() => {
    const changedPlanet = selectedPlanetId !== lastPlanetIdRef.current;
    lastPlanetIdRef.current = selectedPlanetId;

    if (changedPlanet || selectedPlanetId) {
      isTransitioningRef.current = true;
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
      transitionTimerRef.current = window.setTimeout(() => {
        isTransitioningRef.current = false;
      }, 1600);
    }

    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, [selectedPlanetId, focusRequest]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    const controls = controlsRef.current;
    const dampFactor = 4.5;

    // 1. Overview Mode (No planet selected)
    if (!selectedPlanetId) {
      targetLookAtRef.current.set(0, 0, 0);
      // Panorama: cinematic pull-back to reveal the whole system
      if (isPanoramaMode) {
        targetCamPosRef.current.set(0, 48, 82);
      } else {
        targetCamPosRef.current.set(0, 30, 52);
      }

      easing.damp3(controls.target, targetLookAtRef.current, 0.5, delta);
      // Slower damp in panorama = long, controlled arc (Elegance emotion mapping)
      easing.damp3(camera.position, targetCamPosRef.current, isPanoramaMode ? 1.1 : 0.6, delta);
      controls.update();
      return;
    }

    // 2. Sun Mode
    if (selectedPlanetId === 'sun') {
      targetLookAtRef.current.set(0, 0, 0);
      easing.damp3(controls.target, targetLookAtRef.current, 0.35, delta);

      if (isTransitioningRef.current) {
        targetCamPosRef.current.set(0, 5, sunData.radius * 3.2);
        easing.damp3(camera.position, targetCamPosRef.current, 0.5, delta);
      }
      controls.update();
      return;
    }

    // 3. Planet Mode (Tracking moving planet in orbit)
    const planetObj = scene.getObjectByName(`planet-${selectedPlanetId}`);
    if (planetObj) {
      const planetWorldPos = new THREE.Vector3();
      planetObj.getWorldPosition(planetWorldPos);

      targetLookAtRef.current.copy(planetWorldPos);
      const focusDist = getFocusDistance(selectedPlanetId);

      if (isTransitioningRef.current) {
        // Calculate ideal camera offset relative to orbit direction
        const offsetDir = planetWorldPos.clone().normalize();
        const camOffset = new THREE.Vector3(
          offsetDir.x * focusDist * 0.8 + 1,
          focusDist * 0.5,
          offsetDir.z * focusDist * 0.8 + focusDist * 0.8
        );
        targetCamPosRef.current.copy(planetWorldPos).add(camOffset);
        easing.damp3(camera.position, targetCamPosRef.current, 0.5, delta);
      } else {
        // Keep camera glued to the planet while preserving user orbit angles
        const currentTargetDiff = planetWorldPos.clone().sub(controls.target);
        camera.position.addScaledVector(currentTargetDiff, Math.min(1, delta * 6));
      }

      easing.damp3(controls.target, planetWorldPos, dampFactor, delta);
      controls.update();
    }
  });

  return null;
}
