# TRK Security — Guardrail, Audit, Governor

Lightweight security model for Aegis-IDX agent runtime (Track-oriented).

## 1. Guardrail

- **Tool allowlist only** — Executor refuses unknown tools.
- **No order/trade tools** — never present in allowlist.
- **Narrative filter** — block or rewrite advice patterns (beli/jual rekomendasi, target harga sebagai saran).
- **Ticker sanitize** — uppercase, alphanumeric, length 3–4 typical IDX; reject injection strings.
- **Mode enforcement** — mock/cache never call Sectors even if planner asks.

## 2. Audit

- Log per investigate: timestamp, ticker, requested_mode, served_mode, tools_run, credit_estimate, latency_ms.
- Persist step trace in response `steps` (user-visible audit for judges).
- Do not log full API keys; mask secrets in error messages.
- Optional: append-only `audit.jsonl` locally for demo replay.

## 3. Governor

- **Credit governor:** soft limit per request (e.g. max 1x broker-top + 1x free-float); hard stop if session credits remaining < threshold.
- **Refinement governor:** Critic may add at most **one** extra tool call.
- **Rate governor:** simple in-memory cooldown per ticker (e.g. 30s) in live mode to protect credits.
- **Fallback governor:** on live failure → cache → mock; always return disclaimer.

## Demo talking point

> Guardrail keeps tools safe, Audit makes the loop visible, Governor protects the 1,000-credit budget.
