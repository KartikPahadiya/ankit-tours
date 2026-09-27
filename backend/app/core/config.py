from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Ankit Travels API"

    # Database
    DATABASE_URL: str

    # JWT
    JWT_SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    # Razorpay
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    RAZORPAY_WEBHOOK_SECRET: str

    # Booking
    BOOKING_HOLD_MINUTES: int = 10

    # Email
    EMAIL_PROVIDER: str = "smtp"
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = ""

    # WhatsApp Cloud API
    WHATSAPP_ENABLED: bool = False
    WHATSAPP_ACCESS_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_API_VERSION: str = "v23.0"
    WHATSAPP_TEMPLATE_NAME: str = "booking_confirmation"
    WHATSAPP_TEMPLATE_LANGUAGE: str = "en"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()