#!/usr/bin/env python3
"""Reset the admin password (creates admin if missing). Uses ADMIN_* env vars."""

import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.core.security import get_password_hash
from app.crud.user import create_user, get_user_by_username
from app.db.base import SessionLocal


def main() -> None:
    db = SessionLocal()
    try:
        user = get_user_by_username(db, settings.ADMIN_USERNAME)
        if user:
            user.hashed_password = get_password_hash(settings.ADMIN_PASSWORD)
            user.is_locked = False
            user.failed_login_attempts = 0
            db.commit()
            print(f"Password reset for user: {settings.ADMIN_USERNAME}")
        else:
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
            print(f"Created admin user: {settings.ADMIN_USERNAME}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
