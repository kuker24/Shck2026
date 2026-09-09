import os
import json
import time
from datetime import datetime, timezone
from typing import Any, Optional

AUDIT_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "audit.jsonl")

def mask_secrets(text: str) -> str:
    """Mask any potentially sensitive API key or token substrings."""
    if not text:
        return ""
    # Mask strings that look like secrets (e.g., sk-..., sec-...)
    import re
    return re.sub(r"(key|secret|token|auth)=([a-zA-Z0-9_\-\.]{4})[a-zA-Z0-9_\-\.]+", r"\1=\2****", text, flags=re.IGNORECASE)

class AuditLogger:
    @staticmethod
    def log_investigation(
        ticker: str,
        requested_mode: str,
        served_mode: str,
        tools_run: list[str],
        credit_estimate: float,
        latency_ms: float,
        error: Optional[str] = None,
        extra: Optional[dict[str, Any]] = None,
    ):
        record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "ticker": ticker,
            "requested_mode": requested_mode,
            "served_mode": served_mode,
            "tools_run": tools_run,
            "credit_estimate": credit_estimate,
            "latency_ms": round(latency_ms, 2),
            "error": error,
            "extra": extra or {},
        }

        # Print structured JSON log for observability
        print(f"[AUDIT] {json.dumps(record)}")

        # Persist to local JSONL
        try:
            os.makedirs(os.path.dirname(AUDIT_FILE_PATH), exist_ok=True)
            with open(AUDIT_FILE_PATH, "a", encoding="utf-8") as f:
                f.write(json.dumps(record) + "\n")
        except Exception as e:
            print(f"[AUDIT_WARN] Could not write audit log file: {e}")
