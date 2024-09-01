from sqlalchemy import JSON, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..database import Base


class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, unique=True, index=True)
    content = Column(JSON)
    font_family = Column(String)
    font_size = Column(Integer)
    primary_color = Column(String)
    secondary_color = Column(String)
    logo_url = Column(String, nullable=True)
    custom_css = Column(String, nullable=True)

    user = relationship("User", back_populates="templates")