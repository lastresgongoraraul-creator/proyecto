from sqlalchemy import Column, BigInteger, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.models.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id"))
    game_id = Column(BigInteger, ForeignKey("games.id"))
    score = Column(Integer)
    comment = Column(String, nullable=True)
    
    # Semantic embedding of the review comment (384 dimensions)
    embedding = Column(Vector(384), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Review(user_id={self.user_id}, game_id={self.game_id}, score={self.score})>"
