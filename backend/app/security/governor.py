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

class CreditGovernor:
    """Protects the 1,000 credits budget by enforcing per-investigate tool limits."""
    MAX_BROKER_CALLS_PER_INVESTIGATE = 1
    MAX_FREE_FLOAT_CALLS_PER_INVESTIGATE = 1
    MAX_REFINEMENT_STEPS = 1

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
