# Paste-ready prompt — Backend after FE

You are building **Aegis-IDX** backend. Frontend DoD is already complete — do not rebuild FE unless fixing API integration types.

## Constraints

- FastAPI Planner → Executor → Critic custom orchestration (Track 1). Not MCP-wrapper-only.
- Implement `POST /v1/investigate` per `03_API_CONTRACTS/investigate.openapi.yaml`.
- Modes: `mock` | `live` | `cache`.
- Tool allowlist from `05_BACKEND_SPEC/TOOL_ALLOWLIST.md`.
- TRK security: Guardrail, Audit, Governor (`02_ARCHITECTURE/TRK_SECURITY.md`).
- No advice / no auto-trade language in narrative.
- Protect 1000 Sectors credits; log credit_estimate; prefer cache after first live.
- Secrets only via env; ship `.env.example`.

## Deliver

1. Project structure per `05_BACKEND_SPEC/BACKEND_PRD.md`.
2. Agent loop per `02_ARCHITECTURE/AGENT_LOOP.md`.
3. mock mode returns schema matching `08_DATA_MOCKS`.
4. live mode calls allowlisted Sectors adapters (broker top ~2 credits, free-float).
5. cache mode returns last payload.
6. CORS for local Next.js; `/docs` enabled.
7. Critic strips advice phrases; always sets disclaimer + served mode.

## Done when

BE DoD in `01_PRD/ACCEPTANCE_CRITERIA.md` is checkable and FE can switch from local mock to API.
