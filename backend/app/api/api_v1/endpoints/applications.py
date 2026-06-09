import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.application import AdoptionApplication
from app.schemas.application import ApplicationCreate, Application as ApplicationSchema

router = APIRouter()

VISIT_TIME_SLOTS = {"10:00 AM", "2:00 PM", "4:00 PM"}


@router.post("/", response_model=ApplicationSchema)
def create_application(
    *,
    db: Session = Depends(deps.get_db),
    application_in: ApplicationCreate,
) -> Any:
    if application_in.visit_time not in VISIT_TIME_SLOTS:
        raise HTTPException(status_code=400, detail="Invalid visit time slot")

    liked_json = None
    if application_in.liked_cat_ids:
        liked_json = json.dumps(application_in.liked_cat_ids)

    application = AdoptionApplication(
        applicant_name=application_in.applicant_name.strip(),
        email=application_in.email,
        phone=application_in.phone,
        visit_date=application_in.visit_date,
        visit_time=application_in.visit_time,
        liked_cat_ids=liked_json,
        status="submitted",
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application
