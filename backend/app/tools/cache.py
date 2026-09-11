import copy
import time
from typing import Any, Optional

class CacheStore:
    _cache: dict[str, dict[str, Any]] = {}
    _timestamps: dict[str, float] = {}
    DEFAULT_TTL: float = 3600.0  # 1 hour
    MAX_ENTRIES: int = 256

    @classmethod
    def _evict_expired(cls) -> None:
        now = time.time()
        stale = [
            key
            for key, ts in cls._timestamps.items()
            if now - ts >= cls.DEFAULT_TTL
        ]
        for key in stale:
            cls._cache.pop(key, None)
            cls._timestamps.pop(key, None)

    @classmethod
    def get(cls, ticker: str) -> Optional[dict[str, Any]]:
        key = ticker.upper()
        if key in cls._cache:
            ts = cls._timestamps.get(key, 0)
            if time.time() - ts < cls.DEFAULT_TTL:
                # Deep copy so callers cannot mutate the stored record (e.g. mode).
                return copy.deepcopy(cls._cache[key])
            cls._cache.pop(key, None)
            cls._timestamps.pop(key, None)
        return None

    @classmethod
    def put(cls, ticker: str, payload: dict[str, Any]):
        cls._evict_expired()
        key = ticker.upper()
        if key not in cls._cache and len(cls._cache) >= cls.MAX_ENTRIES:
            # Bounded store: drop the oldest entry before inserting a new ticker.
            oldest = min(cls._timestamps, key=cls._timestamps.get)  # type: ignore[arg-type]
            cls._cache.pop(oldest, None)
            cls._timestamps.pop(oldest, None)
        cls._cache[key] = copy.deepcopy(payload)
        cls._timestamps[key] = time.time()

def cache_get(ticker: str) -> Optional[dict[str, Any]]:
    return CacheStore.get(ticker)

def cache_put(ticker: str, payload: dict[str, Any]):
    CacheStore.put(ticker, payload)
