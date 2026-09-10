import { useEffect, useState, lazy, Suspense } from 'react';
import { SolarCanvas } from './components/3d/SolarCanvas';
import { Header } from './components/ui/Header';
import { ControlsPanel } from './components/ui/ControlsPanel';
import { PlanetSelector } from './components/ui/PlanetSelector';
import { InfoPanel } from './components/ui/InfoPanel';
const TourGuideModal = lazy(() => import('./components/ui/TourGuideModal').then((m) => ({ default: m.TourGuideModal })));
const SettingsModal = lazy(() => import('./components/ui/SettingsModal').then((m) => ({ default: m.SettingsModal })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const AdminAuthGate = lazy(() => import('./components/admin/AdminAuthGate').then((m) => ({ default: m.AdminAuthGate })));
import { LoadingScreen } from './components/ui/LoadingScreen';
import { SimulationClock } from './components/ui/SimulationClock';
import { MiniMap } from './components/ui/MiniMap';
import { ShowcaseView } from './components/showcase/ShowcaseView';
import { Lock } from 'lucide-react';
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
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Check URL parameter (?admin=portal or #admin) and session on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('ss3d_admin_authenticated') === 'true') {
      setIsAdminAuthenticated(true);
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'portal' || window.location.hash === '#admin') {
      setIsAdminModalOpen(true);
    }
  }, []);

  // Step4: mark touch devices for enlarged hit-areas via CSS
  useEffect(() => {
    if (isTouch) document.body.classList.add('is-touch-device');
    else document.body.classList.remove('is-touch-device');
    return () => document.body.classList.remove('is-touch-device');
  }, [isTouch]);

  // Keyboard shortcut navigation for freeExplore mode & Admin Portal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Admin shortcut: Ctrl+Shift+A or Cmd+Shift+A (works from anywhere)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminModalOpen((prev) => !prev);
        return;
      }

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

      {/* Admin Portal (Private Revenue & Asset Management Suite) */}
      {isAdminModalOpen && (
        <Suspense fallback={null}>
          {isAdminAuthenticated ? (
            <AdminDashboard
              onClose={() => setIsAdminModalOpen(false)}
              onLogout={() => {
                sessionStorage.removeItem('ss3d_admin_authenticated');
                setIsAdminAuthenticated(false);
                setIsAdminModalOpen(false);
              }}
            />
          ) : (
            <AdminAuthGate
              onSuccess={() => setIsAdminAuthenticated(true)}
              onClose={() => setIsAdminModalOpen(false)}
            />
          )}
        </Suspense>
      )}

      {/* Discrete Admin Keyhole Trigger at Bottom Right */}
      <button
        className="admin-portal-floating-trigger"
        onClick={() => setIsAdminModalOpen(true)}
        title="Cổng Quản Trị Doanh Thu & Tài Sản (Ctrl + Shift + A)"
        aria-label="Cổng Quản Trị"
      >
        <Lock size={12} />
      </button>
    </main>
  );
}
