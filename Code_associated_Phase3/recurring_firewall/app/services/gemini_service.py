import google.generativeai as genai
from ..core.config import settings
from ..core.logger import logger
from ..core.exceptions import LLMError
import asyncio

class GeminiService:
    def __init__(self):
        self.model = None
        self._init_model()

    def _init_model(self):
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY missing. LLM features disabled.")
            return
        
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
            logger.info(f"Gemini initialized with model: {settings.GEMINI_MODEL}")
        except Exception as e:
            logger.error("Failed to init Gemini", exc_info=e)

    async def generate(self, prompt: str) -> str:
        if not self.model:
            raise LLMError("Gemini not configured")
        
        try:
            # Run blocking call in threadpool
            resp = await asyncio.to_thread(self.model.generate_content, prompt)
            return resp.text
        except Exception as e:
            raise LLMError(f"Gemini Generation Failed: {str(e)}")
