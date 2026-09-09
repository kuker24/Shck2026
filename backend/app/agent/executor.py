import time
from typing import Any
from ..tools.allowlist import verify_tool_allowed
from ..tools.mock_loader import load_mock_payload
from ..tools.sectors_broker import fetch_broker_summary_top
from ..tools.sectors_free_float import fetch_free_float
from ..tools.narrative import draft_narrative
from ..tools.cache import cache_get, cache_put

class ToolExecutionResult:
    def __init__(
        self,
        tool_name: str,
        status: str,
        data: Any = None,
        error: str | None = None,
        latency_ms: float = 0.0,
        credits_used: float = 0.0,
    ):
        self.tool_name = tool_name
        self.status = status
        self.data = data
        self.error = error
        self.latency_ms = latency_ms
        self.credits_used = credits_used

class Executor:
    @staticmethod
    async def run_tool(tool_name: str, args: dict[str, Any]) -> ToolExecutionResult:
        """Enforces tool allowlist and executes safely with metrics."""
        # 1. Allowlist enforcement
        verify_tool_allowed(tool_name)

        start_t = time.perf_counter()
        credits_spent = 0.0

        try:
            if tool_name == "load_mock_payload":
                ticker = args.get("ticker", "BBCA")
                res = load_mock_payload(ticker)
                return ToolExecutionResult(
                    tool_name=tool_name,
                    status="done",
                    data=res,
                    latency_ms=(time.perf_counter() - start_t) * 1000,
                    credits_used=0.0,
                )

            elif tool_name == "cache_get":
                ticker = args.get("ticker", "")
                res = cache_get(ticker)
                return ToolExecutionResult(
                    tool_name=tool_name,
                    status="done",
                    data=res,
                    latency_ms=(time.perf_counter() - start_t) * 1000,
                    credits_used=0.0,
                )

            elif tool_name == "cache_put":
                ticker = args.get("ticker", "")
                payload = args.get("payload", {})
                cache_put(ticker, payload)
                return ToolExecutionResult(
                    tool_name=tool_name,
                    status="done",
                    data=None,
                    latency_ms=(time.perf_counter() - start_t) * 1000,
                    credits_used=0.0,
                )

            elif tool_name == "fetch_broker_summary_top":
                ticker = args.get("ticker", "")
                credits_spent = 2.0  # Sectors broker top est ~2 credits
                res = await fetch_broker_summary_top(ticker)
                return ToolExecutionResult(
                    tool_name=tool_name,
                    status="done",
                    data=res,
                    latency_ms=(time.perf_counter() - start_t) * 1000,
                    credits_used=credits_spent,
                )

            elif tool_name == "fetch_free_float":
                ticker = args.get("ticker", "")
                credits_spent = 0.5
                res = await fetch_free_float(ticker)
                return ToolExecutionResult(
                    tool_name=tool_name,
                    status="done",
                    data=res,
                    latency_ms=(time.perf_counter() - start_t) * 1000,
                    credits_used=credits_spent,
                )

            elif tool_name == "draft_narrative":
                ticker = args.get("ticker", "")
                brokers = args.get("brokers", {})
                free_float = args.get("free_float", {})
                is_mock = args.get("is_mock", False)
                res = draft_narrative(ticker, brokers, free_float, is_mock=is_mock)
                return ToolExecutionResult(
                    tool_name=tool_name,
                    status="done",
                    data=res,
                    latency_ms=(time.perf_counter() - start_t) * 1000,
                    credits_used=0.0,
                )

            else:
                raise ValueError(f"Alat tidak dikenali: {tool_name}")

        except Exception as e:
            return ToolExecutionResult(
                tool_name=tool_name,
                status="error",
                error=str(e),
                latency_ms=(time.perf_counter() - start_t) * 1000,
                credits_used=credits_spent,
            )
