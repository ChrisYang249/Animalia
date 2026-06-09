import json
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models import User, Cat, AdoptionApplication
from app.schemas.application import (
    ApplicationCreate,
    ApplicationDetail,
    ApplicationUpdate,
)

router = APIRouter()

ALLOWED_STATUSES = {"submitted", "reviewed", "contacted"}


def _image_url(image_path: str) -> str:
    return f"/uploads/{image_path}"


def _parse_liked_ids(raw: Optional[str]) -> List[int]:
    if not raw:
        return []
    try:
        ids = json.loads(raw)
        return [int(i) for i in ids]
    except (json.JSONDecodeError, TypeError, ValueError):
        return []


def _to_detail(db: Session, application: AdoptionApplication) -> dict:
    liked_ids = _parse_liked_ids(application.liked_cat_ids)
    liked_cats = []
    if liked_ids:
        cats = db.query(Cat).filter(Cat.id.in_(liked_ids)).all()
        cat_map = {cat.id: cat for cat in cats}
        for cat_id in liked_ids:
            cat = cat_map.get(cat_id)
            if cat:
                liked_cats.append(
                    {
                        "id": cat.id,
                        "name": cat.name,
                        "image": _image_url(cat.image_path),
                    }
                )

    return {
        "id": application.id,
        "applicant_name": application.applicant_name,
        "email": application.email,
        "phone": application.phone,
        "visit_date": application.visit_date,
        "visit_time": application.visit_time,
        "liked_cats": liked_cats,
        "status": application.status,
        "created_at": application.created_at,
    }


@router.get("/", response_model=List[ApplicationDetail])
def list_applications(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    applications = (
        db.query(AdoptionApplication)
        .order_by(AdoptionApplication.created_at.desc())
        .all()
    )
    return [_to_detail(db, app) for app in applications]


@router.post("/", response_model=ApplicationDetail)
def create_application(
    *,
    db: Session = Depends(deps.get_db),
    application_in: ApplicationCreate,
) -> Any:
    visit_time = application_in.visit_time.strip()
    if not visit_time:
        raise HTTPException(status_code=400, detail="Visit time is required")

    liked_json = None
    if application_in.liked_cat_ids:
        liked_json = json.dumps(application_in.liked_cat_ids)

    application = AdoptionApplication(
        applicant_name=application_in.applicant_name.strip(),
        email=application_in.email,
        phone=application_in.phone,
        visit_date=application_in.visit_date,
        visit_time=visit_time,
        liked_cat_ids=liked_json,
        status="submitted",
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return _to_detail(db, application)


@router.patch("/{application_id}", response_model=ApplicationDetail)
def update_application(
    *,
    db: Session = Depends(deps.get_db),
    application_id: int,
    application_in: ApplicationUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    application = db.query(AdoptionApplication).filter(AdoptionApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Visit request not found")

    if application_in.status is not None:
        if application_in.status not in ALLOWED_STATUSES:
            raise HTTPException(status_code=400, detail="Invalid status")
        application.status = application_in.status

    db.add(application)
    db.commit()
    db.refresh(application)
    return _to_detail(db, application)


@router.delete("/{application_id}")
def delete_application(
    *,
    db: Session = Depends(deps.get_db),
    application_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    application = db.query(AdoptionApplication).filter(AdoptionApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Visit request not found")

    db.delete(application)
    db.commit()
    return {"message": "Visit request deleted"}
