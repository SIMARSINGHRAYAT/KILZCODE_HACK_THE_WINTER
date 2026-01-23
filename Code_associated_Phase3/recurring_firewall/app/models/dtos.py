from pydantic import BaseModel
from typing import List, Optional, Any

class InvestigateRequestDTO(BaseModel):
    merchant_id: Optional[str] = None
    merchant_name: Optional[str] = None
    amount: float = 0.0
    decision: Optional[str] = None
    merchant_trust_score: Optional[float] = None
    rename_similarity_score: Optional[int] = None
    closest_company_match: Optional[str] = None
    patterns_detected: List[str] = []

class InvestigateResponseDTO(BaseModel):
    ok: bool
    merchant_id: str
    merchant_name: str
    investigation: dict # JSON from LLM

class MerchantHistoryResponseDTO(BaseModel):
    ok: bool
    merchant_id: str
    count: int
    history: List[dict]

class SystemStatusResponseDTO(BaseModel):
    mongo: str
    ok: bool
    db: Optional[str] = None


class ScoreRequestDTO(BaseModel):
    merchant_id: str
    merchant_name: Optional[str] = None
    amount: float
    currency: str = "USD"

class ScoreResponseDTO(BaseModel):
    merchant_id: str
    merchant_name: str
    decision: str
    merchant_trust_score: float
    risk_score: Optional[float]
    rename_similarity_score: int
    closest_company_match: str
    patterns_detected: List[str]
    reasons: List[str]
    user_guidance: str
