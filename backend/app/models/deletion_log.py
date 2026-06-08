from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Text
from sqlalchemy.sql import func
from app.models.base import Base


class DeletionLog(Base):
    __tablename__ = "deletion_logs"

    id = Column(Integer, primary_key=True, index=True)
    table_name = Column(String, nullable=False)  # e.g., "products", "users"
    record_id = Column(Integer, nullable=False)  # ID of the deleted record
    deleted_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    deleted_at = Column(DateTime(timezone=True), server_default=func.now())
    record_data = Column(JSON)  # Store the deleted record data
    reason = Column(Text)  # Optional deletion reason
