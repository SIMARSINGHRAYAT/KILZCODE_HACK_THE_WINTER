from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorDatabase

T = TypeVar("T", bound=BaseModel)

class BaseRepository(Generic[T]):
    def __init__(self, db: AsyncIOMotorDatabase, collection_name: str, model_cls: type[T]):
        self.collection = db[collection_name]
        self.model_cls = model_cls

    async def insert(self, entity: T) -> bool:
        try:
            # exclude_none=True might be risky if None is meaningful, but usually safe for Mongo
            await self.collection.insert_one(entity.model_dump(by_alias=True))
            return True
        except Exception:
            return False

    async def find_one(self, query: dict) -> Optional[T]:
        doc = await self.collection.find_one(query)
        if doc:
            return self.model_cls(**doc)
        return None

    async def find_many(self, query: dict, limit: int = 10, sort: Optional[list] = None) -> List[T]:
        cursor = self.collection.find(query)
        if sort:
            cursor = cursor.sort(sort)
        cursor = cursor.limit(limit)
        
        results = []
        async for doc in cursor:
            results.append(self.model_cls(**doc))
        return results
