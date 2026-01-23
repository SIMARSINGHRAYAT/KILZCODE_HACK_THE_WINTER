from fastapi import APIRouter, Depends, HTTPException
from ...models.dtos import ScoreRequestDTO, ScoreResponseDTO
from ...services.scoring_service import ScoringService
from ..dependencies import get_scoring_service

router = APIRouter()

@router.post("/score-transaction", response_model=ScoreResponseDTO)
async def score_transaction(
    req: ScoreRequestDTO,
    scoring_service: ScoringService = Depends(get_scoring_service)
):
    try:
        result = await scoring_service.score_transaction(
            merchant_id=req.merchant_id,
            merchant_name=req.merchant_name or "",
            amount=req.amount
        )
        return result # Pydantic will map Domain Entity -> DTO if fields match
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
