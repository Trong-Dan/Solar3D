---
name: Hệ Mặt Trời 3D — Celestial Showcase
description: A cinematic split-screen 3D solar system dossier — deep-space navy, gold/cyan accents, editorial serif display type.
colors:
  primary: "#fdb813"
  primary-deep: "#d97706"
  primary-glow: "rgba(253, 184, 19, 0.38)"
  secondary: "#38bdf8"
  secondary-glow: "rgba(56, 189, 248, 0.35)"
  tertiary: "#818cf8"
  accent-emerald: "#34d399"
  accent-rose: "#f87171"
  bg-deep-space: "#020409"
  bg-oled-charcoal: "#060a14"
  surface-glass: "rgba(6, 11, 24, 0.78)"
  surface-card: "rgba(8, 14, 28, 0.82)"
  border-glass: "rgba(255, 255, 255, 0.08)"
  border-strong: "rgba(255, 255, 255, 0.2)"
  text-primary: "#f8fafc"
  text-secondary: "#94a3b8"
  text-muted: "#64748b"
  text-subtle: "#475569"
typography:
  display:
    fontFamily: "'Times New Roman', Georgia, 'Playfair Display', serif"
    fontSize: "clamp(3rem, 5vw, 4.4rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "normal"
  headline:
    fontFamily: "'Times New Roman', Georgia, serif"
    fontSize: "clamp(2.6rem, 4.4vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "normal"
  title:
    fontFamily: "'Times New Roman', Georgia, serif"
    fontSize: "1.6rem"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "'Times New Roman', Georgia, serif"
    fontSize: "0.94rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'JetBrains Mono', 'Space Mono', monospace"
    fontSize: "0.72rem"
    fontWeight: 700
    letterSpacing: "0.5px"
    textTransform: "uppercase"
rounded:
  pill: "9999px"
  xl: "18px"
  lg: "14px"
  md: "10px"
  sm: "6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#050811"
    rounded: "{rounded.pill}"
    padding: "11px 20px"
    typography: "700, 0.94rem, Times New Roman"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "#050811"
    rounded: "{rounded.pill}"
    padding: "11px 20px"
  button-ghost:
    backgroundColor: "rgba(255, 255, 255, 0.04)"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
    padding: "11px 18px"
  chip-orbit:
    backgroundColor: "rgba(255, 255, 255, 0.04)"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  card-glass:
    backgroundColor: "{colors.surface-glass}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: Hệ Mặt Trời 3D — Celestial Showcase

## Overview

**Creative North Star: "The Night-Desk Observatory"**

This is the design voice of a personal observatory at night: an astronomer's desk lamp glowing warm gold against an ink-black sky, a cool cyan monitor edge, and every number set in museum-legend serif — precise, legible, and quietly beautiful. The interface is a living telescope: it recedes behind the 3D stage, surfaces are thin glass that float over deep space, and nothing decorative ever competes with the data or the planet.

The personality is **cinematic and editorial** — high contrast, low saturation, generous black, restrained accent. Density is moderate in the dossier panels (bento stats, spectrum bars, fact cards) but the composition breathes: full-bleed sections scroll as discrete frames, each planet owns its own frame with one bold serif name and a quiet English subtitle. Beauty comes from the rendered 3D body and from typographic clarity, not from interface ornament.

The motion grammar is **slow, easing, and weighty**: spring curves (`cubic-bezier(0.16, 1, 0.3, 1)`) on UI state changes, bloom-glows pulsing gently on the live body, and one-frame-per-scroll snap navigation. Everything moves like machinery in a planetarium, never like a marketing site.

**Key Characteristics:**
- Ink-deep space backgrounds (`#020409`) with thin glass surfaces (`rgba(255,255,255,0.08)` borders)
- Gold primary accent used sparingly (≤10% of a screen) as the "lit lamp" signal
- Cyan secondary as the "instrument readout" color for telemetry, tags, and focus
- Editorial serif display (Times New Roman) for names and headlines; mono label caps for metadata
- 3D stage is the hero; UI is glass furniture around it

## Colors

The palette is a NASA-style mission-control palette under an OLED night sky: gold = the Sun, cyan = instrument readouts, and every planet's body color surfaces only on its own card, its orbit, and its dot.

### Primary

- **Gold Lamp** (`#fdb813`): The single "lit" accent. Used for the primary CTA, the active dot-nav indicator, the sun's glow, hero-title accent gradients, and hover/active focus. Its glow (`rgba(253, 184, 19, 0.38)`) appears only behind the Sun and the primary CTA. Gold rarity is the point: one lit element per screen.
- **Gold Ember** (`#d97706`): The deep end of the gold gradient on the hero primary CTA (`linear-gradient(135deg, #f59e0b, #d97706 60%, #b45309)`).

### Secondary

- **Cyan Instrument** (`#38bdf8`): The "live readout" color. Orbit tags, live-blink dots, focus rings, telemetry values, minimap tracking, and the freeExplore active state. Always reads as data, never as decoration.

### Tertiary

- **Indigo** (`#818cf8`): Secondary accent used for secondary data highlights and spectral emphasis where cyan would crowd.

### Neutral

- **Deep Space** (`#020409`): Page/app background — near-black with a blue cast.
- **Oled Charcoal** (`#060a14`): Slightly lifted panel background, recessed wells.
- **Glass Surface** (`rgba(6, 11, 24, 0.78)`): Glass cards and dock panels, backdrop-blurred.
- **Card Surface** (`rgba(8, 14, 28, 0.82)`): Dossier cards inside a glass panel.
- **Glass Border** (`rgba(255, 255, 255, 0.08)`): Default 1px hairline on glass surfaces.
- **Strong Border** (`rgba(255, 255, 255, 0.2)`): Hover/raised state of glass borders.
- **Text Primary** (`#f8fafc`): Body and headings on dark.
- **Text Secondary** (`#94a3b8`): Supporting copy, captions, ghost button labels.
- **Text Muted** (`#64748b`): De-emphasized metadata.
- **Text Subtle** (`#475569`): The quietest layer, disabled states.
- **Accent Emerald** (`#34d399`) / **Accent Rose** (`#f87171`): Ternary semantic signals (success / warning) used sparingly in data chips.

### Named Rules

**The One-Lamp Rule.** The gold primary accent appears on ≤10% of any given screen, and usually on exactly one element. When gold is lit, it is the only thing asking for attention; if more than one gold element fights on a frame, demote one to cyan or neutral.

## Typography

**Display Font:** Times New Roman (with Georgia, Playfair Display, serif fallbacks)
**Body Font:** Times New Roman (with Georgia, serif fallbacks)
**Label/Mono Font:** JetBrains Mono (with Space Mono, monospace fallback)

**Character:** An editorial, museum-plaque pairing. Serif display carries names and headlines with classical gravity; the mono label caps carry telemetry metadata like a telescope readout. The result is "reference library at night" — precise, calm, and legible at every size.

### Hierarchy

- **Display** (700, `clamp(3rem, 5vw, 4.4rem)`, 1.05): Hero title and each planet's name across the showcase — the single boldest statement on any frame. Appears at most once per frame.
- **Headline** (700, `clamp(2.6rem, 4.4vw, 4rem)`, 1.1): Section headlines (classification, footer, hero sub-headings).
- **Title** (600, 1.6rem, 1.2): Panel titles, bento-card headings, tool names.
- **Body** (400, 0.94rem, 1.6): Descriptions, fact-card copy, mission text. Keep lines under ~65ch.
- **Label** (700, 0.72rem, 0.5px tracking, uppercase): Mono uppercase labels — orbit tags, section eyebrows, data captions, tooltips.

### Named Rules

**The One-Name Rule.** Only one serif Display/Headline may lead a frame. Section eyebrows and captions are mono uppercase; the rest is body serif. Two competing serif headlines on one screen reads as a newspaper, not an observatory.

## Layout

The showcase is a **full-viewport scroll-snap column** — one frame per section (hero, 9 celestial bodies, classification, footer), `scroll-snap-type: y mandatory` with `scroll-snap-stop: always`, each section `scroll-snap-align: start` and `scroll-margin-top: 76px` under the fixed header. Scrolling is deliberately stepped, not free.

Each planet frame is a split composition: a fixed 3D stage (the rendered body, always centered on the right on desktop) beside a glass dossier panel of facts. Inside a panel, content uses a 12-column bento rhythm: stat tiles (`bento-card`) with a serif numeral (`1.6rem`), a unit, and a sub-info line; spectrum bars with segment tracks; and stacked fact cards each with a small accent badge.

Spacing rhythm is the `--radius`/`--spacing` scale: sections breathe at `80px` vertical padding, cards at `24px` padding, chips at `5px 12px`. The dot-nav is a fixed vertical rail at the right edge (`right: 20px`, `top: 50%`) — 8px dots that stretch into 20px gold pills when active. On mobile the dot-nav hides and the hero stats collapse to a 2-column grid.

## Elevation & Depth

Depth is layered, not flat: **glass over night sky**, conveyed by backdrop-blur surfaces, thin hairline borders, and glow — plus a single dramatic ambient shadow under each planet's 3D body.

### Shadow Vocabulary

- **Planet Cast** (`box-shadow: 0 24px 50px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05)`): The heavy under-shadow beneath rendered 3D bodies and large panels — grounds the stage.
- **Panel Deep** (`box-shadow: 0 26px 55px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)`): Large floating panels, modals, the settings dock.
- **Lift** (`box-shadow: 0 10px 25px rgba(0,0,0,0.5)`): Hover elevation for cards and buttons.
- **Accent Glow** (`box-shadow: 0 0 8px var(--accent-gold)` / `0 0 14px var(--accent-cyan-glow)`): Only for lit state — active dot, live-blink dots, focus rings, the Sun.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are glass-flat at rest — no shadow until state demands it. Glow and lift appear only in response to hover, focus, or "live" status. If a frame glows in more than two places, it is over-lit.

## Shapes

The form language is **pill-and-pillow**: everything interactive is fully rounded (`9999px`) — buttons, chips, dot-nav, tooltips, reset button. Interior surfaces step down: glass cards at `18px`, dossier cards at `14px`, small wells at `10px`, and tight radii (`6px`) for tiny indicators and track segments. The dot-nav active state literally stretches a circle into a rounded `4px`-radius pill — the one shape transition in the system. No sharp corners on interactive elements anywhere.

## Components

### Buttons

- **Shape:** Pill (9999px radius), inline-flex with icon gap, `11px 20px` padding.
- **Primary:** Gold gradient background (hero: `linear-gradient(135deg, #f59e0b, #d97706 60%, #b45309)`; else `var(--accent-gold)`), near-black ink text (`#050811`), weight 700, serif `0.94rem`. Includes a circular "kinetic chip" (20px) that nudges `translateX(3px)` on hover. Hover lifts `translateY(-2px)` + `brightness(1.1)`; active presses `scale(0.97)`.
- **Ghost:** Transparent glass (`rgba(255,255,255,0.04)`) with 1px hairline border, secondary text. Hover brightens fill to `0.09`, border to `0.16`, text to white. Used for secondary actions and "Khám phá 3D"/"Về đầu trang".

### Chips

- **Style:** Pill, `rgba(255,255,255,0.04)` fill, 1px glass hairline, mono uppercase label (`0.72rem`, 700, 0.5px tracking), secondary text. The **orbit tag** (`orbtag`) carries a 5px cyan dot with a live-blink animation — the "data is live" signal.

### Cards / Containers

- **Corner Style:** 18px glass panels; 14px inner cards; 10px small wells.
- **Background:** Glass surface (`rgba(6, 11, 24, 0.78)`) with backdrop blur; inner cards at `rgba(8, 14, 28, 0.82)`.
- **Shadow Strategy:** Flat at rest; Planet Cast / Panel Deep when floating or hovering (see Elevation).
- **Border:** 1px glass hairline (`rgba(255,255,255,0.08)`), brightening to `0.2` on hover/raise.
- **Internal Padding:** 24px at the panel scale.

### Navigation

- **Dot-nav (desktop):** Vertical fixed rail, 8px neutral dots with tooltips on hover (`rgba(4,8,18,0.85)` pill, mono `0.74rem`). Active dot stretches to a 20px gold pill with gold glow. Home and footer are smaller special dots; the classification dot is a distinct diamond. Hidden on mobile.
- **Header:** Glass dock above the stage, brand set in serif caps ("HỆ MẶT TRỜI 3D — CELESTIAL SHOWCASE"), with a mode switch and settings.

### [Signature Component] The Live-Data Chip

Every celestial body's dossier leads with a mono uppercase orbit tag (`orbtag`) whose cyan dot blinks (`live-blink 1.8s`) — it is the single recurring "this is real telemetry" signature across all 9 bodies, tying NASA/ESA/JAXA source data to the rendered stage. One per planet frame, never more.

## Do's and Don'ts

### Do:
- **Do** use Times New Roman serif for all headlines and names; mono uppercase labels for metadata only.
- **Do** keep the gold primary accent to one lit element per frame.
- **Do** give every celestial-body frame a full-viewport snap frame with exactly one Display headline and one live-data chip.
- **Do** use the cyan instrument color for all telemetry, tags, focus rings, and live indicators.
- **Do** render bodies on their real texture maps and keep all NASA/ESA/JAXA/IAU data accurate and sourced.
- **Do** place the active dot-nav indicator as a stretched gold pill with glow.

### Don't:
- **Don't** add more than two glowing elements to a single frame (The Flat-By-Default Rule).
- **Don't** use sharp corners on buttons, chips, tooltips, or the dot-nav.
- **Don't** set accent colors on body text — accent is for lit states and data only; copy is primary/secondary neutral text.
- **Don't** break the mandatory scroll-snap step per section; the showcase is one-frame-per-scroll.
- **Don't** add decorative gradients over the 3D stage — the planet is the ornament.
- **Don't** remove or reorder any of the 9 celestial bodies or the classification/footer frames.