# Sectors Endpoints — Budget Tips

Aegis-IDX (live mode) should call only what the Planner needs for one ticker investigate.

## Primary endpoints (conceptual names)

### 1) Broker summary / top (≈ **2 credits**)

- **Purpose:** Top buyers and top sellers by net/buy/sell value for a ticker.
- **Maps to response:** `brokers.top_buyers`, `brokers.top_sellers`.
- **Tip:** Call **once per investigate**. Do not refresh in a loop during demo.
- **Cache:** Store full investigate payload keyed by ticker+date so re-runs use `mode=cache`.

### 2) Free float

- **Purpose:** Free-float percent / shares snapshot for context on tradable supply.
- **Maps to response:** `free_float.percent`, `free_float.shares`, `free_float.as_of`, `free_float.note`.
- **Tip:** Pair with broker top in the same plan; skip if credits critically low and mark `free_float.note` as unavailable.

## Budget tips (1,000 credits)

1. FE development entirely in **mock** (0 credits).
2. Integration tests: prefer **cache** after one successful live BBCA.
3. Treat broker-summary/top as expensive (~2 credits) — log every call.
4. Governor: max 1 broker-top + 1 free-float per live investigate (+ optional 1 critic refinement only if needed).
5. Keep **>200 credits** buffer before submit day.
6. Never call Sectors from the browser.

## Mapping to tools (allowlist)

| Tool name | Sectors use | Est. credits |
|-----------|-------------|--------------|
| `fetch_broker_summary_top` | broker-summary/top | ~2 |
| `fetch_free_float` | free-float | low / check docs |
| `draft_narrative` | local LLM / template | 0 Sectors |

Exact path/query params depend on current Sectors API docs — implement adapters in BE, keep names stable in allowlist.
