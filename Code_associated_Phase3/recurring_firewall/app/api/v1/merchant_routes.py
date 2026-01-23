from fastapi import APIRouter, Depends, Query
from typing import List
from ...models.dtos import MerchantHistoryResponseDTO
from ...db.repos.concrete import TransactionRepo
from ...domain.entities import TransactionScore
from ..dependencies import get_tx_repo

router = APIRouter()

@router.get("/recent-transactions")
async def get_recent_transactions(
    limit: int = Query(10, ge=1, le=50),
    tx_repo: TransactionRepo = Depends(get_tx_repo)
):
    # Fetch from DB using repository
    # Note: BaseRepository.find_many returns List[TransactionScore] (Domain Entites)
    txs = await tx_repo.find_many({}, limit=limit, sort=[("timestamp", -1)])
    
    # Map Domain Entities to Dicts for JSON response (Or use Pydantic cleaning)
    # The frontend expects a list of objects under "history" key
    # DTO structure: { "ok": bool, "count": int, "history": List[dict] }
    
    return {
        "ok": True,
        "count": len(txs),
        "history": [t.model_dump() for t in txs]
    }
