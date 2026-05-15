from sqlalchemy import Column, BigInteger, String, DateTime
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.models.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True)
    role = Column(String(20))
    
    # Embedding for social taste profile (384 dimensions)
    embedding = Column(Vector(384), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<User(username='{self.username}', role='{self.role}')>"
