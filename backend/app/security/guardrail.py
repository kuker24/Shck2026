import re

DISALLOWED_ADVICE_PATTERNS = [
    r"\b(sebaiknya\s+beli|rekomendasi\s+beli|buy\s+now|strong\s+buy)\b",
    r"\b(sebaiknya\s+jual|rekomendasi\s+jual|sell\s+now|strong\s+sell)\b",
    r"\b(target\s+harga\s*[:=]?\s*\d+|cut\s+loss\s+di|take\s+profit\s+di)\b",
    r"\b(pasti\s+naik|pasti\s+turun|dijamin\s+cuan|serok|haka)\b",
    r"\b(wajib\s+koleksi|sinyal\s+masuk|sinyal\s+keluar)\b",
]

def sanitize_ticker(ticker: str) -> str:
    """Sanitize ticker input: uppercase, only alphanumeric, 2-10 characters."""
    cleaned = re.sub(r"[^A-Za-z0-9]", "", ticker.strip().upper())
    if len(cleaned) < 2 or len(cleaned) > 10:
        raise ValueError(f"Ticker tidak valid: '{ticker}'. Panjang harus 2-10 karakter alfanumerik.")
    return cleaned

def sanitize_narrative(narrative: str) -> str:
    """Filter or rewrite advice phrases to enforce factual non-advice stance."""
    cleaned_narrative = narrative
    for pattern in DISALLOWED_ADVICE_PATTERNS:
        cleaned_narrative = re.sub(
            pattern,
            "[informasi dianalisis secara objektif tanpa rekomendasi]",
            cleaned_narrative,
            flags=re.IGNORECASE,
        )
    return cleaned_narrative
