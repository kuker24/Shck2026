# Frontend PRD — BUILD FIRST

Aegis-IDX FE is the **primary deliverable for week 1–2**. Backend comes after FE DoD.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Dark fintech tokens from `07_DESIGN/DESIGN_TOKENS.md`
- Mock data from `08_DATA_MOCKS/` until BE is ready

## Layout (desktop)

```
+----------------------------------------------------------+
| Logo Aegis-IDX          ModeBadge        Credits hint    |
+----------------------------------------------------------+
| DisclaimerBanner (always)                                |
+----------------------------------------------------------+
| [Ticker input____] [Investigasi]                         |
+----------------------------------------------------------+
| StepsTimeline                                            |
+---------------------------+------------------------------+
| BrokerTable buyers        | BrokerTable sellers          |
+---------------------------+------------------------------+
| FreeFloatCard             | NarrativePanel               |
+---------------------------+------------------------------+
```

Mobile: single column — input → steps → buyers → sellers → free float → narrative → disclaimer sticky bottom.

## Components

| Component | Responsibility |
|-----------|----------------|
| `TickerSearch` | Input + validation (uppercase IDX) |
| `InvestigateButton` | CTA Investigasi, disabled while loading |
| `ModeBadge` | mock / live / cache |
| `StepsTimeline` | Planner/Executor/Critic steps |
| `BrokerTable` | Ranked rows buyers or sellers |
| `FreeFloatCard` | Percent, shares, note |
| `NarrativePanel` | Indonesian narrative text |
| `DisclaimerBanner` | Non-dismissible legal copy |
| `EmptyState` | Error/empty from investigate_empty |
| `Toast` | Soft-fail messages |

## Mock mode (default)

1. On Investigasi with ticker BBCA → load `investigate_bbca.json`.
2. Other/invalid → `investigate_empty.json` or client validation.
3. Simulate step progression with short timeouts for demo polish.
4. Env `NEXT_PUBLIC_API_URL` optional; if unset, stay mock-local.

## When BE is ready

- `POST ${API}/v1/investigate` with `{ ticker, mode }`.
- Render response fields 1:1 with OpenAPI schema.
- Never put Sectors API key in FE env.

## Non-goals for FE

- Charts-heavy trading terminal
- Portfolio sync
- Auth (optional later; not MVP)
