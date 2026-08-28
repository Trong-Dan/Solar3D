import { useEffect, useRef } from 'react';
import { CalendarDays, Orbit } from 'lucide-react';
import { useSolarStore } from '../../store/solarStore';

const SIMULATION_SECONDS_PER_EARTH_DAY = 0.15; // tuning: how fast simulated days tick at 1x

function formatDuration(totalDays: number): string {
  const sign = totalDays < 0 ? '-' : '';
  const days = Math.abs(totalDays);
  const years = days / 365.25;

  if (years >= 1000) return `${sign}${(years / 1000).toFixed(1)}k năm`;
  if (years >= 1) return `${sign}${years.toFixed(1)} năm`;
  if (days >= 1) return `${sign}${Math.round(days)} ngày`;
  const hours = days * 24;
  if (hours >= 1) return `${sign}${Math.round(hours)} giờ`;
  return `${sign}${Math.round(hours * 60)} phút`;
}

export function SimulationClock() {
  const timeScale = useSolarStore((s) => s.timeScale);
  const isPaused = useSolarStore((s) => s.isPaused);
  const reverseTime = useSolarStore((s) => s.reverseTime);

  const elapsedRef = useRef(0);
  const lastFrameRef = useRef<number | null>(null);
  const valueDisplayRef = useRef<HTMLSpanElement>(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    let raf = 0;

    const loop = (now: number) => {
      if (lastFrameRef.current !== null) {
        const realDelta = (now - lastFrameRef.current) / 1000;
        if (!isPaused) {
          const direction = reverseTime ? -1 : 1;
          const simSeconds = realDelta * timeScale;
          elapsedRef.current += (simSeconds / SIMULATION_SECONDS_PER_EARTH_DAY) * direction;
        }
      }
      lastFrameRef.current = now;

      // Throttle DOM text updates to ~15-20fps for silky smooth display with 0% main thread CPU overhead
      if (now - lastUpdateRef.current > 50) {
        lastUpdateRef.current = now;
        if (valueDisplayRef.current) {
          valueDisplayRef.current.textContent = formatDuration(elapsedRef.current);
        }
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [isPaused, timeScale, reverseTime]);

  return (
    <aside className="sim-clock-widget" title="Thời gian mô phỏng vũ trụ đã trôi qua">
      <div className="sim-clock-shell">
        <div className="sim-clock-core">
          <div className="sim-clock-icon-wrap">
            <Orbit size={13} className={`sim-clock-orbit-icon ${!isPaused ? 'spinning' : ''}`} />
          </div>
          <div className="sim-clock-meta">
            <span className="sim-clock-label">
              <CalendarDays size={10} style={{ display: 'inline', marginRight: 3, verticalAlign: -1 }} />
              THỜI GIAN VŨ TRỤ
            </span>
            <span className="sim-clock-value" ref={valueDisplayRef}>
              0 ngày
            </span>
          </div>
          <div className={`sim-clock-status-dot ${isPaused ? 'paused' : 'active'}`} />
        </div>
      </div>
    </aside>
  );
}

