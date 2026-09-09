# PRD — Aegis-IDX

## Vision

Enable IDX retail users to run a **guided broker-flow investigation** on a single ticker via a custom agent loop, with a polished FE-first experience and strict non-advice posture.

## Goals

1. Ship a demo-ready **Next.js** investigate UI with mock data before any live spend.
2. Implement **Planner–Executor–Critic** on FastAPI with allowlisted Sectors tools.
3. Return structured investigate responses: steps, brokers (top buyers/sellers), free float, narrative, disclaimer, mode.
4. Stay within **1,000 credits**; prefer mock/cache.
5. Meet Track 1 judging: UX 40%, orchestration 30%, data insight 30%.
6. Submit by **30 Sep 2026** with video + problem statement.

## Non-goals

- Investment advice, price targets, or should buy/sell language.
- Auto-trade, brokerage order APIs, portfolio rebalancing.
- Multi-ticker batch screens as MVP (single ticker investigate only).
- MCP-wrapper-only architecture.
- Real-time websocket streaming (request/response is enough).
- Mobile-native apps (responsive web only).

## User stories

### US-1 — Investigate ticker
As a retail observer, I enter an IDX ticker (e.g. BBCA) and run Investigasi so I see broker top buyers/sellers, free float, and a short narrative.

### US-2 — See agent steps
As a judge/demo viewer, I see the planner/executor/critic steps so orchestration is visible and credible for Track 1.

### US-3 — Mode awareness
As a developer/demoer, I see whether the run used mock, live, or cache so credit use is transparent.

### US-4 — Safe empty/error
As a user, if the ticker is invalid or data is empty, I see a clear Indonesian error state without crashing the UI.

### US-5 — Disclaimer always on
As a compliance-minded builder, every results view shows a fixed disclaimer that this is not investment advice.

## Frontend requirements

- Next.js App Router + TypeScript + Tailwind.
- Dark fintech theme per 07_DESIGN/DESIGN_TOKENS.md.
- Layout: header, ticker input + Investigasi CTA, steps timeline, brokers panels, free-float card, narrative, disclaimer.
- Components: TickerSearch, ModeBadge, StepsTimeline, BrokerTable, FreeFloatCard, NarrativePanel, DisclaimerBanner, EmptyState.
- Default mock mode reading 08_DATA_MOCKS/investigate_bbca.json.
- Loading and error states; Indonesian microcopy from 04_FRONTEND_SPEC/COPY_ID.md.
- Call POST /v1/investigate when BE available; else load mocks client-side.

## Backend requirements

- FastAPI app with POST /v1/investigate.
- Body: ticker + mode mock|live|cache.
- Response schema matches OpenAPI + mocks (steps, brokers, free_float, narrative, disclaimer, mode).
- Planner proposes tool plan; Executor runs allowlisted tools only; Critic validates completeness/safety and may request one refinement.
- Env: SECTORS_API_KEY, optional LLM key, DEFAULT_MODE=mock.
- Credit logging per request; soft-fail to cache/mock when live fails.
- No advice language in narrative generator system prompt.

## Timeline (suggested)

| Window | Focus |
|--------|--------|
| Week 1 | FE shell + mocks + wireframes implemented |
| Week 2 | FE polish + FE DoD; start FastAPI stub with mock mode |
| Week 3 | Live Sectors tools + critic rules + cache |
| Week 4 | Demo hardening, video, submit pack (deadline 30 Sep 2026) |

## Metrics (hackathon)

- Demo path BBCA < 10s in mock; live acceptable < 30s.
- Orchestration steps >= 3 visible.
- Zero secrets in git.
- Credits remaining > 200 at submit (buffer).
