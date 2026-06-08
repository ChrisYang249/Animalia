from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app.models import User, StorageLocation
from app.schemas.storage import (
    StorageLocation as StorageLocationSchema,
    StorageLocationCreate,
    StorageLocationUpdate,
)

router = APIRouter()


@router.get("/locations", response_model=List[StorageLocationSchema])
def list_storage_locations(
    db: Session = Depends(deps.get_db),
    available_only: bool = Query(False),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    query = db.query(StorageLocation)
    if available_only:
        query = query.filter(StorageLocation.is_available == True)
    return query.order_by(StorageLocation.freezer, StorageLocation.shelf, StorageLocation.box).all()


@router.get("/statistics")
def storage_statistics(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    total_locations = db.query(func.count(StorageLocation.id)).scalar() or 0
    available_locations = (
        db.query(func.count(StorageLocation.id))
        .filter(StorageLocation.is_available == True)
        .scalar()
        or 0
    )
    freezer_count = db.query(func.count(func.distinct(StorageLocation.freezer))).scalar() or 0
    return {
        "total_locations": total_locations,
        "available_locations": available_locations,
        "freezer_count": freezer_count,
    }


@router.post("/locations", response_model=StorageLocationSchema)
def create_storage_location(
    *,
    db: Session = Depends(deps.get_db),
    location_in: StorageLocationCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    location = StorageLocation(**location_in.dict())
    db.add(location)
    db.commit()
    db.refresh(location)
    return location


@router.put("/locations/{location_id}", response_model=StorageLocationSchema)
def update_storage_location(
    *,
    db: Session = Depends(deps.get_db),
    location_id: int,
    location_in: StorageLocationUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    location = db.query(StorageLocation).filter(StorageLocation.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Storage location not found")

    for field, value in location_in.dict(exclude_unset=True).items():
        setattr(location, field, value)

    db.commit()
    db.refresh(location)
    return location


@router.delete("/locations/{location_id}")
def delete_storage_location(
    *,
    db: Session = Depends(deps.get_db),
    location_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    location = db.query(StorageLocation).filter(StorageLocation.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Storage location not found")

    db.delete(location)
    db.commit()
    return {"message": "Storage location deleted"}
