#!/usr/bin/env python3
"""Manually create the default admin user (optional — also runs automatically on first startup)."""

import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.startup import ensure_default_admin


def main():
    print("Ensuring default admin user exists...")
    ensure_default_admin()
    print("Done. If the database was empty, admin was created using settings/env values.")


if __name__ == "__main__":
    main()
