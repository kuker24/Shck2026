import time
from typing import Any, Optional

class CacheStore:
    _cache: dict[str, dict[str, Any]] = {}
    _timestamps: dict[str, float] = {}
    DEFAULT_TTL: float = 3600.0  # 1 hour

    @classmethod
    def get(cls, ticker: str) -> Optional[dict[str, Any]]:
        key = ticker.upper()
        if key in cls._cache:
            ts = cls._timestamps.get(key, 0)
            if time.time() - ts < cls.DEFAULT_TTL:
                return cls._cache[key]
        return None

    @classmethod
    def put(cls, ticker: str, payload: dict[str, Any]):
        key = ticker.upper()
        cls._cache[key] = payload
        cls._timestamps[key] = time.time()

def cache_get(ticker: str) -> Optional[dict[str, Any]]:
    return CacheStore.get(ticker)

def cache_put(ticker: str, payload: dict[str, Any]):
    CacheStore.put(ticker, payload)
