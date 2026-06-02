from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.game import Game
from app.models.review import Review
from app.core.errors import AIException
from transformers import pipeline

router = APIRouter(prefix="/games", tags=["Games"])

@router.get("/{id}/similar")
def get_similar_games(id: int, limit: int = 5, min_score: float = 0.0, db: Session = Depends(get_db)):
    """
    Get similar games using pgvector cosine distance.
    Uses the HNSW index for performance.
    Allows filtering by a minimum average score.
    """
    # 1. Fetch the reference game
    reference_game = db.query(Game).filter(Game.id == id).first()
    if not reference_game:
        raise AIException(status_code=404, message=f"Game with ID {id} not found", error_type="Not Found")
    
    if reference_game.embedding is None:
        raise AIException(status_code=400, message=f"Game with ID {id} has no embedding", error_type="Bad Request")

    from sqlalchemy import or_

    # Convert to list to ensure compatibility with pgvector adapter
    ref_embedding = reference_game.embedding
    if hasattr(ref_embedding, "tolist"):
        ref_embedding = ref_embedding.tolist()
    elif not isinstance(ref_embedding, list):
        ref_embedding = list(ref_embedding)

    # 2. Perform similarity search with minimum score filter
    # pgvector supports <-> (L2 distance), <=> (cosine distance), <#> (inner product)
    similar_games = (
        db.query(Game)
        .filter(Game.id != id)
        .filter(Game.embedding != None)
        .filter(or_(Game.avg_score >= min_score, Game.avg_score == None))
        .order_by(Game.embedding.cosine_distance(ref_embedding))
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

sentiment_analyzer = None

def get_sentiment_analyzer():
    global sentiment_analyzer
    if sentiment_analyzer is None:
        # Using a 3-label model (Positive, Neutral, Negative)
        sentiment_analyzer = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment")
    return sentiment_analyzer

@router.get("/{id}/sentiment")
def get_game_sentiment(id: int, db: Session = Depends(get_db)):
    """
    Analiza las reseñas de un juego y devuelve un resumen general (positivo, neutral, negativo).
    """
    # 1. Fetch reviews for the game
    reviews = db.query(Review).filter(Review.game_id == id).all()
    
    if not reviews:
        return {
            "game_id": id,
            "summary": "No hay reseñas para este juego",
            "positive": 0,
            "neutral": 0,
            "negative": 0,
            "total": 0
        }
        
    # 2. Extract comments
    comments = [r.comment for r in reviews if r.comment]
    
    if not comments:
         return {
            "game_id": id,
            "summary": "Las reseñas no tienen comentarios",
            "positive": 0,
            "neutral": 0,
            "negative": 0,
            "total": 0
        }
        
    # 3. Run sentiment analysis
    analyzer = get_sentiment_analyzer()
    
    results = analyzer(comments)
    
    # 4. Aggregate results
    # cardiffnlp model returns labels: LABEL_0 (Negative), LABEL_1 (Neutral), LABEL_2 (Positive)
    # Let's map them.
    
    label_map = {
        "LABEL_0": "negative",
        "LABEL_1": "neutral",
        "LABEL_2": "positive"
    }
    
    counts = {"positive": 0, "neutral": 0, "negative": 0}
    
    for res in results:
        label = res["label"]
        mapped_label = label_map.get(label, "neutral")
        counts[mapped_label] += 1
        
    total = len(comments)
    
    # Determine general summary
    # If most are positive, summary is positive, etc.
    max_label = max(counts, key=counts.get)
    
    return {
        "game_id": id,
        "summary": f"Predominantemente {max_label}",
        "positive": counts["positive"],
        "neutral": counts["neutral"],
        "negative": counts["negative"],
        "total": total
    }
