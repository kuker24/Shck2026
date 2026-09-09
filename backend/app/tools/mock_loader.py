import os
import json
from typing import Any

MOCK_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "mocks")

def load_mock_payload(ticker: str) -> dict[str, Any]:
    ticker_upper = ticker.strip().upper()
    filename = "investigate_bbca.json" if ticker_upper == "BBCA" else "investigate_empty.json"
    filepath = os.path.join(MOCK_DIR, filename)

    if not os.path.exists(filepath):
        # Fallback if file path issues
        alt_path = os.path.join(os.getcwd(), "Aegis-IDX_Build_Pack", "08_DATA_MOCKS", filename)
        if os.path.exists(alt_path):
            filepath = alt_path

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    data["ticker"] = ticker_upper
    return data
