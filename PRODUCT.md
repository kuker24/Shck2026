# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Retail investors di IDX (Bursa Efek Indonesia) yang ingin melihat dan memahami aktivitas broker (top buyers / top sellers) dan free float emiten tanpa tersesat dalam spreadsheet rumit atau noise spekulatif.

## Product Purpose

Aegis-IDX adalah agen investigasi pasar modal berbasis orkestrasi Planner–Executor–Critic untuk memeriksa konsentrasi broker dan struktur kepemilikan free float saham IDX secara transparan, netral, dan mendidik (non-advice).

## Positioning

Bukan robot trading, bukan sinyal beli/jual, bukan auto-trade. Aegis-IDX adalah investigasi read-only dengan audit trail multi-langkah yang dapat ditelusuri dan diverifikasi.

## Operating Context

Web browser desktop dan mobile yang beroperasi berdampingan dengan aplikasi charting atau terminal trading pengguna. Menampilkan timeline proses Planner–Executor–Critic, matriks konsentrasi broker, dan kartu rasio kepemilikan.

## Capabilities and Constraints

- Mengambil broker summary (top buyers/sellers) dan profil emiten/free float dari Sectors Financial API.
- Menjalankan loop investigasi Planner -> Executor -> Critic dengan penanganan fallback cerdas (mock/live/cache).
- Menyusun ringkasan narasi netral dalam Bahasa Indonesia dengan disclaimer kepatuhan finansial tetap terlihat di setiap tampilan.
- Read-only; tidak mengeksekusi order transaksi saham apa pun.

## Brand Commitments

- Nama: Aegis-IDX
- Persona visual: Dark fintech bertema Slash (Obsidian, Bone, Copper accent, Trade buy green, Trade sell red)
- Tone: Tenang, presisi, analitis, akuntabel, bebas sensasionalisme.

## Evidence on Hand

- `Aegis-IDX_Build_Pack/00_CONTEXT/PRODUCT_ONEPAGER.md`
- `Aegis-IDX_Build_Pack/07_DESIGN/DESIGN_TOKENS.md`
- Sectors API integration docs & live backend on port 8000

## Product Principles

1. Bukti mendahului narasi: Setiap analisis didukung data broker dan rasio yang terverifikasi.
2. Netral dan patuh: Menolak memberi rekomendasi beli/jual; selalu menyertakan disclaimer.
3. Transparansi proses: Menampilkan setiap langkah Planner–Executor–Critic ke pengguna.
4. Integritas data: Rasio konsentrasi yang disajikan secara akurat sesuai data yang tersedia.
