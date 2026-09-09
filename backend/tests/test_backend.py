import asyncio
import unittest
from starlette.testclient import TestClient
from app.main import app
from app.models.schemas import InvestigateRequest
from app.agent.loop import merge_refinement_evidence, run_investigate_loop
from app.agent.critic import Critic
from app.security.guardrail import sanitize_ticker, sanitize_narrative
from app.tools.allowlist import verify_tool_allowed, ToolNotAllowedError
from app.tools.cache import cache_put, cache_get, CacheStore

class TestAegisBackend(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_ticker_sanitization(self):
        self.assertEqual(sanitize_ticker("bbca"), "BBCA")
        self.assertEqual(sanitize_ticker("  tlkm  "), "TLKM")
        with self.assertRaises(ValueError):
            sanitize_ticker("X")  # Too short
        with self.assertRaises(ValueError):
            sanitize_ticker("VERYLONGTICKER123")  # Too long

    def test_tool_allowlist(self):
        # Allowed tools
        verify_tool_allowed("fetch_broker_summary_top")
        verify_tool_allowed("fetch_free_float")
        verify_tool_allowed("draft_narrative")
        verify_tool_allowed("load_mock_payload")

        # Disallowed tool
        with self.assertRaises(ToolNotAllowedError):
            verify_tool_allowed("place_order_auto_trade")

    def test_critic_advice_filter(self):
        toxic_text = "Sebaiknya beli BBCA sekarang karena target harga 12000 dan pasti naik."
        cleaned = sanitize_narrative(toxic_text)
        self.assertNotIn("sebaiknya beli", cleaned.lower())
        self.assertNotIn("target harga", cleaned.lower())
        self.assertNotIn("pasti naik", cleaned.lower())

    def test_cache_store(self):
        cache_put("TEST_TICKER", {"ticker": "TEST_TICKER", "dummy": 123})
        res = cache_get("TEST_TICKER")
        self.assertIsNotNone(res)
        if res:
            self.assertEqual(res.get("dummy"), 123)

    def test_mock_investigate_bbca(self):
        req = InvestigateRequest(ticker="BBCA", mode="mock")
        resp = asyncio.run(run_investigate_loop(req))
        self.assertEqual(resp.ticker, "BBCA")
        self.assertEqual(resp.mode, "mock")
        self.assertGreater(len(resp.brokers.top_buyers), 0)
        self.assertGreater(len(resp.brokers.top_sellers), 0)
        self.assertIsNotNone(resp.free_float.percent)
        self.assertIn("Ini bukan saran investasi", resp.disclaimer)
        self.assertEqual(resp.credit_estimate, 0.0)

    def test_mock_investigate_empty(self):
        req = InvestigateRequest(ticker="XXXX", mode="mock")
        resp = asyncio.run(run_investigate_loop(req))
        self.assertEqual(resp.ticker, "XXXX")
        self.assertEqual(resp.mode, "mock")
        self.assertIsNotNone(resp.error)
        self.assertEqual(len(resp.brokers.top_buyers), 0)
        self.assertIn("Ini bukan saran investasi", resp.disclaimer)

    def test_api_health(self):
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "ok")

    def test_api_investigate_endpoint(self):
        resp = self.client.post("/v1/investigate", json={"ticker": "BBCA", "mode": "mock"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["ticker"], "BBCA")
        self.assertEqual(data["mode"], "mock")
        self.assertIn("steps", data)
        self.assertIn("brokers", data)
        self.assertIn("free_float", data)
        self.assertIn("narrative", data)
        self.assertIn("disclaimer", data)

    def test_api_invalid_ticker(self):
        resp = self.client.post("/v1/investigate", json={"ticker": "Z", "mode": "mock"})
        self.assertEqual(resp.status_code, 422)  # Pydantic min_length validation

    def test_merge_refinement_evidence(self):
        brokers = {"top_buyers": [], "top_sellers": []}
        ff = {"percent": 10.0}
        merged_b, merged_f = merge_refinement_evidence(
            brokers,
            ff,
            "fetch_broker_summary_top",
            {
                "top_buyers": [{"broker_code": "YK", "broker_name": "Yuanta", "net_value": 1, "buy_value": 2, "sell_value": 1, "rank": 1}],
                "top_sellers": [],
            },
        )
        self.assertEqual(merged_b["top_buyers"][0]["broker_code"], "YK")
        self.assertEqual(merged_f["percent"], 10.0)

    def test_critic_requests_one_broker_retry(self):
        first = Critic.review(
            "BBCA",
            {"brokers": {"top_buyers": [], "top_sellers": []}, "can_retry_broker": True},
            "Narasi faktual.",
        )
        self.assertTrue(first.needs_refinement)
        self.assertEqual(first.refinement_tool, "fetch_broker_summary_top")
        second = Critic.review(
            "BBCA",
            {"brokers": {"top_buyers": [{"broker_code": "YK"}], "top_sellers": []}},
            "Narasi faktual.",
            refinement_count=1,
        )
        self.assertFalse(second.needs_refinement)

    def test_cache_miss_falls_back_to_mock(self):
        CacheStore._cache.pop("BBCA", None)
        CacheStore._timestamps.pop("BBCA", None)
        req = InvestigateRequest(ticker="BBCA", mode="cache")
        resp = asyncio.run(run_investigate_loop(req))
        self.assertEqual(resp.mode, "mock")
        details = " ".join((s.detail or "") for s in resp.steps)
        self.assertIn("Cache kosong", details)
        self.assertGreater(len(resp.brokers.top_buyers), 0)
        self.assertIn("Ini bukan saran investasi", resp.disclaimer)

    def test_live_refinement_merges_and_reruns_critic(self):
        from unittest.mock import patch
        from app.agent.executor import ToolExecutionResult

        empty_brokers = {"top_buyers": [], "top_sellers": []}
        filled_brokers = {
            "top_buyers": [
                {
                    "broker_code": "YK",
                    "broker_name": "Yuanta",
                    "net_value": 1.0,
                    "buy_value": 2.0,
                    "sell_value": 1.0,
                    "rank": 1,
                }
            ],
            "top_sellers": [],
        }
        ff = {"percent": 45.2, "shares": 1.0, "as_of": None, "note": None}
        broker_calls = {"n": 0}

        async def fake_tool(name, args):
            if name == "fetch_broker_summary_top":
                broker_calls["n"] += 1
                data = empty_brokers if broker_calls["n"] == 1 else filled_brokers
                return ToolExecutionResult(name, "done", data=data)
            if name == "fetch_free_float":
                return ToolExecutionResult(name, "done", data=ff)
            if name == "draft_narrative":
                return ToolExecutionResult(name, "done", data="Narasi faktual tanpa saran.")
            return ToolExecutionResult(name, "error", error=f"unexpected {name}")

        with patch("app.agent.loop.RateGovernor.check_and_record", return_value=None), patch(
            "app.agent.loop.CreditGovernor.validate_plan_credits", return_value=2.0
        ), patch("app.agent.loop.Executor.run_tool", side_effect=fake_tool):
            resp = asyncio.run(run_investigate_loop(InvestigateRequest(ticker="BBCA", mode="live")))

        self.assertEqual(resp.mode, "live")
        self.assertEqual(broker_calls["n"], 2)
        self.assertEqual(resp.brokers.top_buyers[0].broker_code, "YK")
        self.assertIn("Ini bukan saran investasi", resp.disclaimer)
        self.assertTrue(any("Refinement" in (s.detail or "") for s in resp.steps))

if __name__ == "__main__":
    unittest.main()
