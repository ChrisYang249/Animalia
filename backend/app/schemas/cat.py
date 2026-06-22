from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field

CatStatus = Literal["available", "pending", "adopted"]


class CatBase(BaseModel):
    name: str
    status: CatStatus = "available"


class CatCreate(CatBase):
    pass


class CatUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[CatStatus] = None
    description: Optional[str] = None


class Cat(CatBase):
    id: int
    image: str
    description: Optional[str] = None
    display_order: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
