from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.admin import router as admin_router
from app.api.routes.stays import router as stays_router
from app.api.routes.bookings import (
    router as bookings_router,
)
from app.api.routes.payments import (
    router as payments_router,
)
from app.api.routes.packages import router as packages_router
from app.api.routes.safaris import router as safaris_router
from app.api.routes.custom_plans import router as custom_plans_router
from app.api.routes.requests import router as requests_router
from app.api.routes.admin_requests import (
    router as admin_requests_router,
)
from app.core.config import settings
from app.core.database import Base, engine

# Import models so SQLAlchemy registers all tables.
from app.models import (
    Booking,
    BookingRequest,
    CustomPlan,
    Payment,
    Review,
    Room,
    RoomAvailability,
    SafariConfig,
    Stay,
    StayImage,
    TourPackage,
    User,
)


# Temporary development table creation.
# We will replace this with Alembic migrations.
Base.metadata.create_all(bind=engine)


# Keep the admin account in sync with ADMIN_EMAIL /
# ADMIN_PASSWORD from .env on every startup: create it if
# missing, update it if the env values changed. This way a
# deployment only needs an .env edit + restart to rotate the
# admin credentials.
try:
    from app.core.database import SessionLocal
    from app.seed import sync_admin_account

    _db = SessionLocal()

    try:
        sync_admin_account(_db)
    finally:
        _db.close()
except Exception as exc:  # noqa: BLE001
    print(f"Admin account sync skipped: {exc}")


app = FastAPI(
    title=settings.APP_NAME,
)


def parse_cors_origins(raw: str) -> list[str]:
    """Parse CORS_ORIGINS - handles JSON arrays, comma-separated, or plain URLs."""
    raw = raw.strip()

    # Strip JSON array brackets if present
    if raw.startswith("[") and raw.endswith("]"):
        raw = raw[1:-1]

    # Split by comma, strip quotes and whitespace from each origin
    origins = []

    for part in raw.split(","):
        origin = part.strip().strip('"').strip("'").strip()

        if origin:
            origins.append(origin)

    return origins


app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_cors_origins(settings.CORS_ORIGINS),
    allow_origin_regex=(
        settings.CORS_ORIGIN_REGEX or None
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(stays_router)
app.include_router(bookings_router)
app.include_router(payments_router)
app.include_router(packages_router)
app.include_router(safaris_router)
app.include_router(custom_plans_router)
app.include_router(requests_router)
app.include_router(admin_requests_router)

# Serve locally uploaded images (property photos uploaded from the
# admin panel). No external image service required.
from pathlib import Path

from fastapi.staticfiles import StaticFiles

Path("uploads").mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/")
def root():
    return {
        "message": "Ankit Travels API is running",
        "version": "1.0.0",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Ankit Travels-api",
    }
