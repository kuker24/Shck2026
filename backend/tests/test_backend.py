import asyncio
import unittest
from starlette.testclient import TestClient
from app.main import app
from app.models.schemas import InvestigateRequest
from app.agent.loop import run_investigate_loop
from app.security.guardrail import sanitize_ticker, sanitize_narrative
from app.tools.allowlist import verify_tool_allowed, ToolNotAllowedError
from app.tools.cache import cache_put, cache_get

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

if __name__ == "__main__":
    unittest.main()
