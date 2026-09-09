# Acceptance Criteria – Definition of Done

## FE DoD (build this first)

- [ ] Next.js + TypeScript + Tailwind app runs locally (`npm run dev`).
- [ ] Dark fintech tokens applied (background, panels, accent).
- [ ]  Ticker input + **Investigasi** button work.
- [ ]  Mock investigate for BBCA renders: steps, top_buyers, top_sellers, free_float, narrative, disclaimer.
- [ ]  Empty/error state renders using `investigate_empty.json` path.
- [ ] `ModeBadge` visible (`mock` default).
- [ ]  Disclaimer always visible on results (cannot be dismissed permanently).
- [ ] Indonesian copy matches `COPY_ID.md` for primary strings.
- [ ]  Responsive: usable at 1280px and 390px widths.
- [ ]  No live Sectors calls from the browser (API keys stay server-side).
- [ ]  App README explains mock-first workflow.

**Gate:** Do not start live BE integration until FE DoD checklist is complete.

## BE DoD (after FE)

- [ ] FastAPI serves `PST /v1/investigate` per OpenAPI contract.
- [ ] `mode=mock` returns schema-compatible rich payload without Sectors calls.
- [ ] `mode=live` uses allowlisted tools only; Planner–Executor–Critic runs.
- [ ] `mode=cache` returns stored payload when available.
- [ ]  Response always includes `disclaimer` string and `mode` of **served** mode.
- [ ] Critic rejects or rewrites advice-like phrases (buy/sell recommendations).
- [ ] Tool allowlist enforced; unknown tools never executed.
- [ ]  Credit estimate logged per live investigate.
- [ ] `.env.example` documented; no secrets in repo.
- [ ]  CORS configured for local FE origin.
- [ ] OpenAPI available at `/docs`.

## Submit DoD

- [ ] Problem statement, checklist, video beats completed.
- [ ] Demo video follows `VIDEO_BEATS.md`.
- [ ] Team invite `SKT7RR2C4` confirmed; credits not exhausted.
