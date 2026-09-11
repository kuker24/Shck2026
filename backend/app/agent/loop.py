import time
from datetime import datetime, timezone
from typing import Any
from ..models.schemas import (
    InvestigateRequest,
    InvestigateResponse,
    Step,
    Brokers,
    BrokerRow,
    FreeFloat,
    ErrorDetail,
)
from ..security.guardrail import sanitize_ticker
from ..security.governor import RateGovernor, CreditGovernor
from ..security.audit import AuditLogger
from .planner import Planner
from .executor import Executor
from .critic import Critic, DEFAULT_DISCLAIMER
from ..tools.cache import cache_get, cache_put


def merge_refinement_evidence(
    broker_data: dict[str, Any],
    ff_data: dict[str, Any],
    tool_name: str,
    tool_data: Any,
) -> tuple[dict[str, Any], dict[str, Any]]:
    if not isinstance(tool_data, dict) or not tool_data:
        return broker_data, ff_data
    if tool_name == "fetch_broker_summary_top":
        return tool_data, ff_data
    if tool_name == "fetch_free_float":
        return broker_data, tool_data
    return broker_data, ff_data


async def _mock_fallback_response(
    ticker: str,
    start_time: float,
    error_code: str,
    error_message: str,
    step_detail: str,
    steps_before: list[Step] | None = None,
    credit_estimate: float = 0.0,
    tools_run: list[str] | None = None,
) -> InvestigateResponse:
    """Serve mock payload when live is blocked or fails. Always audited, never bills."""
    tools_executed = list(tools_run or [])
    tools_executed.append("load_mock_payload")

    mock_res = await Executor.run_tool("load_mock_payload", {"ticker": ticker})
    mock_dict: dict[str, Any] = mock_res.data or {}

    steps_out = list(steps_before or [])
    steps_out.append(
        Step(
            id=f"s{len(steps_out) + 1}",
            role="planner" if not steps_before else "executor",
            title="Governor menahan panggilan live" if not steps_before else "Fallback data simulasi",
            status="done",
            detail=step_detail,
        )
    )
    steps_out.append(
        Step(
            id=f"s{len(steps_out) + 1}",
            role="critic",
            title="Meninjau hasil & menyusun narasi aman",
            status="done",
            detail="Narasi simulasi ditinjau; disclaimer hukum disematkan",
        )
    )

    critic_rev = Critic.review(
        ticker=ticker,
        observations={
            "brokers": mock_dict.get("brokers", {}),
            "free_float": mock_dict.get("free_float", {}),
        },
        drafted_narrative=mock_dict.get("narrative", ""),
    )

    latency = (time.perf_counter() - start_time) * 1000
    AuditLogger.log_investigation(
        ticker=ticker,
        requested_mode="live",
        served_mode="mock",
        tools_run=tools_executed,
        credit_estimate=credit_estimate,
        latency_ms=latency,
        error=f"{error_code}: {error_message}",
    )

    return InvestigateResponse(
        ticker=ticker,
        mode="mock",
        as_of=datetime.now(timezone.utc).isoformat(),
        credit_estimate=credit_estimate,
        steps=steps_out,
        brokers=Brokers.model_validate(
            mock_dict.get("brokers", {"top_buyers": [], "top_sellers": []})
        ),
        free_float=FreeFloat.model_validate(mock_dict.get("free_float", {})),
        narrative=critic_rev.narrative,
        disclaimer=critic_rev.disclaimer,
        error=ErrorDetail(code=error_code, message=error_message),
    )


async def run_investigate_loop(request: InvestigateRequest) -> InvestigateResponse:
    start_time = time.perf_counter()
    tools_executed: list[str] = []
    total_credits: float = 0.0

    # 1. Guardrail: Sanitize Ticker
    try:
        ticker = sanitize_ticker(request.ticker)
    except ValueError as e:
        return InvestigateResponse(
            ticker=request.ticker.upper(),
            mode="mock",
            steps=[
                Step(
                    id="s1",
                    role="planner",
                    title="Merencanakan investigasi",
                    status="error",
                    detail=str(e),
                )
            ],
            brokers=Brokers(top_buyers=[], top_sellers=[]),
            free_float=FreeFloat(),
            narrative="",
            disclaimer=DEFAULT_DISCLAIMER,
            error=ErrorDetail(code="INVALID_TICKER", message=str(e)),
        )

    requested_mode = request.mode
    cache_miss = False

    # 2. CACHE MODE HANDLER
    if requested_mode == "cache":
        cached_data = cache_get(ticker)
        if cached_data:
            latency = (time.perf_counter() - start_time) * 1000
            AuditLogger.log_investigation(
                ticker=ticker,
                requested_mode="cache",
                served_mode="cache",
                tools_run=["cache_get"],
                credit_estimate=0.0,
                latency_ms=latency,
            )
            cached_data["mode"] = "cache"
            return InvestigateResponse.model_validate(cached_data)
        cache_miss = True
        requested_mode = "mock"

    # 3. MOCK MODE HANDLER
    if requested_mode == "mock":
        plan = Planner.create_plan(ticker, mode="mock")
        tools_executed.append("load_mock_payload")

        mock_res = await Executor.run_tool("load_mock_payload", {"ticker": ticker})
        mock_data: dict[str, Any] = mock_res.data or {}

        # Run Critic on mock narrative
        critic_rev = Critic.review(
            ticker=ticker,
            observations={"brokers": mock_data.get("brokers", {}), "free_float": mock_data.get("free_float", {})},
            drafted_narrative=mock_data.get("narrative", ""),
        )

        served_steps = [
            Step.model_validate(s) for s in mock_data.get("steps", [])
        ] or [
            Step(id=p.id, role=p.role, title=p.title, status="done", detail=p.detail)  # type: ignore
            for p in plan.steps
        ]
        if cache_miss:
            if served_steps:
                prior = served_steps[0].detail or ""
                served_steps[0].detail = (
                    f"{prior} Cache kosong; memakai data simulasi.".strip()
                )
            else:
                served_steps.append(
                    Step(
                        id="s0",
                        role="planner",
                        title="Cache kosong",
                        status="done",
                        detail="Data tersimpan tidak ada; memakai data simulasi.",
                    )
                )

        response = InvestigateResponse(
            ticker=ticker,
            mode="mock",
            as_of=mock_data.get("as_of", datetime.now(timezone.utc).isoformat()),
            credit_estimate=0.0,
            steps=served_steps,
            brokers=Brokers.model_validate(mock_data.get("brokers", {"top_buyers": [], "top_sellers": []})),
            free_float=FreeFloat.model_validate(mock_data.get("free_float", {})),
            narrative=critic_rev.narrative,
            disclaimer=critic_rev.disclaimer,
            error=ErrorDetail.model_validate(mock_data["error"]) if mock_data.get("error") else None,
        )

        latency = (time.perf_counter() - start_time) * 1000
        AuditLogger.log_investigation(
            ticker=ticker,
            requested_mode="cache" if cache_miss else "mock",
            served_mode="mock",
            tools_run=tools_executed,
            credit_estimate=0.0,
            latency_ms=latency,
        )
        return response

    # 4. LIVE MODE HANDLER (Planner -> Executor -> Critic Loop)
    steps_out: list[Step] = []
    plan = Planner.create_plan(ticker, mode="live")

    # Governor check: Rate limit / Cooldown
    cooldown_wait = RateGovernor.check_and_record(ticker)
    if cooldown_wait:
        # Rate limit hit: never spend credits. Serve cache, else mock with warning.
        cached = cache_get(ticker)
        if cached:
            cached["mode"] = "cache"
            latency = (time.perf_counter() - start_time) * 1000
            AuditLogger.log_investigation(
                ticker=ticker,
                requested_mode="live",
                served_mode="cache",
                tools_run=["cache_get"],
                credit_estimate=0.0,
                latency_ms=latency,
                error=f"RATE_COOLDOWN: tunggu {cooldown_wait}s",
            )
            return InvestigateResponse.model_validate(cached)

        return await _mock_fallback_response(
            ticker=ticker,
            start_time=start_time,
            error_code="RATE_COOLDOWN",
            error_message=(
                f"Cooldown live aktif untuk {ticker}; coba lagi dalam {cooldown_wait} detik. "
                "Menyajikan data simulasi (0 kredit)."
            ),
            step_detail=(
                f"Cooldown governor aktif ({cooldown_wait}s); panggilan live dibatalkan "
                "demi menjaga kredit"
            ),
        )

    # Governor check: Credit validation
    tool_names = [s.tool_name for s in plan.steps]
    try:
        CreditGovernor.validate_plan_credits(tool_names)
    except Exception as ge:
        # Plan melebihi pagu kredit: jangan panggil live sama sekali.
        return await _mock_fallback_response(
            ticker=ticker,
            start_time=start_time,
            error_code="CREDIT_LIMIT",
            error_message=f"Rencana ditolak governor kredit: {ge}",
            step_detail=f"Rencana ditolak governor kredit ({ge}); memakai data simulasi",
        )

    # Step 1: Planner
    steps_out.append(
        Step(
            id="s1",
            role="planner",
            title="Merencanakan investigasi",
            status="done",
            detail=f"Menyusun rencana pengambilan data broker & free float untuk {ticker}",
        )
    )

    # Step 2: Executor - Broker Summary Top
    steps_out.append(
        Step(
            id="s2",
            role="executor",
            title="Mengambil ringkasan broker (top)",
            status="running",
            detail=f"Menghubungi endpoint broker Sectors untuk {ticker}",
        )
    )
    tools_executed.append("fetch_broker_summary_top")
    broker_res = await Executor.run_tool("fetch_broker_summary_top", {"ticker": ticker})
    total_credits += broker_res.credits_used

    if broker_res.status == "error":
        steps_out[-1].status = "error"
        steps_out[-1].detail = f"Live error: {broker_res.error}"

        # Soft-fail fallback to mock or cache per TRK Security
        cached = cache_get(ticker)
        if cached:
            cached["mode"] = "cache"
            latency = (time.perf_counter() - start_time) * 1000
            AuditLogger.log_investigation(
                ticker=ticker,
                requested_mode="live",
                served_mode="cache",
                tools_run=tools_executed + ["cache_get"],
                credit_estimate=total_credits,
                latency_ms=latency,
                error=f"LIVE_FAIL_FALLBACK: {broker_res.error}",
            )
            return InvestigateResponse.model_validate(cached)

        # Fallback to mock data with note
        steps_out.append(
            Step(
                id="s3",
                role="executor",
                title="Mengambil free float",
                status="skipped",
                detail="Dilewati karena panggilan live broker bermasalah",
            )
        )
        return await _mock_fallback_response(
            ticker=ticker,
            start_time=start_time,
            error_code="LIVE_FAIL_FALLBACK",
            error_message="Gagal memanggil live Sectors API; beralih ke mock.",
            step_detail="Fallback otomatis ke mock data demi kelangsungan demo",
            steps_before=steps_out,
            credit_estimate=total_credits,
            tools_run=tools_executed,
        )

    steps_out[-1].status = "done"
    steps_out[-1].detail = f"Data broker top {ticker} berhasil dihimpun (~2 kredit)"
    broker_data = broker_res.data or {"top_buyers": [], "top_sellers": []}

    # Step 3: Executor - Free Float
    steps_out.append(
        Step(
            id="s3",
            role="executor",
            title="Mengambil free float",
            status="running",
            detail=f"Menghubungi endpoint free float untuk {ticker}",
        )
    )
    tools_executed.append("fetch_free_float")
    ff_res = await Executor.run_tool("fetch_free_float", {"ticker": ticker})
    total_credits += ff_res.credits_used
    # The tool soft-fails internally and flags it with ok=False, so check both
    # the executor status and the tool's own success flag.
    ff_payload = ff_res.data if isinstance(ff_res.data, dict) else None
    ff_failed = (
        ff_res.status == "error"
        or ff_payload is None
        or ff_payload.get("ok") is False
    )

    steps_out[-1].status = "done"
    if ff_failed or ff_payload is None:
        err_note = ff_res.error or (ff_payload or {}).get("note") or "data tidak lengkap"
        steps_out[-1].detail = (
            f"Free float live gagal ({err_note}); pemeriksaan broker tetap dilanjutkan"
        )
        ff_data = {
            "percent": None,
            "shares": None,
            "as_of": None,
            "note": f"Free float live tidak tersedia: {err_note}",
        }
    else:
        steps_out[-1].detail = f"Free float {ticker} siap"
        ff_data = {k: v for k, v in ff_payload.items() if k != "ok"}

    # Draft raw narrative
    tools_executed.append("draft_narrative")
    narrative_res = await Executor.run_tool(
        "draft_narrative",
        {
            "ticker": ticker,
            "brokers": broker_data,
            "free_float": ff_data,
            "is_mock": False,
        },
    )
    draft_text = str(narrative_res.data)

    # Step 4: Critic Review
    steps_out.append(
        Step(
            id="s4",
            role="critic",
            title="Meninjau hasil & menyusun narasi aman",
            status="running",
            detail="Validasi fakta, filtering bahasa spekulasi, & penyematan disclaimer",
        )
    )

    critic_review = Critic.review(
        ticker=ticker,
        observations={
            "brokers": broker_data,
            "free_float": ff_data,
            "can_retry_broker": True,
        },
        drafted_narrative=draft_text,
    )

    refinement_blocked = False
    if critic_review.needs_refinement and critic_review.refinement_tool:
        if not CreditGovernor.can_afford(total_credits, critic_review.refinement_tool):
            refinement_blocked = True

    if critic_review.needs_refinement and critic_review.refinement_tool and not refinement_blocked:
        tools_executed.append(critic_review.refinement_tool)
        ref_res = await Executor.run_tool(
            critic_review.refinement_tool,
            critic_review.refinement_args or {"ticker": ticker},
        )
        total_credits += ref_res.credits_used
        if ref_res.status != "error":
            broker_data, ff_data = merge_refinement_evidence(
                broker_data,
                ff_data,
                critic_review.refinement_tool,
                ref_res.data,
            )
            narrative_res = await Executor.run_tool(
                "draft_narrative",
                {
                    "ticker": ticker,
                    "brokers": broker_data,
                    "free_float": ff_data,
                    "is_mock": False,
                },
            )
            draft_text = str(narrative_res.data)
        critic_review = Critic.review(
            ticker=ticker,
            observations={"brokers": broker_data, "free_float": ff_data},
            drafted_narrative=draft_text,
            refinement_count=1,
        )
        steps_out[-1].detail = "Refinement selesai; narasi dan disclaimer dari critic terakhir"
    elif refinement_blocked:
        steps_out[-1].detail = (
            "Refinement dibatalkan governor kredit "
            f"(pagu {CreditGovernor.MAX_CREDITS_PER_INVESTIGATE} kredit per investigasi); "
            "narasi disusun dari bukti yang ada"
        )
    else:
        steps_out[-1].detail = "Objektivitas narasi disetujui, disclaimer hukum disematkan"

    steps_out[-1].status = "done"

    final_response = InvestigateResponse(
        ticker=ticker,
        mode="live",
        as_of=datetime.now(timezone.utc).isoformat(),
        credit_estimate=total_credits,
        steps=steps_out,
        brokers=Brokers(
            top_buyers=[BrokerRow.model_validate(b) for b in broker_data.get("top_buyers", [])],
            top_sellers=[BrokerRow.model_validate(s) for s in broker_data.get("top_sellers", [])],
        ),
        free_float=FreeFloat.model_validate(ff_data),
        narrative=critic_review.narrative,
        disclaimer=critic_review.disclaimer,
        error=None,
    )

    # Save to cache for future requests
    cache_put(ticker, final_response.model_dump())

    latency = (time.perf_counter() - start_time) * 1000
    AuditLogger.log_investigation(
        ticker=ticker,
        requested_mode="live",
        served_mode="live",
        tools_run=tools_executed,
        credit_estimate=total_credits,
        latency_ms=latency,
    )

    return final_response
