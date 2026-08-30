import { useState, useEffect, useMemo } from 'react';
import type { QualityPreset } from '../types/planet';

export type DeviceTier = 'low' | 'medium' | 'high';

export interface DeviceProfile {
  tier: DeviceTier;
  isTouch: boolean;
  isNarrowViewport: boolean;
}

function getEffectivePixels(): number {
  if (typeof window === 'undefined') return 1920;
  const w = window.screen?.width ?? window.innerWidth;
  const dpr = window.devicePixelRatio ?? 1;
  return w * dpr;
}

function isTouchPointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

function downgradeTier(t: DeviceTier): DeviceTier {
  if (t === 'high') return 'medium';
  if (t === 'medium') return 'low';
  return 'low';
}

export function getDeviceTier(): DeviceTier {
  if (typeof window === 'undefined') return 'high';
  const effectivePixels = getEffectivePixels();
  const isTouch = isTouchPointer();

  let tier: DeviceTier;
  if (effectivePixels < 900 || (isTouch && effectivePixels < 1400)) {
    tier = 'low';
  } else if (effectivePixels < 1800) {
    tier = 'medium';
  } else {
    tier = 'high';
  }

  try {
    const hc = (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency;
    if (typeof hc === 'number' && hc < 4) {
      tier = downgradeTier(tier);
    }
  } catch { }

  try {
    const dm = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    if (typeof dm !== 'undefined' && typeof dm === 'number' && dm < 4) {
      tier = downgradeTier(tier);
    }
  } catch { }

  return tier;
}

export function resolveAutoQuality(): QualityPreset {
  const tier = getDeviceTier();
  return tier as QualityPreset;
}

export function useDeviceProfile(): DeviceProfile {
  const [isNarrowViewport, setIsNarrowViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 640;
  });

  const tier = useMemo<DeviceTier>(() => getDeviceTier(), []);
  const isTouch = useMemo<boolean>(() => isTouchPointer(), []);

  useEffect(() => {
    let timeoutId: number | undefined;
    const handleResize = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsNarrowViewport(window.innerWidth <= 640);
      }, 200) as unknown as number;
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return { tier, isTouch, isNarrowViewport };
}
