import time
from typing import Optional

class GovernorError(Exception):
    pass

class RateGovernor:
    """Cooldown per ticker to prevent rapid credit exhaustion in live mode."""
    _last_live_call: dict[str, float] = {}
    COOLDOWN_SECONDS: float = 15.0

    @classmethod
    def check_and_record(cls, ticker: str) -> Optional[float]:
        """Returns wait_time if in cooldown, or None if allowed."""
        now = time.time()
        last = cls._last_live_call.get(ticker, 0.0)
        elapsed = now - last
        if elapsed < cls.COOLDOWN_SECONDS:
            return round(cls.COOLDOWN_SECONDS - elapsed, 1)
        cls._last_live_call[ticker] = now
        return None

TOOL_CREDIT_COST: dict[str, float] = {
    "fetch_broker_summary_top": 2.0,
    "fetch_free_float": 0.5,
}


class ClientGovernor:
    """Per-caller quota for live mode.

    RateGovernor is keyed by ticker, so one caller can still spend credits by
    rotating tickers. This caps billable requests per client within a window.
    mock and cache modes are free and are not counted here.
    """
    _hits: dict[str, list[float]] = {}
    WINDOW_SECONDS: float = 60.0
    MAX_LIVE_PER_WINDOW: int = 5

    @classmethod
    def check_and_record(cls, client_id: str) -> Optional[float]:
        """Returns retry_after seconds if the caller is over quota, else None."""
        now = time.time()
        recent = [t for t in cls._hits.get(client_id, []) if now - t < cls.WINDOW_SECONDS]

        if len(recent) >= cls.MAX_LIVE_PER_WINDOW:
            oldest = min(recent)
            cls._hits[client_id] = recent
            return round(cls.WINDOW_SECONDS - (now - oldest), 1)

        recent.append(now)
        cls._hits[client_id] = recent
        return None

    @classmethod
    def reset(cls) -> None:
        cls._hits.clear()


class CreditGovernor:
    """Protects the 1,000 credits budget by enforcing per-investigate tool limits.

    The plan itself may only request one call per paid tool. One critic refinement
    is allowed on top of that, so the hard runtime ceiling is plan + 1 retry.
    """
    MAX_BROKER_CALLS_PER_INVESTIGATE = 1
    MAX_FREE_FLOAT_CALLS_PER_INVESTIGATE = 1
    MAX_REFINEMENT_STEPS = 1
    # Plan (2.0 + 0.5) plus at most one refinement broker retry (2.0).
    MAX_CREDITS_PER_INVESTIGATE = 4.5

    @classmethod
    def validate_plan_credits(cls, tool_names: list[str]) -> float:
        broker_count = tool_names.count("fetch_broker_summary_top")
        ff_count = tool_names.count("fetch_free_float")

        if broker_count > cls.MAX_BROKER_CALLS_PER_INVESTIGATE:
            raise GovernorError(f"Governor limit exceeded: max {cls.MAX_BROKER_CALLS_PER_INVESTIGATE} broker-top per run.")
        if ff_count > cls.MAX_FREE_FLOAT_CALLS_PER_INVESTIGATE:
            raise GovernorError(f"Governor limit exceeded: max {cls.MAX_FREE_FLOAT_CALLS_PER_INVESTIGATE} free-float per run.")

        # Estimate credits: broker_top ≈ 2, free_float ≈ 0.5 (or low)
        est = (broker_count * 2.0) + (ff_count * 0.5)
        return est

    @classmethod
    def can_afford(cls, spent_credits: float, tool_name: str) -> bool:
        """Runtime gate: reject a paid tool call that would break the per-run ceiling."""
        cost = TOOL_CREDIT_COST.get(tool_name, 0.0)
        if cost <= 0.0:
            return True
        return (spent_credits + cost) <= cls.MAX_CREDITS_PER_INVESTIGATE
