# Aegis-IDX — Investigasi Aliran Broker IDX

**Sectors Hackathon 2026 — Track 1: Custom Agent Orchestration**  
- **Builder:** Solo — Fahmi  
- **Kode Undangan Tim:** `SKT7-R2C4`  
- **Alokasi Kredit:** 1.000 Kredit Sectors  
- **Batas Waktu:** 30 September 2026  

---

## 1. Problem Statement & Solusi

Investor ritel di Bursa Efek Indonesia (IDX) seringkali memantau lonjakan atau penurunan harga saham tanpa visibilitas cepat mengenai **siapa yang menggerakkan volume** (akumulasi vs distribusi) serta berapa rasio saham beredar di publik (*free float*). Informasi broker summary mentah sangat terfragmentasi dan tidak memberikan narasi investigasi terstruktur.

**Aegis-IDX** hadir sebagai agen investigasi *read-only* dengan orkestrasi **Planner → Executor → Critic**:
1. Mengambil kode ticker IDX (misal `BBCA`).
2. Menjalankan siklus agen berlapis untuk menghimpun data broker top buyers/sellers dan free float.
3. Menyusun narasi investigasi faktual berbahasa Indonesia yang objektif tanpa indikasi ajakan investasi.
4. Menyematkan *disclaimer* hukum non-dismissible secara permanen pada setiap hasil investigasi.

> **Strict Non-Goals:**
> - Bukan penasihat investasi (*no investment advice / no price targets*).
> - Tidak menyediakan fitur trading otomatis (*no auto-trade / no order execution*).
> - Bukan sekadar wrapper MCP tipis (*custom multi-role agent loop*).

---

## 2. Arsitektur Sistem (Track 1)

```
+------------------+         POST /v1/investigate         +---------------------------+
|   Next.js FE     |  ticker + mode (mock|live|cache)     |      FastAPI Backend      |
|  (TS + Tailwind) | -----------------------------------> | (Planner-Executor-Critic) |
|                  | <----------------------------------- |                           |
|  • ModeBadge     |     steps, brokers, free_float,      |  • Tool Allowlist         |
|  • StepsTimeline |     narrative, disclaimer, mode      |  • TRK Security Model     |
|  • BrokerTable   |                                      |  • Response Cache Store   |
|  • FreeFloatCard |                                      +-------------+-------------+
|  • Narrative     |                                                    |
|  • Disclaimer    |                                                    | live mode
+------------------+                                                    v
                                                          +---------------------------+
                                                          |     Sectors API (IDX)     |
                                                          |  • broker-summary/top     |
                                                          |  • free-float             |
                                                          +---------------------------+
```

### Siklus Peran Agen (Planner → Executor → Critic)
1. **Planner (`agent/planner.py`):**
   - Menganalisis kebutuhan data berdasarkan ticker dan mode.
   - Merancang rencana langkah investigasi secara hemat kredit.
   - Membatasi alat yang dipanggil hanya pada daftar *Tool Allowlist*.
2. **Executor (`agent/executor.py`):**
   - Menegakkan keamanan allowlist sebelum mengeksekusi alat.
   - Menjalankan alat: `fetch_broker_summary_top`, `fetch_free_float`, `draft_narrative`, `load_mock_payload`, `cache_get`, `cache_put`.
   - Menghitung latensi dan estimasi konsumsi kredit.
3. **Critic (`agent/critic.py`):**
   - Meninjau kelengkapan observasi data.
   - Menyaring dan membuang kata-kata spekulatif/rekomendasi beli/jual (*anti-advice guardrail*).
   - Menjalankan paling banyak 1 kali *refinement step* jika diperlukan.
   - Menyematkan disclaimer hukum baku secara wajib.

### Model Keamanan TRK (Guardrail, Audit, Governor)
- **Guardrail:** Sanitasi ticker (alfanumerik 2–10 karakter) dan penolakan keras terhadap alat di luar allowlist (`ToolNotAllowedError`).
- **Audit:** Pencatatan log terstruktur JSON (`audit.jsonl` dan stdout) per request yang mencakup ticker, requested_mode, served_mode, tools_run, credit_estimate, dan latency_ms.
- **Governor:** Proteksi kredit Sectors (maksimal 1 panggilan broker top ~2 kredit per request), *rate limit cooldown* per ticker (15 detik), serta *soft-fail fallback* (jika live gagal, otomatis beralih ke cache/mock).

---

## 3. Disiplin Kredit (1.000 Kredit)

| Mode | Konsumsi Kredit Sectors | Keterangan |
|------|-------------------------|------------|
| `mock` | **0 kredit** | Menggunakan dataset rich mock BBCA & empty state untuk demo dan pengembangan FE. |
| `cache` | **0 kredit** | Mengambil hasil investigasi tersimpan dari memori/cache lokal. |
| `live` | **~2 kredit** | Memanggil Sectors API endpoint `broker-summary/top` + `free-float`. Dibatasi oleh Governor. |

---

## 4. Panduan Menjalankan Proyek

### A. Menjalankan Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

*Secara bawaan, frontend berjalan dalam **Mock Mode** sehingga dapat didemokan tanpa memerlukan backend hidup atau menghabiskan kredit API.*

### B. Menjalankan Backend (FastAPI)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt   # atau pip install fastapi "uvicorn[standard]" pydantic httpx python-dotenv

# Jalankan server
uvicorn app.main:app --reload --port 8000
```
- API Health Check: [http://localhost:8000/health](http://localhost:8000/health)
- Dokumentasi Interaktif OpenAPI: [http://localhost:8000/docs](http://localhost:8000/docs)

### C. Menjalankan Unit Test Backend
```bash
cd backend
.venv/bin/python -m unittest discover -s tests
```

---

## 5. Struktur Direktori Proyek

```
.
├── Aegis-IDX_Build_Pack/       # Spesifikasi asli, kontrak API, PRD, dan mockup
│   ├── 01_PRD/
│   ├── 02_ARCHITECTURE/
│   ├── 03_API_CONTRACTS/
│   ├── 04_FRONTEND_SPEC/
│   ├── 05_BACKEND_SPEC/
│   ├── 07_DESIGN/
│   ├── 08_DATA_MOCKS/
│   └── 09_SUBMIT_HACKATHON/
├── frontend/                   # Next.js App Router + TypeScript + Tailwind
│   ├── src/
│   │   ├── app/                # Layout, globals.css, and main page
│   │   ├── components/         # TickerSearch, ModeBadge, StepsTimeline, BrokerTable, etc.
│   │   ├── constants/          # COPY ID (Bahasa Indonesia)
│   │   ├── data/mocks/         # Rich mock BBCA & Empty mock
│   │   ├── lib/                # Formatters (Rupiah, dates, numbers)
│   │   ├── services/           # Investigate service & step simulator
│   │   └── types/              # OpenAPI TypeScript interfaces
│   ├── .env.example
│   └── package.json
└── backend/                    # FastAPI Backend Planner-Executor-Critic
    ├── app/
    │   ├── agent/              # Planner, Executor, Critic, Loop
    │   ├── api/v1/             # POST /v1/investigate endpoint
    │   ├── core/               # App configuration & settings
    │   ├── models/             # Pydantic v2 schemas
    │   ├── security/           # Guardrail, Audit, Governor
    │   ├── tools/              # Allowlist, Sectors adapters, Narrative, Cache, Mock loader
    │   └── main.py             # FastAPI entry point & CORS
    ├── tests/                  # Unit and integration test suite
    ├── .env.example
    └── README.md
```

---

## 6. Verifikasi Kriteria Selesai (Definition of Done)

### Frontend DoD
- [x] Next.js + TypeScript + Tailwind app berjalan lancar (`npm run dev` & `npm run build`).
- [x] Desain token fintech gelap (`#0B1220`, `#121A2B`, `#2A3650`, aksen `#3B82F6`, `#22C55E`, `#EF4444`).
- [x] Input ticker + tombol **Investigasi** responsif dengan validasi.
- [x] Mock investigasi BBCA merender: 4 tahapan steps, top buyers, top sellers, free float, narasi, dan disclaimer.
- [x] Status kosong / invalid ticker merender empty state elegan (`investigate_empty.json`).
- [x] `ModeBadge` menampilkan status mode (`mock` default, `live`, `cache`).
- [x] Disclaimer hukum non-dismissible selalu tampak di layar hasil.
- [x] Mikro-teks Bahasa Indonesia konsisten dengan `COPY_ID.md`.
- [x] Responsif pada desktop (1280px) dan mobile (390px).
- [x] Tidak ada API key Sectors di sisi browser/client.

### Backend DoD
- [x] FastAPI melayani `POST /v1/investigate` sesuai kontrak OpenAPI 3.0.3.
- [x] `mode=mock` mengembalikan payload skema lengkap tanpa memanggil Sectors.
- [x] `mode=live` hanya menggunakan alat allowlist dengan orkestrasi Planner–Executor–Critic.
- [x] `mode=cache` menyajikan payload tersimpan dengan efisiensi kredit 0.
- [x] Response selalu memuat teks disclaimer dan mode aktual yang dilayani.
- [x] Critic memfilter dan menolak bahasa ajakan/rekomendasi beli atau jual.
- [x] Tool allowlist ditegakkan; alat tidak dikenal memicu `ToolNotAllowedError`.
- [x] Estimasi kredit dicatat secara terstruktur pada log audit (`audit.jsonl`).
- [x] File `.env.example` terdokumentasi tanpa ada kebocoran kunci rahasia.
- [x] Konfigurasi CORS aktif untuk origin frontend lokal.
- [x] Dokumentasi OpenAPI aktif dan dapat diakses di `/docs`.

---

*Aegis-IDX — investigasi aliran broker IDX, bukan saran investasi.*
