import { X, Monitor, Layers, Tag, CircleDot, Radio, Volume2, VolumeX, Sliders, Check } from 'lucide-react';
import { useSolarStore } from '../../store/solarStore';
import { QualityPreset } from '../../types/planet';

const qualityOptions: { id: QualityPreset; label: string; desc: string }[] = [
  { id: 'low', label: 'Thấp', desc: 'Tối ưu máy yếu, ưu tiên 60 FPS' },
  { id: 'medium', label: 'Trung bình', desc: 'Cân bằng hiệu năng & hình ảnh' },
  { id: 'high', label: 'Cao (Ultra)', desc: 'Đồ họa chi tiết & Bloom đẹp nhất' },
];

export function SettingsModal() {
  const isSettingsOpen = useSolarStore((s) => s.isSettingsOpen);
  const closeSettings = useSolarStore((s) => s.closeSettings);

  const quality = useSolarStore((s) => s.quality);
  const setQuality = useSolarStore((s) => s.setQuality);
  const showOrbits = useSolarStore((s) => s.showOrbits);
  const toggleOrbits = useSolarStore((s) => s.toggleOrbits);
  const showLabels = useSolarStore((s) => s.showLabels);
  const toggleLabels = useSolarStore((s) => s.toggleLabels);
  const showAsteroidBelt = useSolarStore((s) => s.showAsteroidBelt);
  const toggleAsteroidBelt = useSolarStore((s) => s.toggleAsteroidBelt);
  const showMoons = useSolarStore((s) => s.showMoons);
  const toggleMoons = useSolarStore((s) => s.toggleMoons);
  const soundEnabled = useSolarStore((s) => s.soundEnabled);
  const toggleSound = useSolarStore((s) => s.toggleSound);
  const volume = useSolarStore((s) => s.volume);
  const setVolume = useSolarStore((s) => s.setVolume);

  if (!isSettingsOpen) return null;

  const toggleRows = [
    { id: 'orbits', label: 'Đường quỹ đạo Kepler', icon: <CircleDot size={15} />, value: showOrbits, toggle: toggleOrbits },
    { id: 'labels', label: 'Nhãn tên 3D & Khoảng cách', icon: <Tag size={15} />, value: showLabels, toggle: toggleLabels },
    { id: 'belt', label: 'Vành đai tiểu hành tinh', icon: <Layers size={15} />, value: showAsteroidBelt, toggle: toggleAsteroidBelt },
    { id: 'moons', label: 'Hệ thống vệ tinh tự nhiên', icon: <Radio size={15} />, value: showMoons, toggle: toggleMoons },
  ];

  return (
    <div
      className="settings-modal-backdrop animate-fade-in"
      onClick={closeSettings}
      role="dialog"
      aria-modal="true"
      aria-label="Cài đặt hệ thống"
    >
      <div className="settings-modal-shell" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-core">
          {/* Header */}
          <div className="settings-modal-header">
            <div className="settings-header-title">
              <div className="settings-icon-chip">
                <Sliders size={15} />
              </div>
              <div>
                <h2 className="settings-h2">CÀI ĐẶT HỆ THỐNG</h2>
                <span className="settings-sub">Tùy biến hiển thị, đồ họa và âm thanh</span>
              </div>
            </div>
            <button className="settings-close-btn" onClick={closeSettings} title="Đóng cài đặt" aria-label="Close settings">
              <X size={16} />
            </button>
          </div>

          {/* Body content */}
          <div className="settings-modal-body">
            {/* Graphics Quality Section */}
            <section className="settings-group-card">
              <div className="group-card-header">
                <Monitor size={14} className="group-card-icon" />
                <h3 className="group-card-title">Chất lượng đồ họa WebGL</h3>
              </div>
              <div className="quality-grid">
                {qualityOptions.map((opt) => (
                  <button
                    key={opt.id}
                    className={`quality-tile-btn ${quality === opt.id ? 'active' : ''}`}
                    onClick={() => setQuality(opt.id)}
                  >
                    <div className="quality-tile-top">
                      <span className="quality-tile-name">{opt.label}</span>
                      {quality === opt.id && <Check size={14} className="quality-check-icon" />}
                    </div>
                    <span className="quality-tile-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Display Elements Section */}
            <section className="settings-group-card">
              <div className="group-card-header">
                <Layers size={14} className="group-card-icon" />
                <h3 className="group-card-title">Lớp hiển thị trực quan</h3>
              </div>
              <div className="settings-switches-list">
                {toggleRows.map((row) => (
                  <button
                    key={row.id}
                    className={`switch-row-item ${row.value ? 'is-active' : ''}`}
                    onClick={row.toggle}
                  >
                    <div className="switch-left">
                      <span className="switch-row-icon">{row.icon}</span>
                      <span className="switch-row-label">{row.label}</span>
                    </div>
                    <div className={`glass-toggle-switch ${row.value ? 'active' : ''}`}>
                      <span className="toggle-switch-thumb" />
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Cosmic Audio Section */}
            <section className="settings-group-card">
              <div className="group-card-header">
                <Volume2 size={14} className="group-card-icon" />
                <h3 className="group-card-title">Âm thanh không gian</h3>
              </div>
              <div className="audio-control-card">
                <button
                  className={`audio-switch-btn ${soundEnabled ? 'active' : ''}`}
                  onClick={toggleSound}
                  title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  <span>{soundEnabled ? 'Bật âm thanh' : 'Đang tắt'}</span>
                </button>

                <div className="audio-slider-wrap">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    disabled={!soundEnabled}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="telemetry-range-input"
                    style={{
                      background: `linear-gradient(to right, #38bdf8 0%, #818cf8 ${volume * 100}%, rgba(255,255,255,0.08) ${volume * 100}%)`,
                    }}
                  />
                  <span className="audio-volume-badge tabular-nums">{Math.round(volume * 100)}%</span>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="settings-modal-footer">
            <span className="settings-auto-saved-hint">Cài đặt được tự động lưu trên trình duyệt của bạn</span>
            <button className="settings-done-cta" onClick={closeSettings}>
              Hoàn tất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

