# Paste-ready prompt — Frontend only

You are building **Aegis-IDX** frontend for Sectors Hackathon Track 1.

## Constraints

- BUILD FRONTEND ONLY. Do not implement FastAPI yet.
- Stack: Next.js App Router + TypeScript + Tailwind.
- Dark fintech design tokens from the build pack `07_DESIGN/DESIGN_TOKENS.md`.
- Default to **mock mode** using `08_DATA_MOCKS/investigate_bbca.json` and `investigate_empty.json`.
- Product copy in Bahasa Indonesia from `04_FRONTEND_SPEC/COPY_ID.md`.
- No investment advice UI. No trade buttons. Disclaimer always visible.
- No Sectors API keys in the browser.
- Solo builder Fahmi; product Aegis-IDX; deadline 30 Sep 2026.

## Deliver

1. App shell with layout from `04_FRONTEND_SPEC/FRONTEND_PRD.md` and wireframes.
2. Components: TickerSearch, ModeBadge, StepsTimeline, BrokerTable, FreeFloatCard, NarrativePanel, DisclaimerBanner, EmptyState.
3. Investigasi on BBCA loads rich mock; invalid/empty shows empty mock.
4. Animate/simulate steps for demo polish.
5. Optional: wire `NEXT_PUBLIC_API_URL` for later BE without requiring it now.
6. README with run instructions and mock-first note.

## Done when

All FE DoD items in `01_PRD/ACCEPTANCE_CRITERIA.md` are checkable.
