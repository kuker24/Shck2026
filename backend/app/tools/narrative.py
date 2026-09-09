from typing import Any
from ..security.guardrail import sanitize_narrative

def draft_narrative(ticker: str, brokers: dict[str, Any], free_float: dict[str, Any], is_mock: bool = False) -> str:
    """Generate factual, objective Bahasa Indonesia narrative from observed market facts."""
    top_buyers = brokers.get("top_buyers", [])
    top_sellers = brokers.get("top_sellers", [])
    ff_percent = free_float.get("percent")

    mode_prefix = f"Untuk {ticker}" + (" (mode mock)" if is_mock else "")

    if not top_buyers and not top_sellers:
        return f"{mode_prefix}, data aliran broker tidak ditemukan atau belum tersedia dalam periode observasi."

    narrative_parts = [mode_prefix + ","]

    if top_buyers:
        b1 = top_buyers[0]
        net_buy_str = f"Rp {abs(b1.get('net_value', 0)):,.0f}".replace(",", ".")
        narrative_parts.append(
            f"aliran broker mencatat konsentrasi net buy terbesar pada sekuritas {b1.get('broker_name', b1.get('broker_code'))} ({b1.get('broker_code')}) sebesar {net_buy_str}"
        )

    if top_sellers:
        s1 = top_sellers[0]
        net_sell_str = f"Rp {abs(s1.get('net_value', 0)):,.0f}".replace(",", ".")
        narrative_parts.append(
            f"sementara sisi top sellers dipimpin oleh {s1.get('broker_name', s1.get('broker_code'))} ({s1.get('broker_code')}) dengan net sell {net_sell_str}."
        )

    if ff_percent is not None:
        narrative_parts.append(
            f"Free float tercatat sekitar {ff_percent:.1f}%, memberikan gambaran likuiditas saham yang beredar di pasar publik."
        )

    narrative_parts.append(
        "Ringkasan ini bersifat investigatif untuk memetakan alokasi aliran volume broker dan tidak menafsirkan arah pergerakan harga ke depan."
    )

    raw_text = " ".join(narrative_parts)
    return sanitize_narrative(raw_text)
