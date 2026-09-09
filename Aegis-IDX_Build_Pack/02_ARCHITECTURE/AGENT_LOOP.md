# Agent Loop — Planner / Executor / Critic

Track 1 requires **custom orchestration**. Aegis-IDX uses a three-role loop.

## Pseudo-code

```
function investigate(ticker, mode):
  if mode == "cache" and cache.has(ticker):
    return cache.get(ticker) with mode="cache"

  if mode == "mock":
    return load_mock(ticker)  # investigate_bbca.json or empty

  # --- LIVE ---
  plan = Planner.create_plan(ticker)
  # plan.steps example:
  #   1. fetch_broker_summary_top(ticker)
  #   2. fetch_free_float(ticker)
  #   3. draft_narrative(facts)

  observations = []
  for step in plan.steps:
    if step.tool not in ALLOWLIST:
      raise ToolNotAllowed(step.tool)
    result = Executor.run(step.tool, step.args)
    observations.append({step, result})
    log_credits(step.tool, estimate)

  critique = Critic.review(plan, observations)
  if critique.needs_refinement and critique.extra_steps:
    for step in critique.extra_steps[:1]:  # at most one refinement pass
      if step.tool in ALLOWLIST:
        observations.append(Executor.run(step.tool, step.args))

  narrative = Critic.ensure_safe_narrative(draft_narrative(observations))
  payload = assemble(steps=..., brokers=..., free_float=..., narrative, disclaimer, mode="live")
  cache.put(ticker, payload)
  return payload
```

## Role responsibilities

### Planner
- Input: ticker, budget hint, available tools.
- Output: ordered list of tool calls + intent notes.
- Must not invent non-allowlisted tools.

### Executor
- Runs only allowlisted tools (see TOOL_ALLOWLIST.md).
- Captures raw results, latency, credit estimate.
- On failure: returns structured error for Critic (no crash).

### Critic
- Checks: required facts present (brokers + free float or explicit missing)?
- Strips advice language (beli/jual rekomendasi, price targets as advice).
- May request **one** refinement step.
- Attaches standard disclaimer.
- Sets final `mode` to what was actually served.

## Steps array (API)

Each step object should include: `id`, `role` (planner|executor|critic), `title`, `status` (pending|running|done|error), `detail` (short).

UI StepsTimeline binds to this array for Track 1 visibility.
