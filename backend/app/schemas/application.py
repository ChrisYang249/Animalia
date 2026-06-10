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


class ApplicationBook(BaseModel):
    # Optional override when the free-text visit_time can't be parsed
    start_time: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(default=None, ge=15, le=480)


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
    calendar_event_id: Optional[str] = None
    created_at: datetime
