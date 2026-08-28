import { useEffect, useState } from 'react';
import { Sparkles, Orbit } from 'lucide-react';
import { preloadTextures } from '../../utils/texturePreloader';

interface LoadingScreenProps {
  onFinished: () => void;
}

const MIN_DISPLAY_MS = 1600;

export function LoadingScreen({ onFinished }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const startTime = Date.now();

    preloadTextures((loaded, totalCount) => {
      if (isCancelled) return;
      setTotal(totalCount);
      setProgress(loaded);
    }).then(() => {
      if (isCancelled) return;
      setDone(true);
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
      window.setTimeout(() => {
        if (isCancelled) return;
        setHidden(true);
        window.setTimeout(() => onFinished(), 600);
      }, remaining);
    });

    return () => {
      isCancelled = true;
    };
  }, [onFinished]);

  const percent = total > 0 ? Math.round((progress / total) * 100) : done ? 100 : 0;

  return (
    <div className={`cosmic-loading-screen ${hidden ? 'is-leaving' : ''}`} aria-label="Đang tải vũ trụ 3D">
      {/* Background Starfield Particles */}
      <div className="loading-space-backdrop" />

      <div className="loading-card-shell">
        <div className="loading-card-core">
          {/* Animated Orbital Sun Reactor */}
          <div className="loading-reactor-visual">
            <div className="loading-plasma-core" />
            <div className="loading-orbit-ring ring-1">
              <span className="orbit-electron dot-gold" />
            </div>
            <div className="loading-orbit-ring ring-2">
              <span className="orbit-electron dot-cyan" />
            </div>
          </div>

          <div className="loading-brand-stack">
            <div className="loading-eyebrow">
              <Sparkles size={12} className="sparkle-anim" />
              <span>HỆ THỐNG MÔ PHỎNG VŨ TRỤ 3D</span>
            </div>
            <h1 className="loading-app-title">HỆ MẶT TRỜI</h1>
            <span className="loading-app-sub">Interactive Celestial Odyssey • WebGL Three.js</span>
          </div>

          {/* Progress Bar Container */}
          <div className="loading-progress-system">
            <div className="loading-bar-track-shell">
              <div
                className="loading-bar-fill-glow"
                style={{
                  width: `${percent}%`,
                }}
              />
            </div>
            <div className="loading-progress-meta">
              <span className="loading-status-msg">
                {done ? 'Sẵn sàng bước vào không gian...' : 'Đang nạp bản đồ thiên văn & quỹ đạo...'}
              </span>
              <span className="loading-percent-number tabular-nums">{percent}%</span>
            </div>
          </div>

          <div className="loading-tip-badge">
            <Orbit size={13} className="tip-icon" />
            <span>Mẹo: Kéo chuột để xoay camera • Cuộn để phóng to • Nhấp vào thiên thể để mở hồ sơ</span>
          </div>
        </div>
      </div>
    </div>
  );
}

