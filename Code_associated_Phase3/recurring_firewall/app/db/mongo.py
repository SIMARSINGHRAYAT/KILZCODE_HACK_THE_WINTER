from motor.motor_asyncio import AsyncIOMotorClient
from ..core.config import settings
from ..core.logger import logger

class MongoManager:
    def __init__(self):
        self.client: AsyncIOMotorClient | None = None
        self.db = None

    async def connect(self):
        logger.info(f"Connecting to MongoDB at {settings.MONGO_URI}...")
        self.client = AsyncIOMotorClient(settings.MONGO_URI)
        self.db = self.client[settings.DB_NAME]
        
        # Ping to verify
        try:
            await self.client.admin.command("ping")
            logger.info("MongoDB connected successfully.")
        except Exception as e:
            logger.error("MongoDB connection failed.", exc_info=e)
            raise e

    async def close(self):
        if self.client:
            self.client.close()
            logger.info("MongoDB disconnected.")

mongo_manager = MongoManager()

async def get_database():
    return mongo_manager.db
