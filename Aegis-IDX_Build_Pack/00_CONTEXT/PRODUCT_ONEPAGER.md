# Aegis-IDX — Product One-Pager

## Problem

Retail investors di IDX sering melihat harga naik/turun tanpa memahami **siapa yang belanja** di balik pergerakan. Data broker summary dan free float tersebar, sulit dibaca cepat, dan raw API tidak menjelaskan narasi “apa yang terjadi hari ini pada ticker X”.

## Solution

**Aegis-IDX** adalah agen investigasi read-only yang:

1. Menerima ticker IDX (contoh: `BBCA`).
2. Menjalankan loop **Planner → Executor → Critic**.
3. Mengambil broker top buyers/sellers + free float (Sectors API).
4. Menyusun **langkah investigasi + narasi singkat + disclaimer**.
5. Menampilkan hasil di UI gelap fintech (Next.js), dengan mode `mock` / `live` / `cache`.

Bukan robot trading. Bukan saran beli/jual. Hanya **investigasi aliran broker** untuk konteks.

## Happy path

1. User buka dashboard Aegis-IDX.
2. Ketik `BBCA` → klik **Investigasi**.
3. UI tampilkan progress steps (plan → fetch broker → fetch free float → critique → narrative).
4. Panel hasil: top buyers, top sellers, free float snapshot, narasi Bahasa Indonesia, disclaimer tetap terlihat.
5. Mode badge: `mock` saat development; `live` saat demo dengan kredit; `cache` jika ulang ticker yang sama.

## Positioning one-liner

> Aegis-IDX — agen investigasi aliran broker IDX dengan orkestrasi Planner–Executor–Critic, bukan advice dan bukan auto-trade.

## Success for hackathon

- FE demo memukau dalam 2 menit (video + live).
- Orchestration terlihat (steps di response & UI).
- Credits tidak habis sebelum submit.
- Disclaimer & non-advice stance jelas di setiap layar hasil.
