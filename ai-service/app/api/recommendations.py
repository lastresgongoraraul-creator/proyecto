from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.user import User
from app.models.review import Review
from app.models.game import Game
from app.core.errors import AIException
import numpy as np
from typing import List

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

def get_user_taste_vector(user_id: int, db: Session):
    """
    Calculates the average vector of games liked by the user (score > 7).
    """
    # Fetch embeddings of games liked by the user
    liked_games = (
        db.query(Game.embedding)
        .join(Review, Review.game_id == Game.id)
        .filter(Review.user_id == user_id, Review.score > 7)
        .all()
    )
    
    if not liked_games:
        return None
        
    embeddings = [np.array(g.embedding) for g in liked_games if g.embedding is not None]
    
    if not embeddings:
        return None
        
    return np.mean(embeddings, axis=0).tolist()

@router.get("/user/{id}")
def get_user_recommendations(id: int, limit: int = 5, db: Session = Depends(get_db)):
    """
    Recomienda juegos basados en los juegos que el usuario ha reseñado positivamente (nota > 7).
    """
    # 1. Calcular el vector de gustos del usuario
    taste_vector = get_user_taste_vector(id, db)
    
    if not taste_vector:
        # Fallback to top rated games
        similar_games = (
            db.query(Game)
            .filter(Game.embedding.isnot(None))
            .order_by(Game.avg_score.desc())
            .limit(limit)
            .all()
        )
        print(f"DEBUG: Fallback query found {len(similar_games)} games")
        for g in similar_games:
            print(f"DEBUG: Game: {g.name}, Score: {g.avg_score}")
    else:
        # 2. Obtener juegos que el usuario ya ha reseñado (para excluirlos)
        reviewed_game_ids = [r.game_id for r in db.query(Review.game_id).filter(Review.user_id == id).all()]
        
        # 3. Buscar juegos similares en pgvector
        similar_games = (
            db.query(Game)
            .filter(~Game.id.in_(reviewed_game_ids))
            .filter(Game.embedding != None)
            .order_by(Game.embedding.cosine_distance(taste_vector))
            .limit(limit)
            .all()
        )
    
    return [
        {
            "id": g.id,
            "name": g.name,
            "summary": g.summary,
            "primary_genre": g.primary_genre,
            "cover_url": g.cover_url,
            "avg_score": g.avg_score
        }
        for g in similar_games
    ]

@router.get("/friends/{id}")
def get_friend_recommendations(id: int, limit: int = 5, db: Session = Depends(get_db)):
    """
    Sugiere amigos basados en la similitud de sus vectores de gustos.
    """
    # 1. Calcular el vector de gustos del usuario objetivo
    target_taste_vector = get_user_taste_vector(id, db)
    
    if not target_taste_vector:
        raise AIException(status_code=404, message="User has no positive reviews to base friend recommendations on.", error_type="Not Found")
        
    # 2. Obtener todos los usuarios que tienen reseñas positivas (para comparar)
    # Para hacerlo eficiente en este entorno, traemos los datos y los procesamos.
    # En un sistema grande, esto se almacenaría en la tabla users.
    all_positive_reviews = (
        db.query(Review.user_id, Game.embedding)
        .join(Game, Review.game_id == Game.id)
        .filter(Review.score > 7, Review.user_id != id, Game.embedding != None)
        .all()
    )
    
    if not all_positive_reviews:
        return []
        
    # Agrupar por usuario y calcular vectores promedio
    user_vectors = {}
    for user_id, embedding in all_positive_reviews:
        if user_id not in user_vectors:
            user_vectors[user_id] = []
        user_vectors[user_id].append(np.array(embedding))
        
    user_taste_vectors = {}
    for u_id, embs in user_vectors.items():
        user_taste_vectors[u_id] = np.mean(embs, axis=0)
        
    # Calcular distancias
    distances = []
    target_vec = np.array(target_taste_vector)
    
    for u_id, vec in user_taste_vectors.items():
        # Cosine distance = 1 - cosine similarity
        # Here we can use scipy or just numpy
        dot = np.dot(target_vec, vec)
        norm_a = np.linalg.norm(target_vec)
        norm_b = np.linalg.norm(vec)
        if norm_a == 0 or norm_b == 0:
            cos_sim = 0
        else:
            cos_sim = dot / (norm_a * norm_b)
        
        distances.append((u_id, cos_sim))
        
    # Ordenar por similitud (mayor a menor)
    distances.sort(key=lambda x: x[1], reverse=True)
    
    # Obtener los top N
    top_user_ids = [u_id for u_id, sim in distances[:limit]]
    
    if not top_user_ids:
        return []
        
    # Fetch user details
    top_users = db.query(User.id, User.username).filter(User.id.in_(top_user_ids)).all()
    
    # Create a map for quick lookup
    user_map = {u.id: u for u in top_users}
    
    # Return in ordered format
    results = []
    for u_id, sim in distances[:limit]:
        if u_id in user_map:
            u = user_map[u_id]
            results.append({
                "id": u.id,
                "username": u.username,
                "similarity": float(sim)
            })
            
    return results
