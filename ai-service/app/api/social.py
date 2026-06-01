from fastapi import APIRouter, Depends, HTTPException
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.database import get_db
from app.models.user import User
from app.models.review import Review
from app.models.follow import Follow
from app.services.moderation_service import get_moderation_service, ModerationService
from app.services.ai_engine import get_ai_engine, AIEngine
from app.services.trending_service import get_trending_service, TrendingService
from app.services.security_service import get_security_service, SecurityService
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from sqlalchemy import desc

router = APIRouter(prefix="/social", tags=["Social"])

# ─── Schemas ──────────────────────────────────────────────────────────────────

class TextRequest(BaseModel):
    text: str

class ModerationResponse(BaseModel):
    is_offensive: bool
    censored_text: str

class TrendingRequest(BaseModel):
    messages: List[str]
    top_n: int = 8

class TrendingTopic(BaseModel):
    term: str
    score: float
    count: int

class TrendingResponse(BaseModel):
    topics: List[TrendingTopic]
    message_count: int

class SecurityResponse(BaseModel):
    is_suspicious: bool
    reasons: List[str]
    score: float

@router.post("/moderation/check", response_model=ModerationResponse)
def check_moderation(request: TextRequest, service: ModerationService = Depends(get_moderation_service)):
    """Moderación síncrona (usado para reseñas del backend Spring)."""
    is_off = service.is_offensive(request.text)
    censored = service.censor_text(request.text)
    return ModerationResponse(is_offensive=is_off, censored_text=censored)


@router.post("/moderation/check-async", response_model=ModerationResponse)
async def check_moderation_async(
    request: TextRequest,
    service: ModerationService = Depends(get_moderation_service)
):
    """
    Moderación asíncrona: corre better-profanity en un threadpool para no
    bloquear el event loop de FastAPI bajo carga concurrente alta.
    """
    is_off, censored = await run_in_threadpool(
        lambda: (service.is_offensive(request.text), service.censor_text(request.text))
    )
    return ModerationResponse(is_offensive=is_off, censored_text=censored)


@router.post("/trending", response_model=TrendingResponse)
async def extract_trending_topics(
    request: TrendingRequest,
    service: TrendingService = Depends(get_trending_service)
):
    """
    Extrae los temas de tendencia de un lote de mensajes de chat.
    El chat-service llama a este endpoint periódicamente con su ventana
    de mensajes recientes para obtener keywords con TF-IDF.

    - **messages**: lista de textos de chat (hasta ~500 recomendado)
    - **top_n**: número de términos a devolver (default 8)
    """
    topics = await run_in_threadpool(
        lambda: service.extract_topics(request.messages, request.top_n)
    )
    return TrendingResponse(
        topics=[TrendingTopic(**t) for t in topics],
        message_count=len(request.messages)
    )

@router.post("/security/scan", response_model=SecurityResponse)
async def scan_message_security(
    request: TextRequest,
    service: SecurityService = Depends(get_security_service)
):
    """
    Analiza un mensaje para detectar spam o comportamiento sospechoso.
    Útil para filtrar DMs o mensajes sospechosos en el chat.
    """
    result = service.analyze_text(request.text)
    return SecurityResponse(**result)

@router.post("/reviews/{review_id}/embedding")
def generate_review_embedding(review_id: int, db: Session = Depends(get_db), ai: AIEngine = Depends(get_ai_engine)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if not review.comment:
        return {"message": "Review has no comment, no embedding generated"}
    
    embedding = ai.generate_embedding(review.comment)
    review.embedding = embedding
    db.commit()
    return {"message": "Embedding generated and saved", "review_id": review_id}

@router.post("/users/{user_id}/update-embedding")
def update_user_embedding(user_id: int, db: Session = Depends(get_db)):
    # Calculate average of review embeddings for this user
    # We filter out reviews without embeddings
    reviews = db.query(Review).filter(Review.user_id == user_id, Review.embedding != None).all()
    
    if not reviews:
        return {"message": "No reviews with embeddings found for this user"}
    
    embeddings = [np.array(r.embedding) for r in reviews]
    avg_embedding = np.mean(embeddings, axis=0).tolist()
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.embedding = avg_embedding
    db.commit()
    return {"message": "User embedding updated based on tastes", "user_id": user_id}

@router.get("/users/{user_id}/similar")
def get_similar_users(user_id: int, limit: int = 5, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.embedding is None:
        raise HTTPException(status_code=400, detail="User has no embedding. Write some reviews first!")

    # Find similar users excluding self
    similar_users = (
        db.query(User)
        .filter(User.id != user_id)
        .filter(User.embedding != None)
        .order_by(User.embedding.cosine_distance(user.embedding))
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": u.id,
            "username": u.username,
            "role": u.role
        }
        for u in similar_users
    ]

@router.get("/recommendations/{user_id}")
def get_person_recommendations(user_id: int, limit: int = 5, db: Session = Depends(get_db)):
    """
    Sugiere usuarios para seguir basándose en la similitud de los juegos 
    que ambos han reseñado positivamente (score >= 4).
    """
    # 1. Obtener juegos que el usuario ha reseñado positivamente
    user_positive_reviews = db.query(Review.game_id).filter(
        Review.user_id == user_id, 
        Review.score >= 4
    ).all()
    
    game_ids = [r.game_id for r in user_positive_reviews]
    
    if not game_ids:
        # Si no tiene reseñas positivas, fallback a usuarios con gustos generales (embeddings)
        # o simplemente devolver vacío/populares. Por ahora devolvemos vacío para motivar reseñas.
        return []

    # 2. Encontrar usuarios que ya sigue el usuario actual (para excluirlos)
    followed_ids = [f.followed_id for f in db.query(Follow.followed_id).filter(Follow.follower_id == user_id).all()]
    
    # 3. Encontrar usuarios con mayor solapamiento de juegos positivos
    recommendations = (
        db.query(User.id, User.username, func.count(Review.game_id).label('overlap'))
        .join(Review, Review.user_id == User.id)
        .filter(Review.game_id.in_(game_ids))
        .filter(Review.user_id != user_id)
        .filter(Review.score >= 4)
        .filter(~User.id.in_(followed_ids)) # Excluir ya seguidos
        .group_by(User.id)
        .order_by(desc('overlap'))
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": r.id,
            "username": r.username,
            "overlap_count": r.overlap
        }
        for r in recommendations
    ]
