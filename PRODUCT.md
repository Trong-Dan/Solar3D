# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Primary: astronomy enthusiasts exploring the solar system for visual delight and reference.
- Secondary: educators/students and general visitors who come for the 3D spectacle and stay for the data (inferred from bilingual goal; not separately confirmed).

## Product Purpose

An interactive 3D solar system showcase covering all 9 celestial bodies (Sun + 8 planets). It exists to make a strong first-visit visual impression, enable smooth free interaction, and serve as a NASA-sourced reference tool for solar-system facts.

## Positioning

A full-screen cinematic split-screen experience: a living 3D stage beside a scroll-driven dossier of each celestial body — pairing museum-grade real-time rendering with precise, sourced astronomy data in one page, in Vietnamese, with English on the roadmap.

## Operating Context

- Two modes: **showcase** (split-screen scroll journey over sections: hero, 9 celestial bodies, classification, footer) and **freeExplore** (open 3D canvas with orbits, minimap, controls, info panel, tour), and **panorama** (fullscreen 3D solar system with no UI chrome -- pure cinematic viewing; exit via Esc or button).
- UI language is currently Vietnamese; bilingual (vi/en) is a confirmed future requirement.
- Font requirement: clear and beautiful typography (Times New Roman has been the directed display/body face; the durable constraint is legible, attractive type).
- Data is sourced from NASA / ESA / JAXA missions and IAU classification; content must stay scientifically accurate.

## Capabilities and Constraints

- React 18 + TypeScript + Vite + React Three Fiber / Three.js; Zustand store; Framer Motion; Tailwind 4.
- All 9 celestial bodies with real texture maps, rotation, orbit, moons, missions, and physical/orbit telemetry.
- Settings persisted locally (quality, scale mode, toggles, sound, volume, time scale).
- Cinematic tour mode, panorama mode, minimap, sound engine (UI SFX + ambient drone), settings modal.
- Must preserve all existing features and celestial bodies; changes must not remove functionality.
- Undecided: exact bilingual implementation timeline and locale mechanism.

## Brand Commitments

- Product name in-app: "HỆ MẶT TRỜI 3D — CELESTIAL SHOWCASE".
- NASA-style palette committed for the showcase surface (deep space navy, blue, cyan, white; body colors per planet).
- Vietnamese-first copy; do not replace factual NASA/astronomy copy without asking.

## Evidence on Hand

- Real per-planet datasets in `src/data/planets.ts` (physical, orbit, moons, missions, composition) and `src/data/systemOverview.ts` (IAU definition, classification).
- Real texture maps in `public/textures/*.jpg` for all 9 bodies.
- No testimonials, customers, benchmarks, or deployment claims exist; none may be fabricated.

## Product Principles

- Science is the source of truth: data must remain accurate and sourced, never invented.
- First visit must impress instantly; the 3D stage leads and the interface recedes.
- Interaction must stay smooth at every quality preset, on desktop and mobile.
- Preserve the feature surface: refinement extends, never subtracts.
- Language and type are part of the product: bilingual-ready and legible, beautiful typography.

## Accessibility & Inclusion

- `prefers-reduced-motion` is respected in showcase 3D animation.
- Keyboard navigation exists in both modes; dot-nav has visible tooltips.
- Full bilingual support is an explicit roadmap requirement.