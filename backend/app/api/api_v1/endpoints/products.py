from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.models import Product, User, DeletionLog
from app.schemas.product import ProductCreate, ProductUpdate, Product as ProductSchema

router = APIRouter()

ALLOWED_STATUSES = {"Pending", "Received"}


@router.get("/", response_model=List[ProductSchema])
def get_products(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    products = db.query(Product).order_by(Product.order_date.desc()).offset(skip).limit(limit).all()
    return products


@router.post("/", response_model=ProductSchema)
def create_product(
    *,
    db: Session = Depends(deps.get_db),
    product_in: ProductCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    if product_in.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail="Status must be Pending or Received")

    product = Product(
        name=product_in.name.strip(),
        quantity=product_in.quantity,
        order_date=product_in.order_date,
        status=product_in.status,
        created_by_id=current_user.id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/{product_id}", response_model=ProductSchema)
def get_product(
    *,
    db: Session = Depends(deps.get_db),
    product_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Order not found")
    return product


@router.put("/{product_id}", response_model=ProductSchema)
def update_product(
    *,
    db: Session = Depends(deps.get_db),
    product_id: int,
    product_in: ProductUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Order not found")

    update_data = product_in.dict(exclude_unset=True)
    if "status" in update_data and update_data["status"] not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail="Status must be Pending or Received")
    if "name" in update_data:
        update_data["name"] = update_data["name"].strip()

    for field, value in update_data.items():
        setattr(product, field, value)

    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(
    *,
    db: Session = Depends(deps.get_db),
    product_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Order not found")

    deletion_log = DeletionLog(
        table_name="products",
        record_id=product_id,
        deleted_by_id=current_user.id,
        record_data={
            "name": product.name,
            "quantity": product.quantity,
            "status": product.status,
            "order_date": product.order_date.isoformat() if product.order_date else None,
        },
    )
    db.add(deletion_log)

    db.delete(product)
    db.commit()
    return {"message": "Order deleted successfully"}


@router.get("/enums/statuses")
def get_statuses() -> Any:
    return [
        {"value": "Pending", "label": "Pending"},
        {"value": "Received", "label": "Received"},
    ]
