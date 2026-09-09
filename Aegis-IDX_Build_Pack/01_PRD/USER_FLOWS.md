# User Flows — Aegis-IDX

## Flow A — Happy path (mock / live)

```
[Landing]
   -> User melihat header Aegis-IDX + disclaimer ringkas
   -> Input ticker BBCA
   -> Klik Investigasi
   -> UI set loading; StepsTimeline muncul (Planner)
   -> POST /v1/investigate returns payload
   -> Steps complete (Planner -> Executor tools -> Critic -> Narrative)
   -> BrokerTable: top_buyers | top_sellers
   -> FreeFloatCard
   -> NarrativePanel (Bahasa Indonesia)
   -> DisclaimerBanner fixed
   -> ModeBadge shows mock|live|cache
```

## Flow B — Empty / invalid ticker

```
[Landing]
   -> User submit empty or invalid ticker XXXX
   -> Client validation OR API error mock (investigate_empty.json)
   -> EmptyState: Data tidak ditemukan / ticker tidak valid
   -> No broker tables; CTA Coba ticker lain
```

## Flow C — Cache hit

```
[User re-investigates BBCA with mode=cache]
   -> Backend returns last cached investigate for BBCA
   -> ModeBadge = cache
   -> Same UI as happy path; optional note data dari cache
```

## Flow D — Credits / live failure soft-fail

```
[mode=live, API error or low credits]
   -> Executor/Critic catches failure
   -> Fallback to cache if present else mock
   -> UI toast: Live gagal — menampilkan cache/mock
   -> ModeBadge reflects actual served mode
```

## Flow E — Demo for judges (2-3 minutes)

1. Open FE in mock — show polish and dark fintech UI
2. Run BBCA — show steps animating (Planner, Executor, Critic)
3. Highlight top buyers/sellers + free float cards
4. Read one sentence of narrative; point to disclaimer
5. Optional: one live run — ModeBadge flips to live
6. Close with Track 1 orchestration one-liner
