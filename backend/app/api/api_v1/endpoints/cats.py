import uuid
from pathlib import Path
from typing import Any, List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api import deps
from app.core.paths import (
    ALLOWED_IMAGE_TYPES,
    MAX_IMAGE_BYTES,
    ensure_upload_dirs,
    get_cats_upload_dir,
)
from app.models import User, Cat
from app.schemas.cat import Cat as CatSchema, CatUpdate

router = APIRouter()


def _image_url(image_path: str) -> str:
    return f"/uploads/{image_path}"


def _to_schema(cat: Cat) -> dict:
    return {
        "id": cat.id,
        "name": cat.name,
        "image": _image_url(cat.image_path),
        "status": cat.status,
        "description": cat.description,
        "display_order": cat.display_order,
        "created_at": cat.created_at,
        "updated_at": cat.updated_at,
    }


@router.get("/", response_model=List[CatSchema])
def list_available_cats(db: Session = Depends(deps.get_db)) -> Any:
    cats = (
        db.query(Cat)
        .filter(Cat.status == "available")
        .order_by(Cat.display_order, Cat.id)
        .all()
    )
    return [_to_schema(cat) for cat in cats]


@router.get("/all", response_model=List[CatSchema])
def list_all_cats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    cats = db.query(Cat).order_by(Cat.display_order, Cat.id).all()
    return [_to_schema(cat) for cat in cats]


@router.post("/", response_model=CatSchema)
async def create_cat(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    file: UploadFile = File(...),
) -> Any:
    if not file.content_type or file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Image must be JPEG, PNG, or WebP")

    contents = await file.read()
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Image must be 5MB or smaller")
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    ensure_upload_dirs()

    ext = Path(file.filename or "cat.jpg").suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
        ext = ".jpg"

    filename = f"{uuid.uuid4().hex}{ext}"
    dest = get_cats_upload_dir() / filename
    dest.write_bytes(contents)

    max_order = db.query(Cat.display_order).order_by(Cat.display_order.desc()).first()
    next_order = (max_order[0] + 1) if max_order else 0

    cat = Cat(
        name="",
        image_path=f"cats/{filename}",
        status="available",
        display_order=next_order,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return _to_schema(cat)


@router.patch("/{cat_id}", response_model=CatSchema)
def update_cat(
    *,
    db: Session = Depends(deps.get_db),
    cat_id: int,
    cat_in: CatUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    cat = db.query(Cat).filter(Cat.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Cat not found")

    updates = cat_in.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(cat, field, value)

    db.add(cat)
    db.commit()
    db.refresh(cat)
    return _to_schema(cat)


@router.delete("/{cat_id}")
def delete_cat(
    *,
    db: Session = Depends(deps.get_db),
    cat_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    cat = db.query(Cat).filter(Cat.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Cat not found")

    file_path = get_cats_upload_dir() / Path(cat.image_path).name
    if file_path.exists():
        file_path.unlink()

    db.delete(cat)
    db.commit()
    return {"message": "Cat deleted"}
