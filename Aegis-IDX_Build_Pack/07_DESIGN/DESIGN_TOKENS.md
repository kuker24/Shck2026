# Design Tokens — Dark Fintech

Use these tokens in Tailwind config / CSS variables.

## Color

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-base` | `#0B1220` | App background |
| `--bg-panel` | `#121A2B` | Cards / panels |
| `--bg-panel-2` | `#1A2438` | Nested surfaces, table header |
| `--border` | `#2A3650` | Dividers, card border |
| `--text-primary` | `#E8EEF9` | Primary text |
| `--text-muted` | `#9AA8C1` | Secondary labels |
| `--accent` | `#3B82F6` | CTA Investigasi, links |
| `--accent-hover` | `#2563EB` | CTA hover |
| `--buy` | `#22C55E` | Net buy / positive |
| `--sell` | `#EF4444` | Net sell / negative |
| `--warning` | `#F59E0B` | Soft-fail toast |
| `--disclaimer-bg` | `#1E293B` | Disclaimer banner bg |
| `--focus` | `#60A5FA` | Focus rings |

## Typography

- Sans: `Inter`, `ui-sans-serif`, system
- Mono (broker codes, numbers): `JetBrains Mono`, `ui-monospace`
- Title: 20–24px semibold
- Body: 14–16px
- Meta: 12px muted

## Radius & spacing

- Radius card: `12px`
- Radius button: `8px`
- Page padding: `16–24px`
- Gap panels: `16px`

## Motion

- Step status transition: 150–200ms ease
- Skeleton shimmer subtle on `--bg-panel-2`

## Tailwind sketch

```js
colors: {
  aegis: {
    base: '#0B1220',
    panel: '#121A2B',
    panel2: '#1A2438',
    border: '#2A3650',
    accent: '#3B82F6',
    buy: '#22C55E',
    sell: '#EF4444',
  }
}
```
