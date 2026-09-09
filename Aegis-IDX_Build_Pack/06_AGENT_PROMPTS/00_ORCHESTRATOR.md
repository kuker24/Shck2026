# How to use these prompts

1. **FE first:** Paste `01_PROMPT_FRONTEND.md` into a coding agent. Point it at this build pack. Require mock-first UI until FE DoD.
2. **BE after FE:** Only when FE DoD checklist is done, paste `02_PROMPT_BACKEND.md`.
3. Do not merge FE+BE into one mega-prompt for MVP — it burns focus and credits.
4. Keep product constraints: no advice, no auto-trade, no MCP-wrapper-only.
5. Team: solo Fahmi; invite SKT7-R2C4; deadline 30 Sep 2026; 1000 credits.

## Review cadence

- After FE prompt run: walk `ACCEPTANCE_CRITERIA.md` FE DoD.
- After BE prompt run: walk BE DoD + hit `/docs` + compare to OpenAPI + mocks.
