from typing import Any, Optional
from ..security.guardrail import sanitize_narrative

DEFAULT_DISCLAIMER = (
    "Ini bukan saran investasi. Aegis-IDX hanya menampilkan konteks investigasi data broker "
    "dan free float. Keputusan investasi adalah tanggung jawab Anda sendiri."
)

class CriticReview:
    def __init__(
        self,
        is_valid: bool,
        narrative: str,
        disclaimer: str,
        needs_refinement: bool = False,
        refinement_tool: Optional[str] = None,
        refinement_args: Optional[dict[str, Any]] = None,
    ):
        self.is_valid = is_valid
        self.narrative = narrative
        self.disclaimer = disclaimer
        self.needs_refinement = needs_refinement
        self.refinement_tool = refinement_tool
        self.refinement_args = refinement_args

class Critic:
    @staticmethod
    def review(
        ticker: str,
        observations: dict[str, Any],
        drafted_narrative: str,
        refinement_count: int = 0,
    ) -> CriticReview:
        """Enforce strict non-advice guardrails, completeness, and attach disclaimer."""
        brokers = observations.get("brokers", {})
        top_buyers = brokers.get("top_buyers", [])
        top_sellers = brokers.get("top_sellers", [])
        free_float = observations.get("free_float", {})

        # 1. Enforce strict anti-advice sanitization on the narrative
        clean_narrative = sanitize_narrative(drafted_narrative)

        # 2. Check if refinement is necessary (e.g. broker top missing while free float exists)
        needs_refinement = False
        refinement_tool = None
        refinement_args = None

        if (
            not top_buyers
            and not top_sellers
            and refinement_count < 1
            and observations.get("can_retry_broker", False)
        ):
            needs_refinement = True
            refinement_tool = "fetch_broker_summary_top"
            refinement_args = {"ticker": ticker}

        # 3. Always attach non-negotiable legal disclaimer
        return CriticReview(
            is_valid=True,
            narrative=clean_narrative,
            disclaimer=DEFAULT_DISCLAIMER,
            needs_refinement=needs_refinement,
            refinement_tool=refinement_tool,
            refinement_args=refinement_args,
        )
