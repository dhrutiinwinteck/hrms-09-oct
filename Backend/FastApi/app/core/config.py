from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # ============================================================
    # APPLICATION
    # ============================================================

    PROJECT_NAME: str = "HRMS API"

    # ============================================================
    # DATABASE
    # ============================================================

    DATABASE_URL: str

    # ============================================================
    # SECURITY / JWT
    # ============================================================

    SECRET_KEY: str

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # ============================================================
    # TIMEZONE
    # ============================================================

    IST_TIMEZONE: str = "Asia/Kolkata"

    # ============================================================
    # APPLICATION BASE DIRECTORY
    # ============================================================

    BASE_DIR: Path = Path(__file__).resolve().parents[2]

    # ============================================================
    # FRONTEND
    # ============================================================


    FRONTEND_BASE_URL: str = "http://192.168.1.5:5173"

   


    # ============================================================
    # APPLICATION INVITATION
    # ============================================================

    APPLICATION_INVITATION_EXPIRY_DAYS: int = 7

    # ============================================================
    # POLICY FILE STORAGE
    # ============================================================

    POLICY_UPLOAD_DIRECTORY: Path = (
        BASE_DIR
        / "uploads"
        / "policies"
    )

    # ============================================================
    # OFFER LETTER FILE STORAGE
    # ============================================================

    OFFER_LETTER_UPLOAD_DIRECTORY: Path = (
        BASE_DIR
        / "uploads"
        / "offer-letters"
    )

    # ============================================================
    # LETTER OF INTENT FILE STORAGE
    # ============================================================

    LETTER_OF_INTENT_UPLOAD_DIRECTORY: Path = (
        BASE_DIR
        / "uploads"
        / "letter-of-intent"
    )

    # ============================================================
    # EMAIL / SMTP
    #
    # These names are used by the Policy module's email service.
    # Keep them in addition to the existing MAIL_* configuration
    # to maintain compatibility with the rest of the application.
    # ============================================================

    MAIL_HOST: str = "smtp.gmail.com"

    MAIL_PORT: int = 587

    MAIL_USERNAME: str

    MAIL_PASSWORD: str

    MAIL_FROM: str

    MAIL_FROM_NAME: str = "HRMS"

    MAIL_USE_TLS: bool = True

    MAIL_USE_SSL: bool = False

    # ============================================================
    # EXISTING EMAIL CONFIGURATION
    #
    # Kept for compatibility with existing HRMS email services.
    # ============================================================

    MAIL_SERVER: str = "smtp.gmail.com"

    MAIL_STARTTLS: bool = True

    MAIL_SSL_TLS: bool = False

    # ============================================================
    # ATTENDANCE LOCATION
    # ============================================================

    OFFICE_LATITUDE: float

    OFFICE_LONGITUDE: float

    OFFICE_RADIUS_METERS: float = 100.0

    MAX_GPS_ACCURACY_METERS: float = 100.0

    # ============================================================
    # GOOGLE MAPS / GEOCODING
    # ============================================================

    GOOGLE_MAPS_API_KEY: str

    GOOGLE_GEOCODING_ENABLED: bool = True

    # ============================================================
    # PYDANTIC SETTINGS
    # ============================================================

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


# ================================================================
# GLOBAL SETTINGS INSTANCE
# ================================================================

settings = Settings()