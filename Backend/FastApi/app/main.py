from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.presentation.api.v1.router import api_router


app = FastAPI(
    title=settings.PROJECT_NAME,
)

# ============================================================
# STATIC UPLOADS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOADS_DIR)),
    name="uploads",
)

# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        "http://192.168.48.1:5173",

        "http://192.168.1.5:5173",

        settings.FRONTEND_BASE_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API ROUTES
# ============================================================

app.include_router(
    api_router,
    prefix="/api/v1",
)



# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "HRMS API is running successfully"
    }