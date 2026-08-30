import { QualityPreset, ScaleMode } from '../types/planet';

export interface PersistedSettings {
  quality: QualityPreset;
  scaleMode: ScaleMode;
  showOrbits: boolean;
  showLabels: boolean;
  showAsteroidBelt: boolean;
  showMoons: boolean;
  soundEnabled: boolean;
  volume: number;
  timeScale: number;
  isDockCollapsed?: boolean;
  isHeaderCollapsed?: boolean;
}

const STORAGE_KEY = 'solar-system-3d-settings';

export function loadPersistedSettings(): Partial<PersistedSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<PersistedSettings>;
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}

export function hasStoredSettings(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function savePersistedSettings(settings: PersistedSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage may be unavailable (private mode, quota...)
  }
}
