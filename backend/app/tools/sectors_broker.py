from typing import Any
import httpx
from ..core.config import settings

async def fetch_broker_summary_top(ticker: str, api_key: str | None = None) -> dict[str, Any]:
    """Fetch top broker buyers and sellers from Sectors API (~2 credits)."""
    key = api_key or settings.SECTORS_API_KEY
    if not key:
        raise ValueError("SECTORS_API_KEY tidak dikonfigurasi untuk pemanggilan live.")

    base_url = settings.SECTORS_BASE_URL.rstrip("/")
    headers = {
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
    }

    # Sectors broker summary endpoint
    url = f"{base_url}/investigate/{ticker}/broker-summary"
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 404:
                # Ticker not found
                return {"top_buyers": [], "top_sellers": []}
            resp.raise_for_status()
            data = resp.json()

            # Normalize data structure to standard BrokerRow format
            return {
                "top_buyers": data.get("top_buyers", []),
                "top_sellers": data.get("top_sellers", []),
            }
        except httpx.HTTPStatusError as e:
            # Attempt alternative endpoint if path varies
            if e.response.status_code == 404:
                alt_url = f"{base_url}/companies/{ticker}/broker-summary/top"
                resp_alt = await client.get(alt_url, headers=headers)
                if resp_alt.is_success:
                    d = resp_alt.json()
                    return {"top_buyers": d.get("top_buyers", []), "top_sellers": d.get("top_sellers", [])}
            raise RuntimeError(f"Gagal mengambil broker summary dari Sectors ({e.response.status_code}): {e}")
        except Exception as e:
            raise RuntimeError(f"Koneksi Sectors gagal: {e}")
