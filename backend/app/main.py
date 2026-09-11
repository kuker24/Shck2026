from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.v1.investigate import router as investigate_router

app = FastAPI(
    title="Aegis-IDX Investigate API",
    version="1.0.0",
    description="Track 1 investigate endpoint. Modes mock|live|cache. Not investment advice. No trade execution.",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration for Next.js frontend
# CORS for the Next.js frontend. The API is stateless and cookie-free, so
# credentials stay off and only the methods actually used are allowed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

@app.get("/health", tags=["health"])
async def health():
    return {
        "status": "ok",
        "app": "Aegis-IDX",
        "track": "Track 1 - Custom Agent Orchestration",
        "default_mode": settings.DEFAULT_MODE,
    }

@app.get("/", include_in_schema=False)
async def root():
    return {
        "app": "Aegis-IDX",
        "docs": "/docs",
        "investigate_endpoint": "/v1/investigate",
    }

app.include_router(investigate_router)
