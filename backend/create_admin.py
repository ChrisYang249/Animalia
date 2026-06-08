#!/usr/bin/env python3
"""Create initial admin user for Animalia staff portal."""

import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.base import SessionLocal
from app.crud.user import create_user, get_user_by_username


def main():
    print("Creating admin user...")

    db = SessionLocal()
    try:
        if get_user_by_username(db, "admin"):
            print("Admin user already exists!")
            return

        user_data = {
            "email": "admin@animalia.org",
            "username": "admin",
            "full_name": "Admin User",
            "role": "super_admin",
            "password": "Admin123!",
        }

        create_user(db, user_data)
        print("Admin user created successfully!")
        print("Username: admin")
        print("Password: Admin123!")
        print("Email: admin@animalia.org")
        print("\nPlease change the password after first login!")
    except Exception as e:
        print(f"Error creating user: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
