import { useState } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Layers,
  Tag,
  CircleDot,
  Radio,
  BookOpen,
  Settings,
  Maximize2,
  Minimize2,
  Compass,
  ArrowUpRight,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useSolarStore } from '../../store/solarStore';

export function Header() {
  const soundEnabled = useSolarStore((s) => s.soundEnabled);
  const toggleSound = useSolarStore((s) => s.toggleSound);
  const scaleMode = useSolarStore((s) => s.scaleMode);
  const setScaleMode = useSolarStore((s) => s.setScaleMode);
  const showOrbits = useSolarStore((s) => s.showOrbits);
  const toggleOrbits = useSolarStore((s) => s.toggleOrbits);
  const showLabels = useSolarStore((s) => s.showLabels);
  const toggleLabels = useSolarStore((s) => s.toggleLabels);
  const showAsteroidBelt = useSolarStore((s) => s.showAsteroidBelt);
  const toggleAsteroidBelt = useSolarStore((s) => s.toggleAsteroidBelt);
  const showMoons = useSolarStore((s) => s.showMoons);
  const toggleMoons = useSolarStore((s) => s.toggleMoons);
  const startTour = useSolarStore((s) => s.startTour);
  const isTourActive = useSolarStore((s) => s.isTourActive);
  const resetView = useSolarStore((s) => s.resetView);
  const selectedPlanetId = useSolarStore((s) => s.selectedPlanetId);
  const enterShowcase = useSolarStore((s) => s.enterShowcase);
  const openSettings = useSolarStore((s) => s.openSettings);
  const isPanoramaMode = useSolarStore((s) => s.isPanoramaMode);
  const togglePanoramaMode = useSolarStore((s) => s.togglePanoramaMode);
  const isHeaderCollapsed = useSolarStore((s) => s.isHeaderCollapsed);
  const toggleHeaderCollapsed = useSolarStore((s) => s.toggleHeaderCollapsed);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <>
      <header className={`island-header-wrapper ${isHeaderCollapsed ? 'is-collapsed' : ''}`} role="banner">
        <div className="island-header-shell">
          <div className="island-header-core">
            {/* Brand Logo & Title */}
            <div
              className="island-brand-group"
              onClick={resetView}
              role="button"
              tabIndex={0}
              title="Nhấp để quay lại góc nhìn toàn cảnh Hệ Mặt Trời"
            >
              <div className="island-sun-orb">
                <div className="sun-plasma-core" />
                <div className="sun-corona-ring" />
              </div>
              <div className="island-brand-text">
                <div className="brand-badge-pill">
                  <span className="badge-live-dot" />
                  VŨ TRỤ 3D
                </div>
                <h1 className="island-brand-title">HỆ MẶT TRỜI</h1>
              </div>
            </div>

            <div className="island-divider" />

            {/* Center Navigation & Modes */}
            <div className="island-center-nav">
              {/* Mode Switcher */}
              <button
                className="island-nav-btn island-showcase-btn group"
                onClick={() => enterShowcase(selectedPlanetId || undefined)}
                title="Xem chế độ giới thiệu chi tiết từng hành tinh"
              >
                <BookOpen size={16} className="island-btn-icon" />
                <span>Giới thiệu</span>
                <span className="island-icon-chip">
                  <ArrowUpRight size={13} className="island-chip-arrow" />
                </span>
              </button>

              {/* Cinematic Tour */}
              <button
                className={`island-nav-btn island-tour-btn group ${isTourActive ? 'active' : ''}`}
                onClick={startTour}
                title="Bắt đầu chuyến du hành không gian tự động"
              >
                <Sparkles size={16} className="sparkle-orbit-icon" />
                <span>Du hành Tour</span>
                <span className="tour-status-pip" />
              </button>

              {/* Panorama Mode */}
              <button
                className={'island-nav-btn island-panorama-btn group' + (isPanoramaMode ? ' active' : '')}
                onClick={togglePanoramaMode}
                title={isPanoramaMode ? 'Thoát chế độ toàn cảnh' : 'Xem toàn bộ hệ mặt trời không giao diện'}
              >
                <Eye size={16} className="island-btn-icon" />
                <span>Toàn cảnh</span>
              </button>
              {/* Scale Switcher Pill */}
              <div className="island-scale-switcher" title="Chuyển đổi kích thước trực quan và tỉ lệ thực tế">
                <button
                  className={`scale-pill-btn ${scaleMode === 'readable' ? 'active' : ''}`}
                  onClick={() => setScaleMode('readable')}
                >
                  Dễ nhìn
                </button>
                <button
                  className={`scale-pill-btn ${scaleMode === 'realistic' ? 'active' : ''}`}
                  onClick={() => setScaleMode('realistic')}
                >
                  Tỉ lệ thực
                </button>
              </div>
            </div>

            <div className="island-divider" />

            {/* Toggle Layers */}
            <div className="island-layer-toggles">
              {/* Orbits Toggle */}
              <button
                className={`layer-toggle-chip ${showOrbits ? 'active' : ''}`}
                onClick={toggleOrbits}
                title={showOrbits ? 'Ẩn đường quỹ đạo' : 'Hiện đường quỹ đạo'}
              >
                <CircleDot size={16} />
                <span className="chip-text">Quỹ đạo</span>
                <span className={`chip-indicator ${showOrbits ? 'on' : ''}`} />
              </button>

              {/* Labels Toggle */}
              <button
                className={`layer-toggle-chip ${showLabels ? 'active' : ''}`}
                onClick={toggleLabels}
                title={showLabels ? 'Ẩn nhãn thiên thể' : 'Hiện nhãn thiên thể'}
              >
                <Tag size={16} />
                <span className="chip-text">Nhãn</span>
                <span className={`chip-indicator ${showLabels ? 'on' : ''}`} />
              </button>

              {/* Asteroid Belt Toggle */}
              <button
                className={`layer-toggle-chip ${showAsteroidBelt ? 'active' : ''}`}
                onClick={toggleAsteroidBelt}
                title={showAsteroidBelt ? 'Ẩn vành đai tiểu hành tinh' : 'Hiện vành đai tiểu hành tinh'}
              >
                <Layers size={16} />
                <span className="chip-text">Tiểu hành tinh</span>
                <span className={`chip-indicator ${showAsteroidBelt ? 'on' : ''}`} />
              </button>

              {/* Moons Toggle */}
              <button
                className={`layer-toggle-chip ${showMoons ? 'active' : ''}`}
                onClick={toggleMoons}
                title={showMoons ? 'Ẩn các vệ tinh tự nhiên' : 'Hiện các vệ tinh tự nhiên'}
              >
                <Radio size={16} />
                <span className="chip-text">Vệ tinh</span>
                <span className={`chip-indicator ${showMoons ? 'on' : ''}`} />
              </button>
            </div>

            <div className="island-divider" />

            {/* Quick Utility Actions */}
            <div className="island-actions-group">
              {/* Reset Camera if a planet is selected */}
              {selectedPlanetId && (
                <button
                  className="island-action-btn btn-reset-view"
                  onClick={resetView}
                  title="Về góc nhìn tổng quan Hệ Mặt Trời (Esc)"
                  aria-label="Về góc nhìn tổng quan Hệ Mặt Trời"
                >
                  <RotateCcw size={16} />
                </button>
              )}

              {/* Dynamic Sound Equalizer Button */}
              <button
                className={`island-action-btn btn-sound-toggle ${soundEnabled ? 'sound-active' : ''}`}
                onClick={toggleSound}
                title={soundEnabled ? 'Tắt âm thanh vũ trụ' : 'Bật âm thanh vũ trụ'}
                aria-label="Toggle Sound"
              >
                {soundEnabled ? (
                  <div className="audio-wave-anim">
                    <span className="wave-bar bar-1" />
                    <span className="wave-bar bar-2" />
                    <span className="wave-bar bar-3" />
                  </div>
                ) : (
                  <VolumeX size={17} />
                )}
              </button>

              {/* Settings Modal Toggle */}
              <button
                className="island-action-btn"
                onClick={openSettings}
                title="Mở cài đặt đồ họa & hệ thống"
                aria-label="Open Settings"
              >
                <Settings size={17} />
              </button>

              {/* Fullscreen Toggle */}
              <button
                className="island-action-btn"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Thoát toàn màn hình' : 'Chế độ toàn màn hình'}
                aria-label="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
              </button>

              {/* Header Collapse Handle */}
              <button
                className="island-action-btn header-collapse-handle"
                onClick={toggleHeaderCollapsed}
                title={isHeaderCollapsed ? 'Mở header' : 'Thu gọn header'}
                aria-label={isHeaderCollapsed ? 'Mở header' : 'Thu gọn header'}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>
      {isHeaderCollapsed && (
        <button
          className="header-collapsed-tab"
          onClick={toggleHeaderCollapsed}
          aria-label="Mở header"
          title="Mở header"
        >
          <ChevronLeft size={18} />
        </button>
      )}
    </>
  );
}
