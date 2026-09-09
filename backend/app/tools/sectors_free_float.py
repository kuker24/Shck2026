from typing import Any
import httpx
from ..core.config import settings


def _auth_headers(key: str) -> dict[str, str]:
    return {"Authorization": key, "Accept": "application/json"}


def _parse_percent(raw: Any) -> float | None:
    if raw is None:
        return None
    if isinstance(raw, (int, float)):
        val = float(raw)
        # ownership share_percentage sometimes 0-100, screener free_float is 0-1
        return val * 100.0 if 0 < val <= 1 else val
    s = str(raw).strip().replace("%", "").replace(",", ".")
    try:
        val = float(s)
        return val * 100.0 if 0 < val <= 1 else val
    except ValueError:
        return None


async def fetch_free_float(ticker: str, api_key: str | None = None) -> dict[str, Any]:
    """Fetch free-float via company ownership Public row (Sectors v2, ~1+ credits)."""
    key = api_key or settings.SECTORS_API_KEY
    if not key:
        raise ValueError("SECTORS_API_KEY tidak dikonfigurasi untuk pemanggilan live.")

    base = settings.SECTORS_BASE_URL.rstrip("/")
    if base.endswith("/v1"):
        base = base[:-3] + "/v2"
    elif not base.endswith("/v2"):
        base = base + "/v2"

    symbol = ticker.strip().upper().replace(".JK", "")
    url = f"{base}/company/report/{symbol}/"
    params = {"sections": "ownership"}

    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        try:
            resp = await client.get(url, headers=_auth_headers(key), params=params)
            if resp.status_code == 404:
                return {
                    "percent": None,
                    "shares": None,
                    "as_of": None,
                    "note": "Data free float tidak ditemukan",
                }
            resp.raise_for_status()
            data = resp.json()
            ownership = data.get("ownership") or {}
            majors = ownership.get("major_shareholders") or []
            public = None
            for row in majors:
                name = str(row.get("name") or "").strip().lower()
                if name in {"public", "masyarakat", "publik"}:
                    public = row
                    break
            if not public and majors:
                # fallback: largest non-controlling public-like label
                for row in majors:
                    if "public" in str(row.get("name") or "").lower():
                        public = row
                        break

            if not public:
                return {
                    "percent": None,
                    "shares": None,
                    "as_of": None,
                    "note": "Baris Public tidak ada di ownership report",
                }

            percent = _parse_percent(public.get("share_percentage"))
            shares = public.get("share_amount") or public.get("shares")
            try:
                shares = int(shares) if shares is not None else None
            except (TypeError, ValueError):
                shares = None

            return {
                "percent": percent,
                "shares": shares,
                "as_of": None,
                "note": "Free float dari major_shareholders Public (Sectors v2 company report)",
            }
        except Exception as e:
            return {
                "percent": None,
                "shares": None,
                "as_of": None,
                "note": f"Gagal mengambil free float live: {e}",
            }
