import { useRef } from 'react';
import { allCelestialBodies } from '../../data/planets';
import { useSolarStore } from '../../store/solarStore';

export function PlanetSelector() {
  const selectedPlanetId = useSolarStore((s) => s.selectedPlanetId);
  const selectPlanet = useSolarStore((s) => s.selectPlanet);
  const setHoveredPlanet = useSolarStore((s) => s.setHoveredPlanet);
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <nav className="dock-selector-wrapper" aria-label="Danh sách hành tinh Hệ Mặt Trời">
      <div className="dock-selector-shell">
        <div className="dock-selector-core">
          <div className="dock-track-scroll" ref={trackRef}>
            {allCelestialBodies.map((body) => {
              const isSelected = selectedPlanetId === body.id;
              return (
                <button
                  key={body.id}
                  className={`dock-item-btn group ${isSelected ? 'active' : ''}`}
                  onClick={() => selectPlanet(body.id)}
                  onMouseEnter={() => setHoveredPlanet(body.id)}
                  onMouseLeave={() => setHoveredPlanet(null)}
                  title={`${body.name} (${body.englishName}) • ${body.id === 'sun' ? 'Trung tâm' : `${body.orbit.distanceAU} AU`}`}
                  style={{
                    ['--planet-accent' as string]: body.color,
                  }}
                >
                  {/* Planetary Orb Preview */}
                  <div className="dock-orb-container">
                    <div
                      className="dock-orb-sphere"
                      style={{
                        background:
                          body.id === 'sun'
                            ? 'radial-gradient(circle at 35% 35%, #fffde7 0%, #fbbf24 45%, #d97706 80%, #78350f 100%)'
                            : `radial-gradient(circle at 35% 35%, #ffffff 0%, ${body.color} 55%, #090d16 100%)`,
                        boxShadow: isSelected
                          ? `0 0 20px ${body.color}, 0 0 6px #ffffff, inset 0 1px 2px rgba(255,255,255,0.6)`
                          : `0 2px 8px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.3)`,
                      }}
                    >
                      {body.hasRing && <span className="dock-orb-ring-graphic" />}
                      <span className="dock-orb-highlight" />
                    </div>

                    {/* Active Radar Pulse Ring */}
                    {isSelected && <span className="dock-orb-active-pulse" />}
                  </div>

                  {/* Planet Information */}
                  <div className="dock-item-meta">
                    <span className="dock-planet-name">{body.name}</span>
                    <span className="dock-planet-dist">
                      {body.id === 'sun' ? 'TRUNG TÂM' : `${body.orbit.distanceAU} AU`}
                    </span>
                  </div>

                  {/* Active Bottom Glow Pip */}
                  <span className="dock-active-pip" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

