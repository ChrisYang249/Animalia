from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Animalia Adoptions"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 720

    # Comma-separated origins, e.g. http://localhost:5173,https://animalia.onrender.com
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Persistent disk path on Render, e.g. /var/data/uploads
    UPLOADS_DIR: str = ""

    # First-run admin bootstrap (only when users table is empty)
    AUTO_CREATE_ADMIN: bool = True
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "Admin123!"
    ADMIN_EMAIL: str = "admin@animalia.org"
    ADMIN_FULL_NAME: str = "Admin User"

    # Email (optional — visit request notifications). Leave SMTP_HOST empty to disable.
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""
    SMTP_USE_TLS: bool = True
    # Comma-separated staff inboxes; defaults to ADMIN_EMAIL when unset
    VISIT_REQUEST_NOTIFY_EMAIL: str = ""

    # Google Calendar (optional — visit booking). Leave GOOGLE_REFRESH_TOKEN empty to disable.
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REFRESH_TOKEN: str = ""
    GOOGLE_CALENDAR_ID: str = "primary"
    VISIT_TIMEZONE: str = "Asia/Dubai"
    VISIT_DURATION_MINUTES: int = 60
    # Comma-separated extra invitees added to every visit event (e.g. personal email)
    VISIT_STAFF_ATTENDEES: str = ""

    PASSWORD_MIN_LENGTH: int = 8
    PASSWORD_REQUIRE_UPPERCASE: bool = True
    PASSWORD_REQUIRE_LOWERCASE: bool = True
    PASSWORD_REQUIRE_NUMBERS: bool = True
    PASSWORD_REQUIRE_SPECIAL: bool = True
    MAX_LOGIN_ATTEMPTS: int = 5

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def visit_request_notify_emails(self) -> List[str]:
        raw = self.VISIT_REQUEST_NOTIFY_EMAIL.strip() or self.ADMIN_EMAIL
        return [email.strip() for email in raw.split(",") if email.strip()]

    @property
    def visit_staff_attendees(self) -> List[str]:
        return [email.strip() for email in self.VISIT_STAFF_ATTENDEES.split(",") if email.strip()]


settings = Settings()
