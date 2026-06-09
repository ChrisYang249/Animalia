from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field

CatStatus = Literal["available", "pending", "adopted"]


class CatBase(BaseModel):
    name: str
    status: CatStatus = "available"


class CatCreate(CatBase):
    pass


class Cat(CatBase):
    id: int
    image: str
    display_order: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
