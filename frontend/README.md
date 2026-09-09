# Aegis-IDX — Frontend (Track 1 Sectors Hackathon)

Frontend aplikasi investigasi aliran broker IDX dengan visualisasi orkestrasi agen **Planner → Executor → Critic**.

## Panduan Alur Mock-First (Mandatori)

Sesuai spesifikasi hackathon dan disiplin kredit Sectors (budget 1.000 kredit):
1. **Mode Mock (Default):** Seluruh pengembangan UI dan demo awal berjalan 100% menggunakan data tiruan (`08_DATA_MOCKS/investigate_bbca.json` dan `investigate_empty.json`) tanpa mengonsumsi kredit Sectors API (0 kredit).
2. **Tanpa Kunci API di Browser:** Browser tidak pernah menyimpan atau memanggil `SECTORS_API_KEY`. Seluruh pemanggilan live diisolasi di backend FastAPI.
3. **Animasi Langkah Terprogram:** Simulasi pergantian status peran Planner, Executor, dan Critic divisualisasikan secara real-time pada komponen `StepsTimeline`.

## Cara Menjalankan Frontend

### Prasyarat
- Node.js v18+ (atau v20+)
- npm

### Menjalankan Development Server
```bash
cd frontend
npm install
npm run dev
```

Buka peramban di [http://localhost:3000](http://localhost:3000).

### Membangun Versi Produksi
```bash
npm run build
npm run start
```

### Konfigurasi Lingkungan (Opsional)
Jika backend FastAPI telah berjalan di port 8000:
Buat file `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
Jika variabel ini tidak disetel, frontend secara otomatis dan mulus beralih ke local mock runner.

## Fitur Utama Frontend
- **Ticker Search & Validation:** Mendukung kode ticker IDX (contoh `BBCA`), validasi format dan quick pills demo.
- **Mode Badge:** Menampilkan dan mengalihkan status mode (`mock` / `live` / `cache`) serta estimasi kredit.
- **Steps Timeline:** Menampilkan 4 tahapan orkestrasi agen:
  1. Planner: Merencanakan investigasi
  2. Executor Broker: Mengambil ringkasan broker (top)
  3. Executor Free Float: Mengambil data free float
  4. Critic: Meninjau kepatuhan objektivitas & memasang disclaimer
- **Broker Table:** Tabel komparasi Top Buyers & Top Sellers dengan kode sekuritas, nama broker, dan net value terformat Rupiah.
- **Free Float Card:** Metrik persentase kepemilikan publik dan total lembar saham.
- **Narrative Panel:** Narasi investigasi faktual berbahasa Indonesia yang telah melalui peninjauan Critic.
- **Disclaimer Banner:** Peringatan kepatuhan hukum non-dismissible yang selalu tampil permanen.
- **Empty State:** Penanganan ticker tidak valid (`XXXX`) secara elegan dengan alur rekomendasi reset.
