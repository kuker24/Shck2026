from typing import Any
from datetime import date, timedelta
import httpx
from ..core.config import settings
from .errors import SectorsConfigError


def _auth_headers(key: str) -> dict[str, str]:
    # Sectors v2 docs: Authorization header is the raw API key (no Bearer prefix).
    return {"Authorization": key, "Accept": "application/json"}


def _normalize_row(row: dict[str, Any]) -> dict[str, Any]:
    code = str(row.get("broker_code") or row.get("code") or "")
    net = row.get("net_value", row.get("net_idr", 0)) or 0
    buy = row.get("buy_value", row.get("buy_idr", 0)) or 0
    sell = row.get("sell_value", row.get("sell_idr", 0)) or 0
    return {
        "broker_code": code,
        "broker_name": str(row.get("broker_name") or code),
        "net_value": float(net),
        "buy_value": float(buy),
        "sell_value": float(sell),
        "rank": int(row.get("rank") or 0),
    }


async def fetch_broker_summary_top(ticker: str, api_key: str | None = None) -> dict[str, Any]:
    """Fetch top broker buyers/sellers from Sectors API v2 (~2 credits)."""
    key = api_key or settings.SECTORS_API_KEY
    if not key:
        raise SectorsConfigError("SECTORS_API_KEY tidak dikonfigurasi untuk pemanggilan live.")

    base = settings.SECTORS_BASE_URL.rstrip("/")
    # Accept either https://api.sectors.app or .../v2
    if base.endswith("/v1"):
        base = base[:-3] + "/v2"
    elif not base.endswith("/v2"):
        base = base + "/v2"

    symbol = ticker.strip().upper().replace(".JK", "")
    end = date.today()
    start = end - timedelta(days=14)
    url = f"{base}/broker-summary/{symbol}/top/"
    params = {"start": start.isoformat(), "end": end.isoformat(), "n_brokers": 10}

    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        try:
            resp = await client.get(url, headers=_auth_headers(key), params=params)
            if resp.status_code == 404:
                return {"top_buyers": [], "top_sellers": []}
            resp.raise_for_status()
            data = resp.json()
            buyers = [_normalize_row(r) for r in (data.get("top_buyers") or [])]
            sellers = [_normalize_row(r) for r in (data.get("top_sellers") or [])]
            return {"top_buyers": buyers, "top_sellers": sellers}
        except httpx.HTTPStatusError as e:
            raise RuntimeError(
                f"Gagal mengambil broker summary dari Sectors ({e.response.status_code}): {e}"
            )
        except Exception as e:
            raise RuntimeError(f"Koneksi Sectors gagal: {e}")
