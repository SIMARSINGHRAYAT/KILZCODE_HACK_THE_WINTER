from rapidfuzz import process, fuzz
from typing import Tuple, List
from ..core.csv_loader import CSVLoader

class SimilarityEngine:
    def __init__(self, csv_loader: CSVLoader):
        self.csv_loader = csv_loader # Dependency Injection

    def find_best_match(self, query: str) -> Tuple[str, int]:
        clean_q = self.csv_loader._normalize_name(query)
        candidates = self.csv_loader.company_list
        
        if not clean_q or len(clean_q) < 3 or not candidates:
            return "", 0
            
        # Using token_sort_ratio as per original logic
        best = process.extractOne(clean_q, candidates, scorer=fuzz.token_sort_ratio)
        if best:
             # best is (match, score, index)
            return best[0], int(best[1])
        return "", 0
