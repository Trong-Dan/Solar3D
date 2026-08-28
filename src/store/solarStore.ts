import { create } from 'zustand';
import { InfoTabType, QualityPreset, ScaleMode } from '../types/planet';
import { soundEngine } from '../utils/soundEngine';
import { allCelestialBodies, planets } from '../data/planets';
import { loadPersistedSettings, savePersistedSettings } from '../utils/settingsStorage';

export type ViewMode = 'showcase' | 'freeExplore' | 'panorama';

const tourPlanetsList = ['sun', ...planets.map((p) => p.id)];

const persisted = loadPersistedSettings();

interface SolarState {
  viewMode: ViewMode;
  showcaseIndex: number;
  selectedPlanetId: string | null;
  hoveredPlanetId: string | null;
  timeScale: number;
  isPaused: boolean;
  reverseTime: boolean;
  scaleMode: ScaleMode;
  quality: QualityPreset;
  showOrbits: boolean;
  showLabels: boolean;
  showAsteroidBelt: boolean;
  showMoons: boolean;
  
  // Cinematic Tour Mode
  isTourActive: boolean;
  tourStepIndex: number;

  // Sound
  soundEnabled: boolean;
  volume: number;

  // UI
  isInfoPanelOpen: boolean;
  activeInfoTab: InfoTabType;
  isSettingsOpen: boolean;
  focusRequest: number;
  isPanoramaMode: boolean;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setShowcaseIndex: (index: number, opts?: { silent?: boolean }) => void;
  enterFreeExplore: (planetId?: string) => void;
  enterShowcase: (planetId?: string) => void;
  selectPlanet: (id: string | null) => void;
  setHoveredPlanet: (id: string | null) => void;
  setTimeScale: (scale: number) => void;
  togglePause: () => void;
  toggleReverseTime: () => void;
  setScaleMode: (mode: ScaleMode) => void;
  setQuality: (quality: QualityPreset) => void;
  toggleOrbits: () => void;
  toggleLabels: () => void;
  toggleAsteroidBelt: () => void;
  toggleMoons: () => void;
  toggleSound: () => void;
  setVolume: (vol: number) => void;
  setActiveInfoTab: (tab: InfoTabType) => void;
  openInfoPanel: () => void;
  closeInfoPanel: () => void;
  toggleInfoPanel: () => void;
  resetView: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  requestCameraFocus: () => void;
  togglePanoramaMode: () => void;

  // Tour controls
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  endTour: () => void;
}

export const useSolarStore = create<SolarState>((set, get) => ({
  viewMode: 'showcase',
  showcaseIndex: 0,
  selectedPlanetId: null,
  hoveredPlanetId: null,
  timeScale: persisted.timeScale ?? 1,
  isPaused: false,
  reverseTime: false,
  scaleMode: persisted.scaleMode ?? 'readable',
  quality: persisted.quality ?? 'high',
  showOrbits: persisted.showOrbits ?? true,
  showLabels: persisted.showLabels ?? true,
  showAsteroidBelt: persisted.showAsteroidBelt ?? true,
  showMoons: persisted.showMoons ?? true,

  isTourActive: false,
  tourStepIndex: 0,

  soundEnabled: persisted.soundEnabled ?? false,
  volume: persisted.volume ?? 0.4,

  isInfoPanelOpen: false,
  activeInfoTab: 'overview',
  isSettingsOpen: false,
  focusRequest: 0,
  isPanoramaMode: false,

  setViewMode: (mode: ViewMode) => {
    soundEngine.playClick();
    if (mode === 'freeExplore') {
      const { showcaseIndex } = get();
      const currentTarget = allCelestialBodies[Math.max(0, Math.min(showcaseIndex - 1, allCelestialBodies.length - 1))]?.id || 'sun';
      set({ viewMode: 'freeExplore' });
      get().selectPlanet(currentTarget);
    } else {
      const { selectedPlanetId } = get();
      let index = 0;
      if (selectedPlanetId) {
        const found = allCelestialBodies.findIndex((p) => p.id === selectedPlanetId);
         if (found !== -1) index = found + 1;
      }
      set({ viewMode: 'showcase', showcaseIndex: index });
    }
  },

  setShowcaseIndex: (index: number, opts?: { silent?: boolean }) => {
    const validIndex = Math.max(0, Math.min(allCelestialBodies.length + 2, index));
    if (validIndex !== get().showcaseIndex) {
      if (!opts?.silent) soundEngine.playPlanetSelect();
      set({ showcaseIndex: validIndex });
    }
  },

  enterFreeExplore: (planetId?: string) => {
    soundEngine.playClick();
    const targetId = planetId || allCelestialBodies[Math.max(0, Math.min(get().showcaseIndex - 1, allCelestialBodies.length - 1))]?.id || 'sun';
    set({ viewMode: 'freeExplore' });
    get().selectPlanet(targetId);
  },

  enterShowcase: (planetId?: string) => {
    soundEngine.playClick();
    soundEngine.playWhoosh();
    const targetId = planetId || get().selectedPlanetId || 'sun';
    const index = allCelestialBodies.findIndex((p) => p.id === targetId);
    set({
      viewMode: 'showcase',
       showcaseIndex: index !== -1 ? index + 1 : 0,
      isInfoPanelOpen: false,
    });
  },

  selectPlanet: (id: string | null) => {
    if (id) {
      soundEngine.playPlanetSelect();
      soundEngine.playWhoosh();
      set({
        selectedPlanetId: id,
        isInfoPanelOpen: true,
      });
    } else {
      set({
        selectedPlanetId: null,
        isInfoPanelOpen: false,
      });
    }
  },

  setHoveredPlanet: (id: string | null) => {
    set({ hoveredPlanetId: id });
  },

  setTimeScale: (scale: number) => {
    set({ timeScale: Math.max(0, Math.min(10, scale)) });
  },

  togglePause: () => {
    soundEngine.playClick();
    set((state) => ({ isPaused: !state.isPaused }));
  },

  toggleReverseTime: () => {
    soundEngine.playClick();
    set((state) => ({ reverseTime: !state.reverseTime }));
  },

  setScaleMode: (mode: ScaleMode) => {
    soundEngine.playClick();
    set({ scaleMode: mode });
  },

  setQuality: (quality: QualityPreset) => {
    soundEngine.playClick();
    set({ quality });
  },

  toggleOrbits: () => {
    soundEngine.playClick();
    set((state) => ({ showOrbits: !state.showOrbits }));
  },

  toggleLabels: () => {
    soundEngine.playClick();
    set((state) => ({ showLabels: !state.showLabels }));
  },

  toggleAsteroidBelt: () => {
    soundEngine.playClick();
    set((state) => ({ showAsteroidBelt: !state.showAsteroidBelt }));
  },

  toggleMoons: () => {
    soundEngine.playClick();
    set((state) => ({ showMoons: !state.showMoons }));
  },

  toggleSound: () => {
    const next = !get().soundEnabled;
    soundEngine.setMuted(!next);
    set({ soundEnabled: next });
    if (next) {
      soundEngine.playClick();
    }
  },

  setVolume: (vol: number) => {
    soundEngine.setVolume(vol);
    set({ volume: vol });
  },

  setActiveInfoTab: (tab: InfoTabType) => {
    soundEngine.playClick();
    set({ activeInfoTab: tab });
  },

  openInfoPanel: () => {
    soundEngine.playPlanetSelect();
    soundEngine.playWhoosh();
    set({ isInfoPanelOpen: true });
  },

  closeInfoPanel: () => {
    soundEngine.playClick();
    set({ isInfoPanelOpen: false });
  },

  toggleInfoPanel: () => {
    const next = !get().isInfoPanelOpen;
    if (next) {
      soundEngine.playPlanetSelect();
      soundEngine.playWhoosh();
    } else {
      soundEngine.playClick();
    }
    set({ isInfoPanelOpen: next });
  },

  togglePanoramaMode: () => {
    const { isPanoramaMode } = get();
    if (!isPanoramaMode) {
      set({
        isPanoramaMode: true,
        viewMode: 'freeExplore' as ViewMode,
        selectedPlanetId: null,
        hoveredPlanetId: null,
        isInfoPanelOpen: false,
        isSettingsOpen: false,
        isTourActive: false,
      });
      soundEngine.playWhoosh();
    } else {
      set({ isPanoramaMode: false });
      soundEngine.playClick();
    }
  },
  resetView: () => {
    soundEngine.playWhoosh();
    set({
      selectedPlanetId: null,
      isInfoPanelOpen: false,
      isTourActive: false,
    });
  },

  openSettings: () => {
    soundEngine.playClick();
    set({ isSettingsOpen: true });
  },

  closeSettings: () => {
    soundEngine.playClick();
    set({ isSettingsOpen: false });
  },

  requestCameraFocus: () => {
    soundEngine.playWhoosh();
    set((state) => ({ focusRequest: state.focusRequest + 1 }));
  },

  startTour: () => {
    soundEngine.playClick();
    soundEngine.playWhoosh();
    set({
      isTourActive: true,
      tourStepIndex: 0,
      selectedPlanetId: tourPlanetsList[0],
      isInfoPanelOpen: true,
      activeInfoTab: 'overview',
    });
  },

  nextTourStep: () => {
    const { tourStepIndex } = get();
    const nextIndex = (tourStepIndex + 1) % tourPlanetsList.length;
    const targetId = tourPlanetsList[nextIndex];
    soundEngine.playPlanetSelect();
    soundEngine.playWhoosh();
    set({
      tourStepIndex: nextIndex,
      selectedPlanetId: targetId,
      isInfoPanelOpen: true,
    });
  },

  prevTourStep: () => {
    const { tourStepIndex } = get();
    const prevIndex = (tourStepIndex - 1 + tourPlanetsList.length) % tourPlanetsList.length;
    const targetId = tourPlanetsList[prevIndex];
    soundEngine.playPlanetSelect();
    soundEngine.playWhoosh();
    set({
      tourStepIndex: prevIndex,
      selectedPlanetId: targetId,
      isInfoPanelOpen: true,
    });
  },

  endTour: () => {
    soundEngine.playClick();
    set({
      isTourActive: false,
    });
  },
}));

// Auto-persist user preferences
useSolarStore.subscribe((state) => {
  savePersistedSettings({
    quality: state.quality,
    scaleMode: state.scaleMode,
    showOrbits: state.showOrbits,
    showLabels: state.showLabels,
    showAsteroidBelt: state.showAsteroidBelt,
    showMoons: state.showMoons,
    soundEnabled: state.soundEnabled,
    volume: state.volume,
    timeScale: state.timeScale,
  });
});
