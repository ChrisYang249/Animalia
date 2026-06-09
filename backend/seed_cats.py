#!/usr/bin/env python3
"""Seed cats table from frontend/public/cats images (run once)."""

import shutil
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.db.base import SessionLocal
from app.models.cat import Cat
from app.core.paths import CATS_UPLOAD_DIR, ensure_upload_dirs

SEED_CATS = [
    (1, "Lulu"), (2, "Tiggy"), (3, "Mango"), (4, "Jimmy"), (5, "Simba"),
    (6, "Biscuit"), (7, "Shadow"), (8, "Mochi"), (9, "Pepper"), (10, "Oreo"),
    (11, "Ginger"), (12, "Luna"), (13, "Charlie"), (14, "Willow"), (15, "Max"),
    (16, "Cleo"), (17, "Felix"), (18, "Daisy"), (19, "Rocky"), (20, "Nala"),
    (21, "Boots"), (22, "Honey"), (23, "Smokey"), (24, "Patches"), (25, "Leo"),
]

PUBLIC_CATS_DIR = Path(__file__).parent.parent / "frontend" / "public" / "cats"


def main():
    ensure_upload_dirs()
    db = SessionLocal()
    try:
        existing = db.query(Cat).count()
        if existing > 0:
            print(f"Skipping seed — {existing} cats already in database.")
            return

        for order, (num, name) in enumerate(SEED_CATS):
            src = PUBLIC_CATS_DIR / f"cat-{num}.jpg"
            if not src.exists():
                print(f"Warning: missing {src}, skipping {name}")
                continue

            dest_name = f"cat-{num}.jpg"
            dest = CATS_UPLOAD_DIR / dest_name
            shutil.copy2(src, dest)

            cat = Cat(
                name=name,
                image_path=f"cats/{dest_name}",
                status="available",
                display_order=order,
            )
            db.add(cat)
            print(f"  + {name}")

        db.commit()
        print(f"Seeded {db.query(Cat).count()} cats.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
