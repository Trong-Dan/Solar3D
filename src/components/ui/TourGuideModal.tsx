import { ChevronLeft, ChevronRight, X, Sparkles, Compass } from 'lucide-react';
import { useSolarStore } from '../../store/solarStore';
import { allCelestialBodies } from '../../data/planets';

export function TourGuideModal() {
  const isTourActive = useSolarStore((s) => s.isTourActive);
  const tourStepIndex = useSolarStore((s) => s.tourStepIndex);
  const nextTourStep = useSolarStore((s) => s.nextTourStep);
  const prevTourStep = useSolarStore((s) => s.prevTourStep);
  const endTour = useSolarStore((s) => s.endTour);
  const selectedPlanetId = useSolarStore((s) => s.selectedPlanetId);

  if (!isTourActive) return null;

  const currentBody = allCelestialBodies.find((b) => b.id === selectedPlanetId) || allCelestialBodies[tourStepIndex] || allCelestialBodies[0];

  return (
    <aside className="tour-hud-overlay animate-fade-in" aria-label="Hướng dẫn du hành không gian">
      <div
        className="tour-hud-shell"
        style={{
          ['--tour-planet-color' as string]: currentBody.color,
        }}
      >
        <div className="tour-hud-core">
          {/* Left Orbital Visual */}
          <div className="tour-hud-planet-orb">
            <div
              className="tour-orb-visual"
              style={{
                background:
                  currentBody.id === 'sun'
                    ? 'radial-gradient(circle at 35% 35%, #fffde7, #fbbf24, #d97706)'
                    : `radial-gradient(circle at 35% 35%, #ffffff 0%, ${currentBody.color} 55%, #050811 100%)`,
                boxShadow: `0 0 16px ${currentBody.color}99`,
              }}
            />
            <span className="tour-orb-pulse" />
          </div>

          {/* Center Information */}
          <div className="tour-hud-info">
            <div className="tour-hud-eyebrow">
              <span className="tour-step-badge">
                <Sparkles size={11} className="tour-sparkle-anim" />
                BƯỚC {String(tourStepIndex + 1).padStart(2, '0')} / {String(allCelestialBodies.length).padStart(2, '0')}
              </span>
              <span className="tour-distance-chip">{currentBody.id === 'sun' ? 'Trung tâm' : `${currentBody.orbit.distanceAU} AU`}</span>
            </div>

            <div className="tour-hud-title-row">
              <h3 className="tour-planet-name" style={{ color: currentBody.color }}>
                {currentBody.name}
              </h3>
              <span className="tour-planet-english">({currentBody.englishName})</span>
            </div>

            <p className="tour-hud-teaser">{currentBody.description}</p>
          </div>

          {/* Right Navigation Controls */}
          <div className="tour-hud-controls">
            <button
              className="tour-step-btn group"
              onClick={prevTourStep}
              title="Hành tinh trước (Phím ←)"
              aria-label="Previous planet"
            >
              <ChevronLeft size={16} />
              <span className="tour-btn-label">Trước</span>
            </button>

            <button
              className="tour-step-btn tour-primary-btn group"
              onClick={nextTourStep}
              title="Hành tinh tiếp theo (Phím →)"
              aria-label="Next planet"
            >
              <span className="tour-btn-label">Tiếp</span>
              <span className="tour-btn-trailing-chip">
                <ChevronRight size={14} />
              </span>
            </button>

            <button
              className="tour-close-btn"
              onClick={endTour}
              title="Thoát chuyến du hành"
              aria-label="End tour"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

