# System Overview — Aegis-IDX

## High-level ASCII

```
+------------------+         POST /v1/investigate         +------------------------+
|  Next.js FE      |  ticker + mode(mock|live|cache)      |  FastAPI Backend        |
|  TS + Tailwind   | ---------------------------------->  |  Planner-Executor-Critic|
|                  | <----------------------------------  |                        |
|  ModeBadge       |   steps, brokers, free_float,        |  Tool allowlist         |
|  StepsTimeline   |   narrative, disclaimer, mode        |  Response cache         |
|  BrokerTable     |                                      +-----------+------------+
|  FreeFloatCard   |                                                  |
|  NarrativePanel  |                                                  | live only
|  Disclaimer      |                                                  v
+------------------+                                      +------------------------+
                                                          |  Sectors API (IDX)     |
                                                          |  broker-summary/top    |
                                                          |  free-float            |
                                                          |  (~2 credits / top)    |
                                                          +------------------------+
```

## Trust boundaries

- Browser never holds `SECTORS_API_KEY`.
- FE may load local mocks in pure FE phase.
- Backend is the only live caller of Sectors.
- Critic + guardrails sit before narrative is returned.

## Modes

| Mode | FE | BE | Sectors spend |
|------|----|----|---------------|
| mock | Uses JSON mocks or BE mock | No external calls | 0 |
| live | Calls BE | Planner runs tools | Yes (budgeted) |
| cache | Calls BE | Returns last good | 0 |

## Components map

- **FE:** presentation + mode UX + steps visualization
- **BE:** orchestration + contracts + credit logging
- **Sectors:** market data source for Track 1
