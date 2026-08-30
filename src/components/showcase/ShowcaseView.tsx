import { useRef, useEffect, useCallback, useState } from 'react';
import { Compass, Volume2, VolumeX, ChevronRight, Sparkles, Radio, Rocket, Orbit, Layers, Globe } from 'lucide-react';
import { allCelestialBodies } from '../../data/planets';
import { useSolarStore } from '../../store/solarStore';
import { useDeviceProfile } from '../../utils/deviceProfile';
import { PlanetShowcaseStage } from './PlanetShowcaseStage';
import { ClassificationSection } from './ClassificationSection';
import type { PlanetData } from '../../types/planet';

/* ─── Localised labels & Chromatic Identity ─── */
const typeLabels: Record<string, string> = {
  star: 'Ngôi sao Trung tâm',
  terrestrial: 'Hành tinh Đất đá',
  gas_giant: 'Hành tinh Khí khổng lồ',
  ice_giant: 'Hành tinh Băng khổng lồ',
  dwarf: 'Hành tinh lùn',
};

interface PlanetTheme {
  primary: string;
  glow: string;
  gradient: string;
  badgeBg: string;
  themeTag: string;
  coords: string;
  composition: { name: string; pct: number; color: string }[];
}

const planetThemes: Record<string, PlanetTheme> = {
  sun: {
    primary: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.45)',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 60%, #b45309 100%)',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    themeTag: 'Lò phản ứng Nhiệt hạch & Quang cầu',
    coords: 'RA 00h 00m 00s • DEC +00° 00′ 00″',
    composition: [
      { name: 'H₂ (Hydro)', pct: 73.4, color: '#f59e0b' },
      { name: 'He (Heli)', pct: 24.8, color: '#fbbf24' },
      { name: 'Khí khác', pct: 1.8, color: '#fed7aa' },
    ],
  },
  mercury: {
    primary: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.4)',
    gradient: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #475569 100%)',
    badgeBg: 'rgba(148, 163, 184, 0.14)',
    themeTag: 'Khoáng vật Silicat & Miệng núi lửa',
    coords: 'RA 18h 44m 02s • DEC +06° 11′ 08″',
    composition: [
      { name: 'Khí quyển vết', pct: 42.0, color: '#94a3b8' },
      { name: 'Na (Natri)', pct: 29.0, color: '#cbd5e1' },
      { name: 'Mg / H₂', pct: 29.0, color: '#64748b' },
    ],
  },
  venus: {
    primary: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.4)',
    gradient: 'linear-gradient(135deg, #fde047 0%, #d97706 60%, #92400e 100%)',
    badgeBg: 'rgba(251, 191, 36, 0.12)',
    themeTag: 'Siêu bão Axit Sunfuric & Áp suất 92 atm',
    coords: 'RA 03h 22m 14s • DEC +18° 52′ 44″',
    composition: [
      { name: 'CO₂ (Carbon Dioxide)', pct: 96.5, color: '#f59e0b' },
      { name: 'N₂ (Nitơ)', pct: 3.5, color: '#fbbf24' },
    ],
  },
  earth: {
    primary: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.45)',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 60%, #059669 100%)',
    badgeBg: 'rgba(56, 189, 248, 0.14)',
    themeTag: 'Thủy quyển Đại dương & Sinh quyển Sự sống',
    coords: 'RA 12h 00m 00s • DEC +00° 00′ 00″',
    composition: [
      { name: 'N₂ (Nitơ)', pct: 78.1, color: '#38bdf8' },
      { name: 'O₂ (Oxy)', pct: 20.9, color: '#34d399' },
      { name: 'Ar / CO₂', pct: 1.0, color: '#93c5fd' },
    ],
  },
  mars: {
    primary: '#f87171',
    glow: 'rgba(248, 113, 113, 0.45)',
    gradient: 'linear-gradient(135deg, #f87171 0%, #dc2626 60%, #991b1b 100%)',
    badgeBg: 'rgba(248, 113, 113, 0.14)',
    themeTag: 'Bụi Sa mạc Ôxít Sắt & Núi lửa Olympus',
    coords: 'RA 21h 10m 44s • DEC -17° 13′ 02″',
    composition: [
      { name: 'CO₂ (Carbon Dioxide)', pct: 95.3, color: '#f87171' },
      { name: 'N₂ (Nitơ)', pct: 2.7, color: '#fb923c' },
      { name: 'Ar (Argon)', pct: 2.0, color: '#fca5a5' },
    ],
  },
  jupiter: {
    primary: '#fb923c',
    glow: 'rgba(251, 146, 60, 0.45)',
    gradient: 'linear-gradient(135deg, #fdba74 0%, #ea580c 60%, #9a3412 100%)',
    badgeBg: 'rgba(251, 146, 60, 0.14)',
    themeTag: 'Xoáy bão Vết Đỏ Lớn & Hydro Kim loại',
    coords: 'RA 05h 32m 01s • DEC +23° 11′ 12″',
    composition: [
      { name: 'H₂ (Hydro)', pct: 89.8, color: '#fb923c' },
      { name: 'He (Heli)', pct: 10.2, color: '#fdba74' },
    ],
  },
  saturn: {
    primary: '#fde047',
    glow: 'rgba(253, 224, 71, 0.4)',
    gradient: 'linear-gradient(135deg, #fef08a 0%, #eab308 60%, #854d0e 100%)',
    badgeBg: 'rgba(253, 224, 71, 0.12)',
    themeTag: 'Vành đai Hạt băng & Cơn bão Cực Lục giác',
    coords: 'RA 22h 14m 50s • DEC -12° 28′ 19″',
    composition: [
      { name: 'H₂ (Hydro)', pct: 96.3, color: '#fde047' },
      { name: 'He (Heli)', pct: 3.25, color: '#fef08a' },
      { name: 'CH₄ / NH₃', pct: 0.45, color: '#fef9c3' },
    ],
  },
  uranus: {
    primary: '#2dd4bf',
    glow: 'rgba(45, 212, 191, 0.45)',
    gradient: 'linear-gradient(135deg, #5eead4 0%, #0d9488 60%, #115e59 100%)',
    badgeBg: 'rgba(45, 212, 191, 0.14)',
    themeTag: 'Trục quay Nghiêng 98° & Băng Metan Xanh Ngọc',
    coords: 'RA 02h 58m 10s • DEC +16° 45′ 22″',
    composition: [
      { name: 'H₂ (Hydro)', pct: 82.5, color: '#2dd4bf' },
      { name: 'He (Heli)', pct: 15.2, color: '#5eead4' },
      { name: 'CH₄ (Methane)', pct: 2.3, color: '#99f6e4' },
    ],
  },
  neptune: {
    primary: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.45)',
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 60%, #1e3a8a 100%)',
    badgeBg: 'rgba(56, 189, 248, 0.14)',
    themeTag: 'Cuồng phong Siêu âm 2.100 km/h & Đại dương Băng',
    coords: 'RA 23h 48m 33s • DEC -03° 12′ 55″',
    composition: [
      { name: 'H₂ (Hydro)', pct: 80.0, color: '#38bdf8' },
      { name: 'He (Heli)', pct: 19.0, color: '#60a5fa' },
      { name: 'CH₄ (Methane)', pct: 1.5, color: '#93c5fd' },
    ],
  },
};

/* ─── Bloom IntersectionObserver Hook ─── */
function useBloomReveal(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.12, root: container, rootMargin: '0px 0px -40px 0px' }
    );

    const blooms = container.querySelectorAll('.bloom');
    blooms.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [containerRef]);
}

/* ─── Section Tracking Hook (which planet is in viewport) ─── */
function useSectionTracker(containerRef: React.RefObject<HTMLElement | null>) {
  const setShowcaseIndex = useSolarStore((s) => s.setShowcaseIndex);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
              bestEntry = entry;
            }
          }
        }
        if (bestEntry && bestEntry.intersectionRatio >= 0.25) {
          const index = Number(bestEntry.target.getAttribute('data-section-index'));
          if (!isNaN(index)) {
            setShowcaseIndex(index, { silent: true });
          }
        }
      },
      { root: container, threshold: [0.25, 0.5, 0.75] }
    );

    const sections = container.querySelectorAll('[data-section-index]');
    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [containerRef, setShowcaseIndex]);
}

/* ================================================================
   Planet Section — Spatial Bento Dossier Architecture
   ================================================================ */
function PlanetSection({
  planet,
  index,
  total,
}: {
  planet: PlanetData;
  index: number;
  total: number;
}) {
  const enterFreeExplore = useSolarStore((s) => s.enterFreeExplore);
  const selectPlanet = useSolarStore((s) => s.selectPlanet);
  const theme = planetThemes[planet.id] || planetThemes.earth;

  return (
    <section
      className="ares-planet-section"
      data-planet={planet.id}
      data-section-index={index + 1}
      style={{
        '--planet-accent': theme.primary,
        '--planet-glow': theme.glow,
        '--planet-gradient': theme.gradient,
      } as React.CSSProperties}
    >
      {/* Dynamic Ambient Mesh Glow */}
      <div
        className="ares-section-glow"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${theme.glow} 0%, transparent 52%)`,
        }}
      />

      <div className="spatial-dossier-wrapper">
        {/* Header Metadata Ribbon */}
        <div className="bloom delay-1 spatial-meta-ribbon">
          <div className="spatial-pill-tag" style={{ background: theme.badgeBg, borderColor: `${theme.primary}44` }}>
            <span className="live-pulsar-dot" style={{ backgroundColor: theme.primary, boxShadow: `0 0 8px ${theme.primary}` }} />
            <span className="pill-type-label" style={{ color: theme.primary }}>{typeLabels[planet.type] || planet.type}</span>
          </div>

          <span className="spatial-roman-index tabular-nums">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>

          <span className="spatial-coords-text">
            <Radio size={11} className="coords-icon" style={{ color: theme.primary }} />
            {theme.coords}
          </span>
        </div>

        {/* Planet Headline */}
        <div className="bloom delay-2 spatial-title-block">
          <h2 className="spatial-planet-name" style={{ textShadow: `0 0 35px ${theme.glow}` }}>
            {planet.name}
          </h2>
          <div className="spatial-sub-row">
            <span className="spatial-english-name" style={{ color: theme.primary }}>
              {planet.englishName.toUpperCase()}
            </span>
            <span className="spatial-theme-tag">• {theme.themeTag}</span>
          </div>
        </div>

        {/* Scientific Narrative Overview */}
        <p className="bloom delay-3 spatial-narrative-text">{planet.description}</p>

        {/* Atmospheric Composition Spectrum Bar */}
        <div className="bloom delay-3 spatial-spectrum-box">
          <div className="spectrum-header">
            <span className="spectrum-label">
              <Layers size={12} style={{ color: theme.primary }} />
              THÀNH PHẦN KHÍ QUYỂN / VẬT CHẤT
            </span>
            <span className="spectrum-summary">{planet.physical.atmosphere.split(',')[0]}</span>
          </div>
          <div className="spectrum-bar-track">
            {theme.composition.map((comp, i) => (
              <div
                key={i}
                className="spectrum-segment"
                style={{ width: `${comp.pct}%`, backgroundColor: comp.color }}
                title={`${comp.name}: ${comp.pct}%`}
              />
            ))}
          </div>
          <div className="spectrum-legend-row">
            {theme.composition.map((comp, i) => (
              <div key={i} className="spectrum-legend-item">
                <span className="legend-dot" style={{ backgroundColor: comp.color }} />
                <span className="legend-name">{comp.name}</span>
                <span className="legend-pct tabular-nums">{comp.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bento Telemetry 4-Cell Matrix */}
        <div className="bloom delay-4 spatial-bento-grid">
          <div className="spatial-bento-card">
            <div className="bento-card-top">
              <span className="bento-label">KHOẢNG CÁCH MẶT TRỜI</span>
              <Orbit size={13} style={{ color: theme.primary }} />
            </div>
            <div className="bento-value-row">
              <span className="bento-num tabular-nums">{planet.orbit.distanceAU === 0 ? '0' : planet.orbit.distanceAU}</span>
              <span className="bento-unit">AU</span>
            </div>
            <span className="bento-sub-info tabular-nums">{planet.orbit.distanceMillionKm.toLocaleString()} triệu km</span>
          </div>

          <div className="spatial-bento-card">
            <div className="bento-card-top">
              <span className="bento-label">ĐƯỜNG KÍNH XÍCH ĐẠO</span>
              <Globe size={13} style={{ color: theme.primary }} />
            </div>
            <div className="bento-value-row">
              <span className="bento-num tabular-nums">{planet.physical.diameterKm.toLocaleString()}</span>
              <span className="bento-unit">km</span>
            </div>
            <span className="bento-sub-info">{(planet.physical.diameterKm / 12742).toFixed(2)}x Trái Đất</span>
          </div>

          <div className="spatial-bento-card">
            <div className="bento-card-top">
              <span className="bento-label">CHU KỲ QUỸ ĐẠO</span>
              <Rocket size={13} style={{ color: theme.primary }} />
            </div>
            <div className="bento-value-row">
              <span className="bento-num tabular-nums">{planet.orbit.orbitalPeriodDays.toLocaleString()}</span>
              <span className="bento-unit">ngày</span>
            </div>
            <span className="bento-sub-info tabular-nums">{planet.orbit.orbitalPeriodYears} năm Trái Đất</span>
          </div>

          <div className="spatial-bento-card">
            <div className="bento-card-top">
              <span className="bento-label">NHIỆT ĐỘ & TRỌNG LỰC</span>
              <Sparkles size={13} style={{ color: theme.primary }} />
            </div>
            <div className="bento-value-row">
              <span className="bento-num tabular-nums">{planet.physical.meanTempC}</span>
              <span className="bento-unit">°C</span>
            </div>
            <span className="bento-sub-info tabular-nums">Trọng lực: {planet.physical.gravity} m/s²</span>
          </div>
        </div>

        {/* Fun Fact Feature Card (Doppelrand with signature glow) */}
        <div
          className="bloom delay-5 spatial-fact-card"
          style={{
            borderColor: `${theme.primary}44`,
            background: `linear-gradient(135deg, ${theme.badgeBg} 0%, rgba(6, 11, 24, 0.85) 100%)`,
          }}
        >
          <div className="fact-card-badge" style={{ color: theme.primary }}>
            <Sparkles size={13} className="sparkle-orbit-icon" />
            <span>SỰ THẬT THIÊN VĂN KỲ THÚ</span>
          </div>
          <p className="fact-card-body">{planet.funFact}</p>
        </div>

        {/* Kinetic Action CTAs */}
        <div className="bloom delay-6 spatial-actions-ribbon">
          <button
            className="spatial-btn-primary"
            style={{
              background: theme.gradient,
              boxShadow: `0 4px 20px ${theme.glow}`,
            }}
            onClick={() => enterFreeExplore(planet.id)}
            title="Bay vào không gian 3D tự do và khám phá quỹ đạo"
          >
            <Compass size={17} />
            <span>Khám phá 3D Ngay</span>
            <div className="btn-kinetic-chip">
              <ChevronRight size={14} />
            </div>
          </button>

          <button
            className="spatial-btn-ghost"
            onClick={() => selectPlanet(planet.id)}
            title="Mở hồ sơ dữ liệu & so sánh tương quan"
          >
            <Radio size={14} style={{ color: theme.primary }} />
            <span>Xem hồ sơ dữ liệu chi tiết</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   ShowcaseView — Spatial Cinematic Showcase
   ================================================================ */
export function ShowcaseView() {
  const showcaseIndex = useSolarStore((s) => s.showcaseIndex);
  const soundEnabled = useSolarStore((s) => s.soundEnabled);
  const toggleSound = useSolarStore((s) => s.toggleSound);
  const enterFreeExplore = useSolarStore((s) => s.enterFreeExplore);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentBody = allCelestialBodies[Math.max(0, Math.min(showcaseIndex - 1, allCelestialBodies.length - 1))];
  const currentTheme = planetThemes[currentBody.id] || planetThemes.earth;

  // Pause planet rotation while the pointer interacts with the stage (right half).
  // Rotation resumes when the pointer leaves the stage (clicking elsewhere / scrolling to other half).
  const [isPaused, setIsPaused] = useState(false);
  const { tier: deviceTier, isNarrowViewport } = useDeviceProfile();

  // Bloom reveal & section tracking
  useBloomReveal(scrollContainerRef);
  useSectionTracker(scrollContainerRef);

  // Scroll to section
  const scrollToSection = useCallback((index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const section = container.querySelector(`[data-section-index="${index}"]`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Keyboard nav
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const maxIndex = allCelestialBodies.length + 2;
        const next = Math.min(showcaseIndex + 1, maxIndex);
        scrollToSection(next);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const prev = Math.max(showcaseIndex - 1, 0);
        scrollToSection(prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showcaseIndex, scrollToSection]);

  const isLowTierOnMobile = deviceTier === "low" && isNarrowViewport;

  return (
    <div className={`ares-showcase ${deviceTier === "low" ? "is-low-tier" : "not-low-tier"} ${isNarrowViewport ? "is-narrow" : ""} ${isLowTierOnMobile ? "is-mobile-low" : ""}`.trim()}>
      {/* Background Starry Mesh Grid */}
      <div className="ares-grid-noise" aria-hidden="true" />
      <div className="ares-ambience" aria-hidden="true">
        <div
          className="orb orb-1"
          style={{
            background: `radial-gradient(circle, ${currentTheme.glow} 0%, transparent 70%)`,
          }}
        />
        <div className="orb orb-2" />
      </div>

      {/* Fixed 3D Celestial Stage (Right Side) */}
      <div
        className="ares-3d-stage"
        onPointerEnter={() => setIsPaused(true)}
        onPointerLeave={() => setIsPaused(false)}
        onWheel={(event) => {
          const container = scrollContainerRef.current;
          if (!container || event.deltaY === 0) return;
          event.preventDefault();
          container.scrollTop += event.deltaY;
        }}
      >
        <PlanetShowcaseStage planet={currentBody} rotationMultiplier={isPaused ? 0 : 0.5} />
      </div>

      {/* Floating Island Header for Showcase */}
      <header className="showcase-floating-header">
        <div className="showcase-header-shell">
          <div className="showcase-header-core">
            <div className="showcase-brand-tag">
              <span className="brand-sun-mini" style={{ backgroundColor: currentTheme.primary, boxShadow: `0 0 10px ${currentTheme.primary}` }} />
              <div>
                <div className="showcase-brand-title">HỆ MẶT TRỜI 3D</div>
                <div className="showcase-brand-sub" style={{ color: currentTheme.primary }}>CELESTIAL SHOWCASE</div>
              </div>
            </div>

            <div className="showcase-header-actions">
              <button
                className="showcase-switch-3d-btn"
                onClick={() => enterFreeExplore(currentBody.id)}
                title="Chuyển sang chế độ không gian 3D tự do"
              >
                <Compass size={15} />
                <span>Không gian 3D Tự do</span>
              </button>

              <button
                className={`showcase-sound-btn ${soundEnabled ? 'is-active' : ''}`}
                onClick={toggleSound}
                title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                aria-label="Toggle sound"
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable Dossier Content (Left Column) */}
      <div className="ares-scroll-content" ref={scrollContainerRef}>
        {/* ─── HERO SECTION ─── */}
        <section className="ares-hero" data-section-index={0} style={{ position: 'relative' }}>
          <div className="relative z-10">
            <div className="bloom delay-1 ares-hero-step">
              <span className="orbtag">
                <Rocket size={13} style={{ color: 'var(--accent-gold)' }} />
                <span>HỆ THỐNG THIÊN VĂN 3D • NASA JPL DATA</span>
              </span>
            </div>

            <h1 className="bloom delay-2 ares-hero-title">
              Hành Trình
              <br />
              Khám Phá
              <br />
              <span className="hero-title-accent">Vũ Trụ 3D</span>
            </h1>

            <div className="bloom delay-3 ares-hero-desc">
              Khám phá 9 thiên thể kỳ vĩ từ Mặt Trời rực cháy tới Sao Hải Vương băng giá — mỗi
              thế giới được tái hiện với dữ liệu quỹ đạo, vật lý và khí quyển chuẩn xác từ các
              sứ mệnh thiên văn học quốc tế.
            </div>

            <div className="bloom delay-4 ares-hero-actions">
              <button
                className="spatial-btn-primary hero-cta-btn"
                onClick={() => scrollToSection(1)}
              >
                <Sparkles size={16} />
                <span>Bắt đầu Du hành Thiên văn</span>
                <div className="btn-kinetic-chip">
                  <ChevronRight size={14} />
                </div>
              </button>

              <button
                className="spatial-btn-ghost"
                onClick={() => enterFreeExplore('earth')}
              >
                <Compass size={15} />
                <span>Vào chế độ 3D tự do ngay</span>
              </button>
            </div>

            <div className="bloom delay-4 ares-hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-num tabular-nums">{allCelestialBodies.length}</span>
                <span className="hero-stat-label">Thiên thể tương tác</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-num tabular-nums">146+</span>
                <span className="hero-stat-label">Vệ tinh tự nhiên</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-num tabular-nums">3D</span>
                <span className="hero-stat-label">Không gian thực tế</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-num tabular-nums">4K</span>
                <span className="hero-stat-label">Bản đồ quang phổ</span>
              </div>
            </div>

            <div className="bloom delay-5 ares-hero-scroll-hint">
              <div className="ares-scroll-indicator" />
              <span>Cuộn xuống hoặc dùng phím ↑ / ↓ để du hành qua từng hành tinh</span>
            </div>
          </div>
        </section>

        {/* ─── PLANET SECTIONS (9 Celestial Bodies) ─── */}
        {allCelestialBodies.map((body, i) => (
          <PlanetSection
            key={body.id}
            planet={body}
            index={i}
            total={allCelestialBodies.length}
          />
        ))}

        {/* ─── CLASSIFICATION & OVERVIEW SECTION ─── */}
        <ClassificationSection />

        {/* ─── FOOTER / CREDITS ─── */}
        <section className="ares-footer" data-section-index={allCelestialBodies.length + 2}>
          <div className="ares-footer-inner">
            <div className="ares-footer-brand">
              <span className="brand-sun-mini" style={{ backgroundColor: currentTheme.primary, boxShadow: `0 0 10px ${currentTheme.primary}` }} />
              <div>
                <div className="ares-footer-title">HỆ MẶT TRỜI 3D</div>
                <div className="ares-footer-sub">CELESTIAL SHOWCASE — SPATIAL DOSSIER</div>
              </div>
            </div>
            <p className="ares-footer-note">
              Dữ liệu thiên văn tham khảo từ NASA, ESA, JAXA & các sứ mệnh khám phá quốc tế.
              Bản tái hiện 3D phục vụ mục đích giáo dục và trải nghiệm tương tác.
            </p>
            <div className="ares-footer-actions">
              <button className="spatial-btn-ghost" onClick={() => enterFreeExplore('earth')}>
                <Compass size={14} />
                <span>Khám phá 3D tự do</span>
              </button>
              <button className="spatial-btn-ghost" onClick={() => scrollToSection(0)}>
                <ChevronRight size={14} style={{ transform: 'rotate(-90deg)' }} />
                <span>Về đầu trang</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Vertical Dot Navigation with Planet Names on Hover */}
      <nav className="ares-dot-nav" aria-label="Planet navigation">
        <button
          className={showcaseIndex === 0 ? 'active' : ''}
          onClick={() => scrollToSection(0)}
          title="Trang chủ"
          aria-label="Về đầu trang"
        >
          <span className="dot-tooltip">Trang chủ</span>
          <span className="dot-home" />
        </button>
        {allCelestialBodies.map((body, i) => {
          const bodyTheme = planetThemes[body.id] || planetThemes.earth;
          const isActive = showcaseIndex === i + 1;
          return (
            <button
              key={body.id}
              className={isActive ? 'active' : ''}
              style={isActive ? { backgroundColor: bodyTheme.primary, boxShadow: `0 0 12px ${bodyTheme.primary}` } : {}}
              onClick={() => scrollToSection(i + 1)}
              title={body.name}
            >
              <span className="dot-tooltip">{body.name}</span>
            </button>
          );
        })}
        <button
          className={showcaseIndex === allCelestialBodies.length + 1 ? 'active' : ''}
          onClick={() => scrollToSection(allCelestialBodies.length + 1)}
          title="Định nghĩa & Phân loại"
        >
          <span className="dot-tooltip">Bảng phân loại</span>
          <span className="dot-classification" />
        </button>
        <button
          className={showcaseIndex === allCelestialBodies.length + 2 ? 'active' : ''}
          onClick={() => scrollToSection(allCelestialBodies.length + 2)}
          title="Thông tin & Nguồn dữ liệu"
        >
          <span className="dot-tooltip">Nguồn dữ liệu</span>
          <span className="dot-footer" />
        </button>
      </nav>

      {/* Bottom Telemetry Hint */}
      <footer className="ares-bottom-hint" aria-hidden="true">
        Cuộn hoặc dùng <strong>↑ / ↓</strong> để khám phá • <strong>Nhấp nút</strong> để phóng to 3D hoặc xem hồ sơ
      </footer>
    </div>
  );
}
