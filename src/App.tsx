import { useEffect, useState, lazy, Suspense } from 'react';
import { SolarCanvas } from './components/3d/SolarCanvas';
import { Header } from './components/ui/Header';
import { ControlsPanel } from './components/ui/ControlsPanel';
import { PlanetSelector } from './components/ui/PlanetSelector';
import { InfoPanel } from './components/ui/InfoPanel';
const TourGuideModal = lazy(() => import('./components/ui/TourGuideModal').then((m) => ({ default: m.TourGuideModal })));
const SettingsModal = lazy(() => import('./components/ui/SettingsModal').then((m) => ({ default: m.SettingsModal })));
import { LoadingScreen } from './components/ui/LoadingScreen';
import { SimulationClock } from './components/ui/SimulationClock';
import { MiniMap } from './components/ui/MiniMap';
import { ShowcaseView } from './components/showcase/ShowcaseView';
import { useSolarStore } from './store/solarStore';
import { allCelestialBodies } from './data/planets';
import { useDeviceProfile } from './utils/deviceProfile';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const viewMode = useSolarStore((s) => s.viewMode);
  const selectPlanet = useSolarStore((s) => s.selectPlanet);
  const togglePause = useSolarStore((s) => s.togglePause);
  const selectedPlanetId = useSolarStore((s) => s.selectedPlanetId);
  const isTourActive = useSolarStore((s) => s.isTourActive);
  const nextTourStep = useSolarStore((s) => s.nextTourStep);
  const prevTourStep = useSolarStore((s) => s.prevTourStep);
  const resetView = useSolarStore((s) => s.resetView);
  const closeInfoPanel = useSolarStore((s) => s.closeInfoPanel);
  const toggleInfoPanel = useSolarStore((s) => s.toggleInfoPanel);
  const isInfoPanelOpen = useSolarStore((s) => s.isInfoPanelOpen);
  const isPanoramaMode = useSolarStore((s) => s.isPanoramaMode);
  const togglePanoramaMode = useSolarStore((s) => s.togglePanoramaMode);
  const { isTouch, tier: deviceTier } = useDeviceProfile();

  // Step4: mark touch devices for enlarged hit-areas via CSS
  useEffect(() => {
    if (isTouch) document.body.classList.add('is-touch-device');
    else document.body.classList.remove('is-touch-device');
    return () => document.body.classList.remove('is-touch-device');
  }, [isTouch]);

  // Keyboard shortcut navigation for freeExplore mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Escape') {
        if (isPanoramaMode) {
          togglePanoramaMode();
        } else if (isInfoPanelOpen) {
          closeInfoPanel();
        } else if (viewMode === 'freeExplore') {
          resetView();
        }
        return;
      }

      // Toggle info panel with 'I'
      if (e.code === 'KeyI' || e.key === 'i' || e.key === 'I') {
        if (selectedPlanetId) {
          e.preventDefault();
          toggleInfoPanel();
          return;
        }
      }

      // Only handle Space / Left / Right in freeExplore
      if (viewMode === 'freeExplore') {
        if (e.code === 'Space') {
          e.preventDefault();
          togglePause();
        } else if (e.code === 'ArrowRight') {
          if (isTourActive) {
            nextTourStep();
          } else {
            const currentIndex = Math.max(0, allCelestialBodies.findIndex((p) => p.id === selectedPlanetId));
            const nextIndex = (currentIndex + 1) % allCelestialBodies.length;
            selectPlanet(allCelestialBodies[nextIndex].id);
          }
        } else if (e.code === 'ArrowLeft') {
          if (isTourActive) {
            prevTourStep();
          } else {
            const currentIndex = Math.max(0, allCelestialBodies.findIndex((p) => p.id === selectedPlanetId));
            const prevIndex = (currentIndex - 1 + allCelestialBodies.length) % allCelestialBodies.length;
            selectPlanet(allCelestialBodies[prevIndex].id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    viewMode,
    togglePause,
    resetView,
    isTourActive,
    nextTourStep,
    prevTourStep,
    selectedPlanetId,
    selectPlanet,
    isInfoPanelOpen,
    closeInfoPanel,
    toggleInfoPanel,
    isPanoramaMode,
    togglePanoramaMode,
  ]);

  return (
    <main className={`app-container ${isInfoPanelOpen ? 'has-info-panel-open' : ''}`}>
      {!isPanoramaMode && <div className="app-vignette" aria-hidden="true" />}
      {isLoading && <LoadingScreen onFinished={() => setIsLoading(false)} />}

      {viewMode === 'showcase' ? (
        <>
          {/* Showcase Mode (Split-screen scroll navigation) */}
          <ShowcaseView />
          {/* Detailed Drawer Modal if requested */}
          <InfoPanel />
        </>
      ) : (
        <>
          {/* 3D WebGL Three.js Canvas */}
          <SolarCanvas />

          {/* Glassmorphic UI Layers for Free Exploration */}
          {!isPanoramaMode && (
            <>
              <Header />
              <Suspense fallback={null}>
                <TourGuideModal />
              </Suspense>
              <InfoPanel />
              <ControlsPanel />
              <PlanetSelector />
              <Suspense fallback={null}>
                <SettingsModal />
              </Suspense>
              <SimulationClock />
              <MiniMap />

              {/* Interactive Helper Hint */}
              {!isTouch && (
              <div className="keyboard-hint" title="Phim tat dieu khien">
                <span>
                  Phím tắt: <strong>Space</strong> (Tạm dừng) • <strong>← / →</strong> (Chuyển hành tinh) • <strong>I</strong> (Kéo ra / Thu lại bảng) • <strong>Esc</strong> (Toàn cảnh)
                </span>
              </div>
              )}
            </>
          )}

          {/* Panorama Mode Exit Hint */}
          {isPanoramaMode && (
            <div className="panorama-exit-hint">
              <span>Nhấn <strong>Esc</strong> hoặc bấm nút <strong>Toàn cảnh</strong> để thoát</span>
            </div>
          )}
        </>
      )}
    </main>
  );
}
