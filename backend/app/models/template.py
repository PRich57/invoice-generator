from sqlalchemy import JSON, Column, ForeignKey, Integer, String, Boolean
from sqlalchemy.orm import relationship

from ..database import Base


class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    is_default = Column(Boolean, default=False, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    colors = Column(JSON)
    fonts = Column(JSON)
    font_sizes = Column(JSON)
    layout = Column(JSON)
    custom_css = Column(String, nullable=True)

    user = relationship("User", back_populates="templates")