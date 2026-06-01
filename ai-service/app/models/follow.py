from sqlalchemy import Column, BigInteger, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.models.database import Base

class Follow(Base):
    __tablename__ = "follows"

    id = Column(BigInteger, primary_key=True, index=True)
    follower_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    followed_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Follow(follower_id={self.follower_id}, followed_id={self.followed_id})>"
