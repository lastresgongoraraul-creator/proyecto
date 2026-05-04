from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.core.errors import ErrorResponse, AIException
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

from app.api.games import router as games_router
from app.api.social import router as social_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Service",
    description="Service for game recommendations and embeddings",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(games_router)
app.include_router(social_router)

@app.exception_handler(AIException)
async def ai_exception_handler(request: Request, exc: AIException):
    error_content = ErrorResponse(
        status=exc.status_code,
        error=exc.error_type,
        message=exc.message,
        path=request.url.path
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=error_content.model_dump()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    error_content = ErrorResponse(
        status=500,
        error="Internal Server Error",
        message=str(exc),
        path=request.url.path
    )
    return JSONResponse(
        status_code=500,
        content=error_content.model_dump()
    )

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Check the health of the AI Service.
    """
    return {
        "status": "UP",
        "timestamp": ErrorResponse().timestamp,
        "service": "ai-service"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
