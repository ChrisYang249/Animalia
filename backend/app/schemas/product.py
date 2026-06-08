from typing import Optional, List, Literal
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

OrderStatus = Literal["Pending", "Received"]


def _normalize_order_status(v) -> str:
    if v is None or str(v).strip() == "":
        return "Pending"
    normalized = str(v).strip()
    if normalized.lower() == "received":
        return "Received"
    return "Pending"


class ProductBase(BaseModel):
    name: str
    quantity: int = Field(ge=1, le=10)
    order_date: datetime
    status: OrderStatus

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status_input(cls, v):
        return _normalize_order_status(v)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = Field(default=None, ge=1, le=10)
    order_date: Optional[datetime] = None
    status: Optional[OrderStatus] = None

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status_input(cls, v):
        if v is None:
            return v
        return _normalize_order_status(v)


class Product(BaseModel):
    """API response for orders."""

    id: int
    name: str
    quantity: Optional[int] = None
    order_date: datetime
    status: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @field_validator("quantity", mode="before")
    @classmethod
    def coerce_quantity(cls, v):
        if v is None:
            return 1
        return v

    @field_validator("status", mode="before")
    @classmethod
    def coerce_status(cls, v):
        return _normalize_order_status(v)

    class Config:
        from_attributes = True


class ProductList(BaseModel):
    products: List[Product]
    total: int
