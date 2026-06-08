from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class StorageLocationBase(BaseModel):
    freezer: str
    shelf: str
    box: str
    position: Optional[str] = None
    is_available: bool = True
    notes: Optional[str] = None


class StorageLocationCreate(StorageLocationBase):
    pass


class StorageLocationUpdate(BaseModel):
    freezer: Optional[str] = None
    shelf: Optional[str] = None
    box: Optional[str] = None
    position: Optional[str] = None
    is_available: Optional[bool] = None
    notes: Optional[str] = None


class StorageLocation(StorageLocationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
