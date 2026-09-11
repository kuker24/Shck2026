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
  trade-buy: "#e0b055"
  trade-buy-dim: "#262013"
  trade-sell: "#f43f5e"
  trade-sell-dim: "#4c0519"
  status-success: "#34d399"
  status-error: "#fb7185"
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
    backgroundColor: "{colors.paper}"
    textColor: "{colors.obsidian}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
---

# Design System

## Overview
Aegis-IDX uses a dark fintech aesthetic known as the Slash system. Dominated by deep obsidian (`#08080a`) backgrounds with bone typography, warm copper for interactive elements, and a single gold/rose pair for buy/sell activity.

## Colors
- **Backgrounds:** obsidian (`#08080a`), onyx (`#040406`), carbon (`#121317`)
- **Surfaces & Borders:** graphite (`#1c1d22`), slate (`#2e3038`)
- **Interactive accent:** copper (`#cc9166`) — focus rings, links, active mode, caret, selection
- **Decorative gold:** gilded (`#ae9357`) — free float bar gradient, wordmark
- **Text:** bone (`#f0f1f5`), mist (`#c2c5cf`), fog (`#9ea1af`), steel (`#858997`)
- **Trade semantics:** buy gold (`#e0b055`), sell rose (`#f43f5e`)
- **Non-trade status:** success (`#34d399`), error (`#fb7185`)

### Hue ownership
One hue never carries two meanings. Gold and rose mean money moving and nothing
else; copper means "you can interact with this". Emerald is reserved for
non-trade status such as market-open and compliance checks, so it is never
mistaken for a buy value. All four text tiers clear WCAG AA on obsidian —
do not add blanket colour overrides that collapse them.

## Typography
- Display / Editorial: Playfair Display serif for dignified headers
- Interface / Body: Inter for high legibility
- Data / Numeric: JetBrains Mono with tabular numbers for broker volume and transaction totals

## Layout
- Max container: 1216px centered
- Single reading column: heading, search, agent timeline, broker flow, then free float beside the narrative. The timeline leads the result because the orchestration is the product.
- Header is two rows below `md`, one row from `md` up
- Density: compact information density suitable for financial analytical workflows

## Elevation & Depth
- Layering over drop shadows: subtle borders (`1px solid #2e3038`), dark tonal contrasts between cards (`#121317`) and background (`#08080a`)

## Shapes
- Cards: 12px rounded corners
- Buttons & badges: 6px–8px rounded
- Hairline borders: 1px subtle borders for crisp structural containment

## Motion
- Easing: `--ease-emil-out` for UI, `--ease-drawer` for the panel slide. Never `ease-in`.
- Enter 240ms, exit 160ms. Leaving is the system getting out of the way.
- Overlays animate out via `useOverlayTransition` + `data-open`; nothing unmounts mid-transition.
- The running-step pulse lives on the marker dot, never on a text label.
- Every transition names its properties. No `transition: all`.

## Icons
- `lucide-react` only, `strokeWidth` 2–2.5, sized 12–16px to match the text beside it.
- No unicode glyphs or emoji standing in for icons.

## Components
- **Broker flow tables:** Buy/sell tables with per-row net bars; top-3 share reported once in the summary above them
- **Agent timeline:** Connected rail showing Perencana, Eksekutor, and Peninjau with per-step status
- **Free Float Card:** Progress bar for public float vs controlling shareholders
- **Mode Badge:** Simulasi / Tersimpan / Langsung with credit estimate
- **Command dialog:** Ticker search with sector filters and full keyboard navigation

## Do's and Don'ts
- **Do:** Use tabular numbers for all numerical and currency displays
- **Do:** Keep buy (gold) / sell (rose) consistent, and keep copper for interaction
- **Do:** Keep the non-advice disclaimer clearly visible at all times
- **Do:** State the coverage limit wherever a ratio is shown — the data covers 5 brokers, not the market
- **Don't:** Add unlayered CSS that overrides Tailwind utilities; put base styles in `@layer base`
- **Don't:** Report a metric whose denominator makes it structurally constant
- **Don't:** Call `stopPropagation` on overlay keydown — window listeners own Escape and arrow keys
- **Don't:** Add flashy neon trading animations or pump-and-dump visual cues
- **Don't:** Obscure audit step transitions during investigation
