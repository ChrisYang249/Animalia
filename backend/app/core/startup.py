import logging

from app.core.config import settings
from app.crud.user import create_user, get_user_by_username
from app.db.base import SessionLocal
from app.models import User

logger = logging.getLogger(__name__)


def ensure_default_admin() -> None:
    """Create the default admin account when the database has no users."""
    if not settings.AUTO_CREATE_ADMIN:
        return

    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return

        if get_user_by_username(db, settings.ADMIN_USERNAME):
            return

        create_user(
            db,
            {
                "email": settings.ADMIN_EMAIL,
                "username": settings.ADMIN_USERNAME,
                "full_name": settings.ADMIN_FULL_NAME,
                "role": "super_admin",
                "password": settings.ADMIN_PASSWORD,
            },
        )
        logger.info("Default admin created (username: %s)", settings.ADMIN_USERNAME)
    except Exception:
        logger.exception("Failed to create default admin user")
    finally:
        db.close()
