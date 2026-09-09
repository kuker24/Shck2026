# Backend PRD — AFTER Frontend DoD

Do **not** prioritize BE until FE DoD in `01_PRD/ACCEPTANCE_CRITERIA.md` is green.

## Stack

- FastAPI + Pydantic v2
- Python 3.11+
- HTTP client for Sectors (httpx)
- Optional LLM for narrative (or template-based narrative for credit/demo safety)
- In-memory or SQLite cache for investigate payloads

## Suggested structure

```
app/
  main.py                 # FastAPI app, CORS, routers
  api/v1/investigate.py   # POST /v1/investigate
  models/schemas.py       # Request/Response matching OpenAPI
  agent/
    planner.py
    executor.py
    critic.py
    loop.py               # investigate() orchestration
  tools/
    allowlist.py
    sectors_broker.py
    sectors_free_float.py
    narrative.py
  security/
    guardrail.py
    audit.py
    governor.py
  data/
    mocks/                # copy or symlink of 08_DATA_MOCKS
  core/config.py          # env settings
```

## Environment

```
SECTORS_API_KEY=
DEFAULT_MODE=mock
OPENAI_API_KEY=           # optional
CREDIT_SOFT_LIMIT=4
CORS_ORIGINS=http://localhost:3000
```

Provide `.env.example` only — never commit real keys.

## Critic rules (must)

1. Response must include brokers.top_buyers/top_sellers arrays (may be empty with error note).
2. Strip advice phrases: beli/jual rekomendasi, accumulate/reduce as advice, price targets.
3. Always attach standard disclaimer (COPY_ID disclaimer_long or short).
4. At most one refinement tool call.
5. served `mode` must reflect reality (if fell back, say cache/mock).

## Endpoint

`POST /v1/investigate` — see `03_API_CONTRACTS/investigate.openapi.yaml`.

## Observability

- Structured log line per request with credit_estimate.
- `/health` simple OK.
- `/docs` enabled for judges/demo.
