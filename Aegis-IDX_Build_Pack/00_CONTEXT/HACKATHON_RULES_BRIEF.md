# Hackathon Rules Brief — Track 1

## Track 1: Custom Agent Orchestration

You must build a **custom orchestration loop** (Planner → Executor → Critic), not merely wrap Sectors MCP or call a single LLM tool chain.

### Required

- Explicit multi-step agent loop with planning, tool execution, and critique/refinement.
- Use of Sectors API data (IDX-related endpoints) under the credit budget.
- Product demo that shows orchestration (steps visible in UI or logs).
- Clear disclaimer: not investment advice.

### Disallowed / weak submissions

- MCP-wrapper-only products with no custom planner/executor/critic.
- Auto-trading, order routing, or “buy/sell now” recommendations framed as advice.
- Burning credits on unbounded live polling without cache.

## Judging weights (40 / 30 / 30)

| Weight | Area | What judges look for |
|--------|------|----------------------|
| **40%** | Product & UX | Clear problem, polished FE, understandable narrative, demo flow |
| **30%** | Technical orchestration | Visible Planner–Executor–Critic, tool discipline, reliability |
| **30%** | Data use & insight | Meaningful Sectors data (broker flow, free float), credit efficiency |

## Credits tips (1,000 budget)

1. **Build FE in `mock` mode first** — zero credits until UI DoD.
2. **Cache every live response** — mode `cache` serves last good payload; avoid re-hitting the same ticker.
3. **broker-summary / top ≈ 2 credits** — treat as expensive; call once per investigate session when possible.
4. **Batch intent** — one investigate run should fetch only what the planner needs for that ticker.
5. **Fail soft** — if credits low, fall back to cache/mock and show mode badge in UI.
6. **Log credit spend** — backend should record estimated credits per investigate for demo honesty.

## Deadline

**30 September 2026** — submit before end of day per hackathon portal rules. Ship FE demo early; BE live mode is the stretch.

## Track reminder

Aegis-IDX = Track 1 custom orchestration. Do not submit as a thin MCP client.
