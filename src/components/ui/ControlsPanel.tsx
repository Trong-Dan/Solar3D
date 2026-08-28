import {
  Play,
  Pause,
  RotateCcw,
  Rewind,
  Clock,
  Gauge,
} from 'lucide-react';
import { useSolarStore } from '../../store/solarStore';

const speedPresets = [0.2, 0.5, 1, 2, 5, 10];

export function ControlsPanel() {
  const timeScale = useSolarStore((s) => s.timeScale);
  const setTimeScale = useSolarStore((s) => s.setTimeScale);
  const isPaused = useSolarStore((s) => s.isPaused);
  const togglePause = useSolarStore((s) => s.togglePause);
  const reverseTime = useSolarStore((s) => s.reverseTime);
  const toggleReverseTime = useSolarStore((s) => s.toggleReverseTime);

  return (
    <aside className="telemetry-controls-dock" aria-label="Bảng điều khiển thời gian mô phỏng">
      <div className="telemetry-shell">
        <div className="telemetry-core">
          {/* Header & Status Indicator */}
          <div className="telemetry-header">
            <div className="telemetry-label-group">
              <Gauge size={13} className="telemetry-icon" />
              <span className="telemetry-title">ĐIỀU TỐC VŨ TRỤ</span>
            </div>
            <div className="telemetry-badge">
              <span className={`telemetry-dot ${isPaused ? 'paused' : 'running'}`} />
              <span className="telemetry-status-text">
                {isPaused ? 'TẠM DỪNG' : reverseTime ? 'ĐẢO CHIỀU' : 'ĐANG CHẠY'}
              </span>
            </div>
          </div>

          {/* Primary Playback Action Controls */}
          <div className="telemetry-playback-row">
            {/* Reverse Time Toggle */}
            <button
              className={`telemetry-btn-action ${reverseTime ? 'active-reverse' : ''}`}
              onClick={toggleReverseTime}
              title={reverseTime ? 'Thời gian đang chạy ngược' : 'Đảo ngược chiều thời gian'}
              aria-label="Reverse time"
            >
              <Rewind size={16} className={`telemetry-rewind-icon ${reverseTime ? 'spinning-reverse' : ''}`} />
            </button>

            {/* Main Center Play / Pause Sphere */}
            <button
              className={`telemetry-btn-play-pulse ${isPaused ? 'is-paused' : 'is-playing'}`}
              onClick={togglePause}
              title={isPaused ? 'Tiếp tục mô phỏng (Phím cách)' : 'Tạm dừng mô phỏng (Phím cách)'}
              aria-label={isPaused ? 'Play' : 'Pause'}
            >
              <div className="play-pulse-core">
                {isPaused ? (
                  <Play size={18} fill="currentColor" className="play-icon-glyph" />
                ) : (
                  <Pause size={18} fill="currentColor" className="pause-icon-glyph" />
                )}
              </div>
              {!isPaused && <span className="play-pulse-ring" />}
            </button>

            {/* Reset Speed 1.0x */}
            <button
              className="telemetry-btn-action"
              onClick={() => setTimeScale(1)}
              title="Đặt lại tốc độ mặc định 1.0x"
              aria-label="Reset speed"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          {/* Timeline Speed Slider & Value Readout */}
          <div className="telemetry-slider-box">
            <div className="telemetry-slider-meta">
              <div className="slider-label">
                <Clock size={12} />
                <span>Tốc độ:</span>
              </div>
              <span className="slider-value-display">
                {reverseTime ? '-' : ''}
                {isPaused ? '0.0' : timeScale.toFixed(1)}
                <span className="slider-unit">x</span>
              </span>
            </div>

            <div className="custom-slider-track-wrap">
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={timeScale}
                onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                className="telemetry-range-input"
                style={{
                  background: `linear-gradient(to right, #fdb813 0%, #38bdf8 ${(timeScale / 10) * 100}%, rgba(255,255,255,0.08) ${(timeScale / 10) * 100}%)`,
                }}
              />
            </div>

            {/* Speed Preset Chips */}
            <div className="telemetry-preset-row">
              {speedPresets.map((speed) => (
                <button
                  key={speed}
                  className={`preset-chip-btn ${timeScale === speed && !isPaused ? 'active' : ''}`}
                  onClick={() => setTimeScale(speed)}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

