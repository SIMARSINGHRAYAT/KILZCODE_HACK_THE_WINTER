from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import datetime

class DomainEntity(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

# --- Merchant Entities ---
class MerchantProfile(DomainEntity):
    merchant_id: str
    merchant_name: str = "Unknown Merchant"
    merchant_trust_score: float = 50.0
    risk_score: float = 0.5
    rename_similarity_score: int = 0
    patterns_detected: List[str] = Field(default_factory=list)
    final_decision: str = "REVIEW"
    closest_company_match: str = ""
    last_seen: Optional[datetime] = None

class MerchantPolicy(DomainEntity):
    merchant_key: str
    merchant_name: str
    cancellation_steps: List[str]
    notes: Optional[str] = None

# --- Transaction Entities ---
class TransactionScore(DomainEntity):
    merchant_id: str
    merchant_name: str
    amount: float
    decision: str
    merchant_trust_score: float = 0.0
    risk_score: Optional[float] = None
    rename_similarity_score: int = 0
    closest_company_match: str = ""
    patterns_detected: List[str] = Field(default_factory=list)
    reasons: List[str] = Field(default_factory=list)
    user_guidance: str = "No guidance available."
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class InvestigationResult(DomainEntity):
    risk_summary: str
    key_reasons: List[str]
    recommended_bank_action: List[str]
    customer_guidance: List[str]
    cancellation_instructions: List[str]
    confidence: str

class CaseLog(DomainEntity):
    merchant_id: str
    merchant_name: str
    payload: dict
    rag_context: dict
    llm_output: dict # or InvestigationResult
    timestamp: datetime = Field(default_factory=datetime.utcnow)
