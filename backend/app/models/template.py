from sqlalchemy import JSON, Boolean, Column, ForeignKey, Integer, String, Index, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Template(Base):
    __tablename__ = "templates"
    __table_args__ = (
        Index('ix_templates_user_id_is_default', 'user_id', 'is_default'),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    is_default = Column(Boolean, default=False, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    colors = Column(JSON)
    fonts = Column(JSON)
    font_sizes = Column(JSON)
    layout = Column(JSON)
    custom_css = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_onupdate=func.now())
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="templates")
