import {
  X,
  Sparkles,
  Layers,
  Thermometer,
  Orbit,
  Globe,
  Radio,
  Rocket,
  BarChart2,
  Calendar,
  Eye,
  Activity,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Compass,
  ShieldCheck,
  Scale,
  Minimize2,
} from 'lucide-react';
import { allCelestialBodies } from '../../data/planets';
import { useSolarStore } from '../../store/solarStore';
import { scrollShowcaseToIndex } from '../../utils/showcaseScroll';
import { InfoTabType } from '../../types/planet';

export function InfoPanel() {
  const selectedPlanetId = useSolarStore((s) => s.selectedPlanetId);
  const isInfoPanelOpen = useSolarStore((s) => s.isInfoPanelOpen);
  const openInfoPanel = useSolarStore((s) => s.openInfoPanel);
  const closeInfoPanel = useSolarStore((s) => s.closeInfoPanel);
  const activeInfoTab = useSolarStore((s) => s.activeInfoTab);
  const setActiveInfoTab = useSolarStore((s) => s.setActiveInfoTab);
  const selectPlanet = useSolarStore((s) => s.selectPlanet);
  const requestCameraFocus = useSolarStore((s) => s.requestCameraFocus);
  const viewMode = useSolarStore((s) => s.viewMode);
  const setShowcaseIndex = useSolarStore((s) => s.setShowcaseIndex);
  const enterFreeExplore = useSolarStore((s) => s.enterFreeExplore);
  const isShowcase = viewMode === 'showcase';

  const goToPlanet = (id: string) => {
    selectPlanet(id);
    if (isShowcase) {
      const targetIndex = allCelestialBodies.findIndex((p) => p.id === id);
      if (targetIndex !== -1) {
        setShowcaseIndex(targetIndex + 1, { silent: true });
        scrollShowcaseToIndex(targetIndex + 1);
      }
    }
  };

  if (!selectedPlanetId) return null;

  const currentPlanet = allCelestialBodies.find((p) => p.id === selectedPlanetId);
  if (!currentPlanet) return null;

  // Earth comparison ratios
  const earthData = allCelestialBodies.find((p) => p.id === 'earth')!;
  const diameterRatio = (currentPlanet.physical.diameterKm / earthData.physical.diameterKm).toFixed(2);
  const gravityRatio = (currentPlanet.physical.gravity / earthData.physical.gravity).toFixed(2);

  const currentIndex = allCelestialBodies.findIndex((p) => p.id === selectedPlanetId);
  const prevPlanet = allCelestialBodies[(currentIndex - 1 + allCelestialBodies.length) % allCelestialBodies.length];
  const nextPlanet = allCelestialBodies[(currentIndex + 1) % allCelestialBodies.length];

  const tabs: { id: InfoTabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Tổng quan', icon: <Sparkles size={16} /> },
    { id: 'physical', label: 'Vật lý', icon: <Thermometer size={16} /> },
    { id: 'orbit', label: 'Quỹ đạo', icon: <Orbit size={16} /> },
    { id: 'moons', label: `Vệ tinh (${currentPlanet.moonCount})`, icon: <Radio size={16} /> },
    { id: 'missions', label: `Thám hiểm (${currentPlanet.missions.length})`, icon: <Rocket size={16} /> },
    { id: 'comparison', label: 'So sánh', icon: <BarChart2 size={16} /> },
  ];

  // Collapsed State: Sleek Floating Frame Trigger on the right edge (only in Free Explore)
  if (!isInfoPanelOpen) {
    if (isShowcase) return null;

    return (
      <aside
        className="dossier-collapsed-trigger-wrapper animate-slide-in-right"
        aria-label={`Mở bảng thông tin ${currentPlanet.name}`}
      >
        <button
          className="dossier-collapsed-trigger-frame"
          onClick={openInfoPanel}
          title={`Kéo ra bảng thông tin chi tiết của ${currentPlanet.name} (Phím I hoặc nhấp)`}
          style={{
            ['--planet-theme' as string]: currentPlanet.color,
          }}
        >
          <div className="trigger-frame-pulse-ring" />
          <div className="trigger-frame-shell">
            <div className="trigger-frame-core">
              <div className="trigger-text-stack">
                <span className="trigger-badge-tag">HỒ SƠ THIÊN VĂN</span>
                <span className="trigger-planet-title">{currentPlanet.name}</span>
              </div>
              <div className="trigger-action-pill">
                <ChevronLeft size={17} className="trigger-action-arrow" />
                <span className="trigger-action-text">Kéo ra</span>
              </div>
            </div>
          </div>
        </button>
      </aside>
    );
  }

  // Expanded State: Full Detailed Astronomical Dossier Drawer
  return (
    <aside
      className="dossier-drawer-container animate-slide-in-right"
      aria-label="Bảng hồ sơ chi tiết thiên văn"
      style={{
        ['--planet-theme' as string]: currentPlanet.color,
      }}
    >
      {/* Left Rim Collapse Handle Tab */}
      <button
        className="dossier-outer-collapse-handle"
        onClick={closeInfoPanel}
        title="Thu lại bảng thông tin để xem toàn cảnh 3D (Phím I hoặc Esc)"
        aria-label="Thu lại bảng thông tin"
      >
        <ChevronRight size={18} />
        <span className="outer-handle-label">Thu lại</span>
      </button>

      <div className="dossier-shell">
        <div className="dossier-core">
          {/* Header Bar */}
          <div className="dossier-header">
            <div className="dossier-header-main">
              <div className="dossier-title-stack">
                <div className="dossier-eyebrow-tag">
                  <span className="eyebrow-dot" style={{ backgroundColor: currentPlanet.color }} />
                  HỒ SƠ THIÊN VĂN
                </div>
                <h2 className="dossier-planet-title">{currentPlanet.name}</h2>
                <span className="dossier-planet-english">{currentPlanet.englishName}</span>
              </div>
            </div>

            <div className="dossier-header-actions">
              {/* Camera Focus / Enter 3D Action */}
              {isShowcase ? (
                <button
                  className="dossier-btn-focus"
                  onClick={() => enterFreeExplore(currentPlanet.id)}
                  title="Mở không gian 3D tự do tại thiên thể này"
                >
                  <Compass size={17} />
                  <span className="focus-text">Khám phá 3D</span>
                </button>
              ) : (
                <button
                  className="dossier-btn-focus"
                  onClick={requestCameraFocus}
                  title="Khóa góc nhìn và phóng to camera vào thiên thể này"
                >
                  <Crosshair size={17} />
                  <span className="focus-text">Focus 3D</span>
                </button>
              )}

              {/* Collapse Button (Thu lại xem toàn cảnh) */}
              <button
                className="dossier-btn-collapse"
                onClick={closeInfoPanel}
                title="Thu lại bảng thông tin để xem toàn cảnh 3D (Phím I hoặc Esc)"
              >
                <Minimize2 size={15} />
                <span className="collapse-text">Thu gọn</span>
              </button>

              {/* Close Button */}
              <button
                className="dossier-btn-close"
                onClick={closeInfoPanel}
                title="Đóng hồ sơ (Esc)"
                aria-label="Close dossier"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Planet Navigation Carousel Bar */}
          <div className="dossier-nav-bar">
            <button
              className="dossier-nav-step"
              onClick={() => goToPlanet(prevPlanet.id)}
              title={`Chuyển sang ${prevPlanet.name}`}
            >
              <ChevronLeft size={16} />
              <span>{prevPlanet.name}</span>
            </button>
            <div className="dossier-nav-counter">
              {currentIndex + 1} / {allCelestialBodies.length}
            </div>
            <button
              className="dossier-nav-step"
              onClick={() => goToPlanet(nextPlanet.id)}
              title={`Chuyển sang ${nextPlanet.name}`}
            >
              <span>{nextPlanet.name}</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Tab Navigation Pill Track */}
          <div className="dossier-tabs-track">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`dossier-tab-btn ${activeInfoTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveInfoTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Scroll Container */}
          <div className="dossier-scroll-body">
            {/* TAB 1: TỔNG QUAN */}
            {activeInfoTab === 'overview' && (
              <div className="tab-pane-content animate-fade-in">
                {/* Surface Banner Card */}
                <div className="dossier-banner-card">
                  <img
                    src={`/textures/${currentPlanet.id}.jpg`}
                    alt={currentPlanet.name}
                    className="dossier-banner-img"
                    loading="eager"
                  />
                  <div className="dossier-banner-overlay">
                    <span className="banner-badge">
                      <ImageIcon size={12} />
                      Bản đồ quang phổ thiên văn 4K
                    </span>
                  </div>
                </div>

                {/* Quick Telemetry Grid */}
                <div className="dossier-stats-grid">
                  <div className="dossier-stat-tile">
                    <div className="stat-tile-label">
                      <Calendar size={12} />
                      <span>Hình thành</span>
                    </div>
                    <div className="stat-tile-val">{currentPlanet.formation}</div>
                  </div>

                  <div className="dossier-stat-tile">
                    <div className="stat-tile-label">
                      <Eye size={12} />
                      <span>Phát hiện</span>
                    </div>
                    <div className="stat-tile-val">{currentPlanet.discovered}</div>
                  </div>
                </div>

                {/* Description Box */}
                <div className="dossier-section-card">
                  <h3 className="dossier-section-heading">
                    <Globe size={14} />
                    <span>Mô tả & Đặc tính</span>
                  </h3>
                  <p className="dossier-body-p">{currentPlanet.description}</p>
                </div>

                {/* Internal Composition */}
                <div className="dossier-section-card">
                  <h3 className="dossier-section-heading">
                    <Layers size={14} />
                    <span>Cấu tạo địa chất & Khí quyển</span>
                  </h3>
                  <div className="composition-stack">
                    <div className="composition-row">
                      <span className="comp-badge">Lõi</span>
                      <span className="comp-text">{currentPlanet.composition.core}</span>
                    </div>
                    <div className="composition-row">
                      <span className="comp-badge">Lớp Manti</span>
                      <span className="comp-text">{currentPlanet.composition.mantle}</span>
                    </div>
                    <div className="composition-row">
                      <span className="comp-badge">Bề mặt/Khí quyển</span>
                      <span className="comp-text">{currentPlanet.composition.crustOrAtmosphere}</span>
                    </div>
                  </div>
                </div>

                {/* Fun Fact Card */}
                <div className="dossier-fact-card">
                  <div className="fact-header">
                    <Sparkles size={13} className="fact-sparkle" />
                    <span>SỰ THẬT THÚ VỊ</span>
                  </div>
                  <p className="fact-text">{currentPlanet.funFact}</p>
                </div>
              </div>
            )}

            {/* TAB 2: VẬT LÝ */}
            {activeInfoTab === 'physical' && (
              <div className="tab-pane-content animate-fade-in">
                <div className="dossier-section-card">
                  <h3 className="dossier-section-heading">
                    <Thermometer size={14} />
                    <span>Thông số vật lý cơ bản</span>
                  </h3>
                  <div className="telemetry-table-list">
                    <div className="telemetry-row">
                      <span className="telemetry-key">Đường kính</span>
                      <span className="telemetry-val tabular-nums">
                        {currentPlanet.physical.diameterKm.toLocaleString()} km
                      </span>
                    </div>
                    <div className="telemetry-row">
                      <span className="telemetry-key">Khối lượng</span>
                      <span className="telemetry-val">{currentPlanet.physical.massKg}</span>
                    </div>
                    <div className="telemetry-row">
                      <span className="telemetry-key">Trọng lực bề mặt</span>
                      <span className="telemetry-val tabular-nums">
                        {currentPlanet.physical.gravity} m/s² ({gravityRatio}x Trái Đất)
                      </span>
                    </div>
                    <div className="telemetry-row">
                      <span className="telemetry-key">Nhiệt độ trung bình</span>
                      <span className="telemetry-val tabular-nums">
                        {currentPlanet.physical.meanTempC}°C
                      </span>
                    </div>
                    {currentPlanet.physical.minTempC !== undefined && (
                      <div className="telemetry-row">
                        <span className="telemetry-key">Nhiệt độ thấp nhất</span>
                        <span className="telemetry-val text-blue tabular-nums">
                          {currentPlanet.physical.minTempC}°C
                        </span>
                      </div>
                    )}
                    {currentPlanet.physical.maxTempC !== undefined && (
                      <div className="telemetry-row">
                        <span className="telemetry-key">Nhiệt độ cao nhất</span>
                        <span className="telemetry-val text-red tabular-nums">
                          {currentPlanet.physical.maxTempC}°C
                        </span>
                      </div>
                    )}
                    <div className="telemetry-row">
                      <span className="telemetry-key">Khối lượng riêng</span>
                      <span className="telemetry-val tabular-nums">
                        {currentPlanet.physical.density} g/cm³
                      </span>
                    </div>
                  </div>
                </div>

                {/* Atmosphere */}
                <div className="dossier-section-card">
                  <h3 className="dossier-section-heading">
                    <Activity size={14} />
                    <span>Thành phần khí quyển</span>
                  </h3>
                  <p className="dossier-body-p">{currentPlanet.physical.atmosphere}</p>
                </div>
              </div>
            )}

            {/* TAB 3: QUỸ ĐẠO */}
            {activeInfoTab === 'orbit' && (
              <div className="tab-pane-content animate-fade-in">
                <div className="dossier-section-card">
                  <h3 className="dossier-section-heading">
                    <Orbit size={14} />
                    <span>Đặc tính quỹ đạo thiên văn</span>
                  </h3>
                  <div className="telemetry-table-list">
                    <div className="telemetry-row">
                      <span className="telemetry-key">Khoảng cách tới Mặt Trời</span>
                      <span className="telemetry-val tabular-nums">
                        {currentPlanet.orbit.distanceAU} AU ({currentPlanet.orbit.distanceMillionKm.toLocaleString()} triệu km)
                      </span>
                    </div>
                    <div className="telemetry-row">
                      <span className="telemetry-key">Chu kỳ quỹ đạo</span>
                      <span className="telemetry-val tabular-nums">
                        {currentPlanet.orbit.orbitalPeriodDays.toLocaleString()} ngày ({currentPlanet.orbit.orbitalPeriodYears} năm)
                      </span>
                    </div>
                    <div className="telemetry-row">
                      <span className="telemetry-key">Vận tốc quỹ đạo</span>
                      <span className="telemetry-val tabular-nums">
                        {currentPlanet.orbit.orbitalVelocityKmS} km/s
                      </span>
                    </div>
                    <div className="telemetry-row">
                      <span className="telemetry-key">Độ dài 1 ngày (Tự quay)</span>
                      <span className="telemetry-val tabular-nums">
                        {currentPlanet.orbit.rotationPeriodHours} giờ
                      </span>
                    </div>
                    <div className="telemetry-row">
                      <span className="telemetry-key">Độ nghiêng trục quay</span>
                      <span className="telemetry-val tabular-nums">
                        {currentPlanet.orbit.axialTiltDeg}°
                      </span>
                    </div>
                    <div className="telemetry-row">
                      <span className="telemetry-key">Độ lệch tâm quỹ đạo</span>
                      <span className="telemetry-val tabular-nums">
                        {currentPlanet.orbit.eccentricity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: VỆ TINH */}
            {activeInfoTab === 'moons' && (
              <div className="tab-pane-content animate-fade-in">
                <div className="dossier-section-card">
                  <h3 className="dossier-section-heading">
                    <Radio size={14} />
                    <span>Hệ thống vệ tinh tự nhiên ({currentPlanet.moonCount})</span>
                  </h3>
                  {currentPlanet.moons.length > 0 ? (
                    <div className="moons-card-list">
                      {currentPlanet.moons.map((moon) => (
                        <div key={moon.name} className="moon-item-tile">
                          <div className="moon-tile-header">
                            <span className="moon-orb-dot" />
                            <div className="moon-title-group">
                              <strong className="moon-tile-name">{moon.name}</strong>
                              <span className="moon-en-label">({moon.englishName})</span>
                            </div>
                            <span className="moon-tile-size tabular-nums">{moon.diameter.toLocaleString()} km</span>
                          </div>
                          <div className="moon-sub-meta">
                            <span>Chu kỳ: {moon.orbitPeriod}</span>
                            <span>•</span>
                            <span>{moon.discovery}</span>
                          </div>
                          <p className="moon-tile-desc">{moon.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="dossier-empty-state">
                      <ShieldCheck size={28} className="empty-icon" />
                      <p>Thiên thể này không có vệ tinh tự nhiên nào được ghi nhận.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: THÁM HIỂM */}
            {activeInfoTab === 'missions' && (
              <div className="tab-pane-content animate-fade-in">
                <div className="dossier-section-card">
                  <h3 className="dossier-section-heading">
                    <Rocket size={14} />
                    <span>Lịch sử các sứ mệnh thám hiểm ({currentPlanet.missions.length})</span>
                  </h3>
                  {currentPlanet.missions.length > 0 ? (
                    <div className="missions-timeline">
                      {currentPlanet.missions.map((mission) => (
                        <div key={mission.name} className="mission-timeline-item">
                          <div className="mission-header-row">
                            <span className="mission-year-chip tabular-nums">{mission.year}</span>
                            <strong className="mission-name">{mission.name}</strong>
                            <span className="mission-agency-badge">{mission.agency}</span>
                          </div>
                          <p className="mission-summary">{mission.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="dossier-empty-state">
                      <Rocket size={28} className="empty-icon" />
                      <p>Chưa có sứ mệnh nhân tạo chuyên biệt nào tới thiên thể này.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: SO SÁNH */}
            {activeInfoTab === 'comparison' && (
              <div className="tab-pane-content animate-fade-in">
                <div className="dossier-section-card">
                  <h3 className="dossier-section-heading">
                    <Scale size={14} />
                    <span>Tương quan so với Trái Đất (Chuẩn 1.0x)</span>
                  </h3>

                  {/* Visual Comparison Progress Bars */}
                  <div className="comparison-metric-block">
                    <div className="metric-header-row">
                      <span className="metric-label">Đường kính ({currentPlanet.name} vs Trái Đất)</span>
                      <span className="metric-val tabular-nums">{diameterRatio}x</span>
                    </div>
                    <div className="metric-progress-track">
                      <div
                        className="metric-progress-fill"
                        style={{
                          width: `${Math.min(100, Math.max(8, parseFloat(diameterRatio) * 50))}%`,
                          backgroundColor: currentPlanet.color,
                        }}
                      />
                    </div>
                  </div>

                  <div className="comparison-metric-block">
                    <div className="metric-header-row">
                      <span className="metric-label">Trọng lực ({currentPlanet.name} vs Trái Đất)</span>
                      <span className="metric-val tabular-nums">{gravityRatio}x</span>
                    </div>
                    <div className="metric-progress-track">
                      <div
                        className="metric-progress-fill"
                        style={{
                          width: `${Math.min(100, Math.max(8, parseFloat(gravityRatio) * 50))}%`,
                          backgroundColor: '#38bdf8',
                        }}
                      />
                    </div>
                  </div>

                  <div className="comparison-metric-block">
                    <div className="metric-header-row">
                      <span className="metric-label">Khoảng cách tới Mặt Trời</span>
                      <span className="metric-val tabular-nums">{currentPlanet.orbit.distanceAU} AU</span>
                    </div>
                    <div className="metric-progress-track">
                      <div
                        className="metric-progress-fill"
                        style={{
                          width: `${Math.min(100, Math.max(6, (currentPlanet.orbit.distanceAU / 30) * 100))}%`,
                          backgroundColor: '#fbbf24',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

