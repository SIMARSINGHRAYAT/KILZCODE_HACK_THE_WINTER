from typing import Tuple
from ..domain.similarity_engine import SimilarityEngine
from ..core.logger import logger

class RenameService:
    def __init__(self, similarity_engine: SimilarityEngine):
        self.engine = similarity_engine

    def check_similarity(self, merchant_name: str) -> Tuple[str, int]:
        """
        Returns (best_match_name, similarity_score)
        """
        name, score = self.engine.find_best_match(merchant_name)
        if score > 80:
            logger.info(f"High similarity detected: '{merchant_name}' ~= '{name}' ({score}%)")
        return name, score
