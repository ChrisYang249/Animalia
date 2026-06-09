from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[2]
UPLOADS_DIR = BACKEND_ROOT / "uploads"
CATS_UPLOAD_DIR = UPLOADS_DIR / "cats"

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024


def ensure_upload_dirs() -> None:
    CATS_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
