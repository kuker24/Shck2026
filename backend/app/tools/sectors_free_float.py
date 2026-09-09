from typing import Any
import httpx
from ..core.config import settings

async def fetch_free_float(ticker: str, api_key: str | None = None) -> dict[str, Any]:
    """Fetch free-float snapshot for ticker from Sectors API."""
    key = api_key or settings.SECTORS_API_KEY
    if not key:
        raise ValueError("SECTORS_API_KEY tidak dikonfigurasi untuk pemanggilan live.")

    base_url = settings.SECTORS_BASE_URL.rstrip("/")
    headers = {
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
    }

    url = f"{base_url}/companies/{ticker}/free-float"
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 404:
                return {
                    "percent": None,
                    "shares": None,
                    "as_of": None,
                    "note": "Data free float tidak ditemukan",
                }
            resp.raise_for_status()
            data = resp.json()
            return {
                "percent": data.get("percent") or data.get("free_float_percentage"),
                "shares": data.get("shares") or data.get("total_shares"),
                "as_of": data.get("as_of"),
                "note": data.get("note", "Data live dari Sectors API"),
            }
        except Exception as e:
            # Non-blocking soft fail for free float
            return {
                "percent": None,
                "shares": None,
                "as_of": None,
                "note": f"Gagal mengambil free float live: {e}",
            }
