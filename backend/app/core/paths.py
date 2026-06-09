from pathlib import Path

from app.core.config import settings

BACKEND_ROOT = Path(__file__).resolve().parents[2]

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024


def get_uploads_dir() -> Path:
    if settings.UPLOADS_DIR:
        return Path(settings.UPLOADS_DIR)
    return BACKEND_ROOT / "uploads"


def get_cats_upload_dir() -> Path:
    return get_uploads_dir() / "cats"


def ensure_upload_dirs() -> Path:
    uploads_dir = get_uploads_dir()
    get_cats_upload_dir().mkdir(parents=True, exist_ok=True)
    return uploads_dir
