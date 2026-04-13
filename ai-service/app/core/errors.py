from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ErrorResponse(BaseModel):
    """
    Standard Error Response matching the Java backend contract.
    """
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    status: int
    error: str
    message: str
    path: str

class AIException(Exception):
    def __init__(self, status_code: int, message: str, error_type: str = "Internal Server Error"):
        self.status_code = status_code
        self.message = message
        self.error_type = error_type
        super().__init__(message)
