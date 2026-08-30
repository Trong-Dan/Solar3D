import { useEffect, useRef, useState } from 'react';
import { Compass, Radio } from 'lucide-react';
import { useSolarStore } from '../../store/solarStore';
import { planets } from '../../data/planets';

const MAP_SIZE = 206;
const CENTER = MAP_SIZE / 2;
const ORBIT_SCALE = 1.08;

function worldToMap(x: number, z: number, maxDist: number): [number, number] {
  const nx = (x / maxDist) * (CENTER - 22) + CENTER;
  const ny = (z / maxDist) * (CENTER - 22) + CENTER;
  return [nx, ny];
}

export function MiniMap() {
  const timeScale = useSolarStore((s) => s.timeScale);
  const isPaused = useSolarStore((s) => s.isPaused);
  const reverseTime = useSolarStore((s) => s.reverseTime);
  const selectPlanet = useSolarStore((s) => s.selectPlanet);
  const selectedPlanetId = useSolarStore((s) => s.selectedPlanetId);

  const anglesRef = useRef(planets.map((p) => Math.random() * Math.PI * 2));
  const [positions, setPositions] = useState<[number, number][]>(() =>
    planets.map((_, i) => [CENTER, CENTER])
  );
  const rafRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  const maxDist = planets[planets.length - 1].distanceFromSun;

  useEffect(() => {
    let active = true;

    const loop = (now: number) => {
      if (!active) return;
      lastTimeRef.current = now;

      if (!isPaused) {
        const dir = reverseTime ? -1 : 1;
        const newPositions: [number, number][] = [];
        for (let i = 0; i < planets.length; i++) {
          anglesRef.current[i] += planets[i].orbitSpeed * timeScale * dir * 0.8;
          const x = Math.cos(anglesRef.current[i]) * planets[i].distanceFromSun * ORBIT_SCALE;
          const z = Math.sin(anglesRef.current[i]) * planets[i].distanceFromSun * ORBIT_SCALE;
          newPositions.push(worldToMap(x, z, maxDist * ORBIT_SCALE));
        }
        setPositions(newPositions);
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [isPaused, timeScale, reverseTime, maxDist]);

  return (
    <aside className="celestial-radar-widget" aria-label="Radar bản đồ Hệ Mặt Trời">
      <div className="radar-shell">
        <div className="radar-core">
          {/* Radar Header */}
          <div className="radar-meta-header">
            <Radio size={13} className="radar-signal-icon" />
            <span className="radar-title">RADAR THIÊN VĂN</span>
          </div>

          <div className="radar-screen-wrap">
            {/* Animated Rotating Radar Sweep Scanner */}
            <div className="radar-sweep-beam" />

            <svg
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
              viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`}
              className="radar-svg-canvas"
            >
              <defs>
                <radialGradient id="radarSunGlow">
                  <stop offset="0%" stopColor="#fffde7" stopOpacity="1" />
                  <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                </radialGradient>
                <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Crosshair Grid Lines */}
              <line x1={CENTER} y1={8} x2={CENTER} y2={MAP_SIZE - 8} stroke="rgba(56,189,248,0.12)" strokeWidth="0.8" strokeDasharray="2 3" />
              <line x1={8} y1={CENTER} x2={MAP_SIZE - 8} y2={CENTER} stroke="rgba(56,189,248,0.12)" strokeWidth="0.8" strokeDasharray="2 3" />

              {/* Orbit rings */}
              {planets.map((p) => {
                const r = (p.distanceFromSun / (maxDist * ORBIT_SCALE)) * (CENTER - 18);
                const isSelected = selectedPlanetId === p.id;
                return (
                  <circle
                    key={`orbit-${p.id}`}
                    cx={CENTER}
                    cy={CENTER}
                    r={r}
                    fill="none"
                    stroke={isSelected ? p.color : 'rgba(255,255,255,0.08)'}
                    strokeWidth={isSelected ? '1.2' : '0.7'}
                    strokeDasharray={isSelected ? 'none' : '3 4'}
                    opacity={isSelected ? 0.9 : 0.6}
                  />
                );
              })}

              {/* Sun Blip */}
              <circle cx={CENTER} cy={CENTER} r={9} fill="url(#radarSunGlow)" />
              <circle
                cx={CENTER}
                cy={CENTER}
                r={3.5}
                fill="#fbbf24"
                filter="url(#radarGlow)"
                style={{ cursor: 'pointer' }}
                onClick={() => selectPlanet('sun')}
              />

              {/* Planets Blips */}
              {planets.map((p, i) => {
                const [px, py] = positions[i];
                const isActive = selectedPlanetId === p.id;
                const r = Math.max(2.8, Math.min(4.5, p.radius * 2.2));
                return (
                  <g
                    key={p.id}
                    className="radar-planet-blip"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectPlanet(p.id);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {isActive && (
                      <circle
                        cx={px}
                        cy={py}
                        r={r + 5}
                        fill="none"
                        stroke={p.color}
                        strokeWidth="1.5"
                        opacity="0.8"
                        className="radar-active-blip-ring"
                      />
                    )}
                    <circle
                      cx={px}
                      cy={py}
                      r={r}
                      fill={p.color}
                      filter="url(#radarGlow)"
                      opacity={isActive ? 1 : 0.85}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </aside>
  );
}

