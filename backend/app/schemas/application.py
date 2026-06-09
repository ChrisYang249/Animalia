from typing import Optional, List, Literal
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

ApplicationStatus = Literal["submitted", "reviewed", "contacted"]


class ApplicationCreate(BaseModel):
    applicant_name: str = Field(min_length=1)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    visit_date: datetime
    visit_time: str = Field(min_length=1)
    liked_cat_ids: Optional[List[int]] = None


class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None


class LikedCatSummary(BaseModel):
    id: int
    name: str
    image: str


class ApplicationDetail(BaseModel):
    id: int
    applicant_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    visit_date: datetime
    visit_time: str
    liked_cats: List[LikedCatSummary] = []
    status: str
    created_at: datetime
