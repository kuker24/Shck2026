# Aegis-IDX Backend (FastAPI)

FastAPI backend service untuk Aegis-IDX mengimplementasikan orkestrasi agen **Planner → Executor → Critic** sesuai kontrak OpenAPI 3.0.3 untuk Sectors Hackathon Track 1.

## Setup & Instalasi

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Konfigurasi Lingkungan

Salin `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Isi `SECTORS_API_KEY` jika ingin mencoba pemanggilan live ke Sectors API. Untuk pengujian mock, API key tidak diperlukan.

## Menjalankan Server
```bash
uvicorn app.main:app --reload --port 8000
```

- Endpoint Dokumentasi Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)
- Endpoint Health Check: [http://localhost:8000/health](http://localhost:8000/health)
- Endpoint Investigasi: `POST http://localhost:8000/v1/investigate`

## Menjalankan Pengujian Unit
```bash
python -m unittest discover -s tests
```
