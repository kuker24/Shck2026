# Tool Allowlist

Executor may run **only** these tools. Anything else → `ToolNotAllowed`.

| Tool | Side effects | Sectors credits | Purpose |
|------|--------------|-----------------|---------|
| `fetch_broker_summary_top` | External GET | ~2 | Top buyers/sellers for ticker |
| `fetch_free_float` | External GET | low / per docs | Free float snapshot |
| `draft_narrative` | Local / LLM | 0 Sectors | Draft ID narrative from facts |
| `load_mock_payload` | Local file | 0 | Mock mode loader |
| `cache_get` / `cache_put` | Local store | 0 | Cache mode |

## Explicitly denied (examples)

- Any order placement / trading API
- Arbitrary HTTP fetch / SSRF
- Shell execution
- Unbounded web search
- MCP passthrough of unknown tools

## Planner instructions

Planner prompt must enumerate allowlist names only. Critic verifies every executed tool ∈ allowlist.
