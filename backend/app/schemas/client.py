from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime


class ClientBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class ClientInDBBase(ClientBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    @field_validator("email", mode="before")
    @classmethod
    def empty_email_to_none(cls, v):
        return v or None

    class Config:
        from_attributes = True


class Client(ClientInDBBase):
    pass
