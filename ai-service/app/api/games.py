from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.game import Game
from app.core.errors import AIException

router = APIRouter(prefix="/games", tags=["Games"])

@router.get("/{id}/similar")
def get_similar_games(id: int, limit: int = 5, db: Session = Depends(get_db)):
    """
    Get similar games using pgvector cosine distance.
    Uses the HNSW index for performance.
    """
    # 1. Fetch the reference game
    reference_game = db.query(Game).filter(Game.id == id).first()
    if not reference_game:
        raise AIException(status_code=404, message=f"Game with ID {id} not found", error_type="Not Found")
    
    if reference_game.embedding is None:
        raise AIException(status_code=400, message=f"Game with ID {id} has no embedding", error_type="Bad Request")

    # 2. Perform similarity search
    # pgvector supports <-> (L2 distance), <=> (cosine distance), <#> (inner product)
    similar_games = (
        db.query(Game)
        .filter(Game.id != id)
        .order_by(Game.embedding.cosine_distance(reference_game.embedding))
        .limit(limit)
        .all()
    )
    
    # 3. Return results
    return [
        {
            "id": g.id,
            "igdb_id": g.igdb_id,
            "name": g.name,
            "summary": g.summary,
            "primary_genre": g.primary_genre,
            "genres": g.genres,
            "platforms": g.platforms,
            "release_year": g.release_year,
            "cover_url": g.cover_url,
            "avg_score": g.avg_score
        }
        for g in similar_games
    ]
