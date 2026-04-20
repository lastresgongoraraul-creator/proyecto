from sqlalchemy import Column, Integer, String, Float, ARRAY, JSON
from pgvector.sqlalchemy import Vector
from app.models.database import Base

class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    igdb_id = Column(Integer, unique=True, index=True)
    name = Column(String, index=True) # Matches renamed 'title' in backend
    summary = Column(String, nullable=True)
    primary_genre = Column(String, nullable=True) # Renamed 'genre' in backend
    genres = Column(ARRAY(String), nullable=True) # Added in V2 migration
    platforms = Column(ARRAY(String), nullable=True)
    release_year = Column(Integer, nullable=True)
    cover_url = Column(String, nullable=True)
    
    # Metadata fields from backend
    avg_score = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    
    # Embedding column for AI recommendations
    embedding = Column(Vector(384), nullable=True)

    def __repr__(self):
        return f"<Game(name='{self.name}', year={self.release_year})>"
