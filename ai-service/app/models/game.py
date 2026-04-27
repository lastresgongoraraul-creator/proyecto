from sqlalchemy import Column, Integer, BigInteger, String, Float, ARRAY, DateTime
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.models.database import Base

class Game(Base):
    __tablename__ = "games"

    id = Column(BigInteger, primary_key=True, index=True)
    igdb_id = Column(Integer, unique=True, index=True)
    name = Column(String(255), index=True)
    summary = Column(String, nullable=True)
    primary_genre = Column(String(100), nullable=True)
    genres = Column(ARRAY(String(100)), nullable=True)
    platforms = Column(ARRAY(String(255)), nullable=True)
    release_year = Column(Integer, nullable=True)
    cover_url = Column(String(512), nullable=True)
    
    # Metadata fields from backend
    avg_score = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    
    # Embedding column for AI recommendations
    embedding = Column(Vector(384), nullable=True)
    
    # Audit field
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Game(name='{self.name}', year={self.release_year})>"
