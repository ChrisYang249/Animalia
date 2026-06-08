from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    order_date = Column(DateTime, nullable=False)
    status = Column(String)
    catalog_number = Column(String)
    requestor = Column(String)
    quotation_status = Column(String)
    total_value = Column(Float)
    requisition_id = Column(String)
    vendor = Column(String)
    chartfield = Column(String)
    notes = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by_id = Column(Integer, ForeignKey("users.id"))

    created_by = relationship("User", foreign_keys=[created_by_id])
