import pandas as pd
import ast
import re
from typing import Dict, List, Optional
from ..domain.entities import MerchantProfile
from .config import settings
from .logger import logger

class CSVLoader:
    def __init__(self):
        self.master_df = pd.DataFrame()
        self.company_list: List[str] = []
        self.merchant_lookup: Dict[str, MerchantProfile] = {}
        self.merchant_name_map: Dict[str, str] = {}

    def _normalize_name(self, x: str) -> str:
        # Move normalize logic here or import from utils
        x = str(x).lower()
        x = re.sub(r"[^a-z0-9\s]", " ", x)
        x = re.sub(r"\s+", " ", x).strip()
        stop = {
            "pvt", "private", "ltd", "limited", "llp", "inc", "co", "company", "corp",
            "official", "store", "shop", "online", "services", "service", "solutions",
            "technology", "technologies", "international", "group", "payments", "pay"
        }
        tokens = [t for t in x.split() if t not in stop]
        return " ".join(tokens).strip()

    def _safe_parse_patterns(self, x):
        if x is None or (isinstance(x, float) and pd.isna(x)):
            return []
        if isinstance(x, list):
            return x
        x = str(x).strip()
        try:
            v = ast.literal_eval(x)
            if isinstance(v, list):
                return [str(i) for i in v]
        except Exception:
            pass
        if "," in x:
            return [p.strip() for p in x.split(",") if p.strip()]
        return [x] if x else []

    def load_data(self):
        logger.info("Loading CSV data...")
        self._load_master_csv()
        self._load_company_csv()
        logger.info(f"Data Loaded. Merchants: {len(self.merchant_lookup)}, Companies: {len(self.company_list)}")

    def _load_master_csv(self):
        try:
            df = pd.read_csv(settings.MASTER_CSV_PATH)
            df["merchant_id"] = df["merchant_id"].astype(str).str.strip()
            
            # Populate Lookup
            for _, row in df.iterrows():
                mid = row["merchant_id"]
                name = row.get("merchant_name", "Unknown")
                
                # Create Domain object
                try:
                    profile = MerchantProfile(
                        merchant_id=mid,
                        merchant_name=name,
                        merchant_trust_score=float(row.get("merchant_trust_score", 50)),
                        risk_score=float(row.get("risk_score", 0.5)),
                        rename_similarity_score=int(row.get("rename_similarity_score", 0)),
                        patterns_detected=self._safe_parse_patterns(row.get("patterns_detected")),
                        final_decision=row.get("final_decision", "REVIEW")
                    )
                    self.merchant_lookup[mid] = profile
                    
                    clean_name = self._normalize_name(name)
                    if clean_name:
                        self.merchant_name_map[clean_name] = mid
                        
                except Exception as e:
                    logger.warning(f"Failed to map row {mid}: {e}")
            
            self.master_df = df

        except Exception as e:
            logger.error(f"Failed to load Master CSV: {settings.MASTER_CSV_PATH}", exc_info=e)

    def _load_company_csv(self):
        try:
            df = pd.read_csv(settings.COMPANY_CSV_PATH)
            # Normalize columns to lower case/stripped
            df.columns = [c.strip().lower() for c in df.columns]
            
            # Find the name column
            cols = df.columns.tolist()
            name_col = next((c for c in cols if "name" in c or "company" in c), cols[0])
            
            clean_names = df[name_col].astype(str).dropna().apply(self._normalize_name).unique()
            self.company_list = clean_names.tolist()
            
        except Exception as e:
            logger.error(f"Failed to load Company CSV: {settings.COMPANY_CSV_PATH}", exc_info=e)

    def get_merchant(self, merchant_id: str) -> Optional[MerchantProfile]:
        return self.merchant_lookup.get(merchant_id)

    def get_merchant_by_name(self, merchant_name: str) -> Optional[MerchantProfile]:
        clean = self._normalize_name(merchant_name)
        mid = self.merchant_name_map.get(clean)
        if mid:
            return self.merchant_lookup.get(mid)
        return None

