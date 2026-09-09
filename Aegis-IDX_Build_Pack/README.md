# Aegis-IDX — Sectors Hackathon Build Pack

**Product:** Aegis-IDX  
**Track:** Track 1 — Custom Agent Orchestration  
**Builder:** Solo — Fahmi  
**Team invite code:** SKT7-R2C4  
**Credits:** 1,000 (Sectors API)  
**Deadline:** 30 September 2026  

## What this pack is

Complete documentation and build pack so you (or an AI agent) can ship Aegis-IDX for the Sectors Hackathon without guessing product scope, API shape, or build order.

## FE-first build order (mandatory)

1. **Frontend with mock data** — Next.js + TypeScript + Tailwind. Wire UI to `08_DATA_MOCKS/` and mock mode. Demo-ready UI before any live API spend.
2. **Backend Planner–Executor–Critic** — FastAPI. Only after FE DoD in `01_PRD/ACCEPTANCE_CRITERIA.md`.
3. **Live Sectors integration** — Switch mode `mock` → `live` carefully; cache aggressively; watch credits.
4. **Submit pack** — Problem statement, checklist, video beats in `09_SUBMIT_HACKATHON/`.

## Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS |
| Backend | FastAPI (Python) — Planner → Executor → Critic loop |
| Data | Sectors API (Track 1 custom orchestration) |
| Modes | `mock` \| `live` \| `cache` |

## Hard non-goals

- **No investment advice** — investigative narrative only; disclaimer always visible.
- **No auto-trade / order placement** — read-only market intelligence.
- **No MCP-wrapper-only** — Track 1 requires custom orchestration (Planner–Executor–Critic), not a thin MCP shim.

## Folder map

```
00_CONTEXT/          Hackathon rules, one-pager, team/accounts
01_PRD/              PRD, user flows, acceptance criteria
02_ARCHITECTURE/     System overview, agent loop, TRK security
03_API_CONTRACTS/    OpenAPI investigate + Sectors endpoints
04_FRONTEND_SPEC/    FE PRD, wireframes, Indonesian copy
05_BACKEND_SPEC/     BE PRD, tool allowlist
06_AGENT_PROMPTS/    Paste-ready prompts for FE then BE agents
07_DESIGN/           Dark fintech design tokens
08_DATA_MOCKS/       Rich + empty investigate JSON
09_SUBMIT_HACKATHON/ Problem statement, checklist, video beats
```

## Quick start for agents

1. Read `00_CONTEXT/PRODUCT_ONEPAGER.md` then `01_PRD/PRD.md`.
2. Paste `06_AGENT_PROMPTS/01_PROMPT_FRONTEND.md` into a coding agent — build FE first.
3. After FE DoD, paste `06_AGENT_PROMPTS/02_PROMPT_BACKEND.md`.
4. Keep secrets out of git — see `00_CONTEXT/TEAM_AND_ACCOUNTS.md`.

## Credits discipline

1,000 credits total. Prefer mock/cache during UI work. Live calls: broker-summary/top (~2 credits) and free-float only when needed. See `03_API_CONTRACTS/SECTORS_ENDPOINTS.md`.

---

*Aegis-IDX — investigasi aliran broker IDX, bukan saran investasi.*
