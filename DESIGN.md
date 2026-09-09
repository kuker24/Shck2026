---
name: Aegis-IDX
description: Dark fintech broker flow investigation for Indonesia Stock Exchange
colors:
  obsidian: "#08080a"
  onyx: "#040406"
  carbon: "#121317"
  graphite: "#1c1d22"
  slate: "#2e3038"
  steel: "#858997"
  fog: "#9ea1af"
  mist: "#c2c5cf"
  bone: "#f0f1f5"
  paper: "#ffffff"
  copper: "#cc9166"
  gilded: "#ae9357"
  trade-buy: "#10b981"
  trade-buy-dim: "#052e16"
  trade-sell: "#f43f5e"
  trade-sell-dim: "#4c0519"
typography:
  display:
    fontFamily: "var(--font-serif), Playfair Display, Georgia, serif"
    fontWeight: 600
  body:
    fontFamily: "var(--font-sans), Inter, ui-sans-serif, system-ui"
    fontWeight: 400
  label:
    fontFamily: "var(--font-mono), JetBrains Mono, monospace"
    fontWeight: 500
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  card:
    backgroundColor: "{colors.carbon}"
    rounded: "{rounded.lg}"
    padding: "20px"
  button-primary:
    backgroundColor: "{colors.copper}"
    textColor: "{colors.onyx}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
---

# Design System

## Overview
Aegis-IDX uses a dark fintech aesthetic known as the Slash system. Dominated by deep obsidian (`#08080a`) backgrounds with warm copper (`#cc9166`) and gilded accents, bone typography, and stark Emerald/Rose semantic colors for buy/sell activity.

## Colors
- **Backgrounds:** obsidian (`#08080a`), onyx (`#040406`), carbon (`#121317`)
- **Surfaces & Borders:** graphite (`#1c1d22`), slate (`#2e3038`)
- **Accents:** copper (`#cc9166`), gilded gold (`#ae9357`)
- **Text:** bone (`#f0f1f5`), mist (`#c2c5cf`), fog (`#9ea1af`), steel (`#858997`)
- **Trade semantics:** buy green (`#10b981`), sell red (`#f43f5e`)

## Typography
- Display / Editorial: Playfair Display serif for dignified headers
- Interface / Body: Inter for high legibility
- Data / Numeric: JetBrains Mono with tabular numbers for broker volume and transaction totals

## Layout
- Max container: 1200px centered
- Responsive grid: single column mobile, side-by-side split on desktop (left: input + timeline + free float; right: broker matrix + narrative)
- Density: compact information density suitable for financial analytical workflows

## Elevation & Depth
- Layering over drop shadows: subtle borders (`1px solid #2e3038`), dark tonal contrasts between cards (`#121317`) and background (`#08080a`)

## Shapes
- Cards: 12px rounded corners
- Buttons & badges: 6px–8px rounded
- Hairline borders: 1px subtle borders for crisp structural containment

## Components
- **Broker Analysis Matrix:** Dual-column buy/sell table with volume percentage progress bars
- **Investigation Steps Timeline:** Sequential checklist showing Planner, Executor, and Critic status
- **Free Float Card:** Progress bar visualization of market vs controlling shareholder distribution
- **Mode Badge:** Status indicator for Simulation / Live / Cache modes
- **Disclaimer Banner:** Prominently docked statutory non-advice notice

## Do's and Don'ts
- **Do:** Use tabular numbers for all numerical and currency displays
- **Do:** Maintain strict buy (green) / sell (red) visual consistency
- **Do:** Keep the non-advice disclaimer clearly visible at all times
- **Don't:** Add flashy neon trading animations or pump-and-dump visual cues
- **Don't:** Obscure audit step transitions during investigation
