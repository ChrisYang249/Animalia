from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from app.api import deps
from app.models import User, Product, Client, StorageLocation

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    total_clients = db.query(func.count(Client.id)).scalar() or 0
    total_orders = db.query(func.count(Product.id)).scalar() or 0

    pending_orders = (
        db.query(func.count(Product.id))
        .filter(Product.status == "Pending")
        .scalar()
        or 0
    )

    current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    completed_this_month = (
        db.query(func.count(Product.id))
        .filter(Product.status == "Received", Product.updated_at >= current_month_start)
        .scalar()
        or 0
    )

    storage_locations = db.query(func.count(StorageLocation.id)).scalar() or 0

    return {
        "total_clients": total_clients,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "completed_this_month": completed_this_month,
        "storage_locations": storage_locations,
    }
