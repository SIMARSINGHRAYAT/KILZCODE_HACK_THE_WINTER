from fastapi import APIRouter
from ...db.mongo import mongo_manager
from ...models.dtos import SystemStatusResponseDTO
from ...core.config import settings

router = APIRouter()

@router.get("/mongo-status", response_model=SystemStatusResponseDTO)
async def mongo_status():
    if not mongo_manager.client:
         return {"mongo": "DISCONNECTED", "ok": False}
    try:
        await mongo_manager.client.admin.command("ping")
        return {"mongo": "CONNECTED", "ok": True, "db": settings.DB_NAME}
    except Exception as e:
        return {"mongo": "ERROR", "ok": False}
