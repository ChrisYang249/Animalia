from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class ApplicationCreate(BaseModel):
    applicant_name: str = Field(min_length=1)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    visit_date: datetime
    visit_time: str
    liked_cat_ids: Optional[List[int]] = None


class Application(BaseModel):
    id: int
    applicant_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    visit_date: datetime
    visit_time: str
    liked_cat_ids: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
