from datetime import datetime
from ..db.repos.concrete import MerchantRepo, TransactionRepo
from ..services.rename_service import RenameService
from ..core.csv_loader import CSVLoader
from ..domain.entities import TransactionScore
from ..core.logger import logger

class ScoringService:
    def __init__(
        self, 
        csv_loader: CSVLoader,
        rename_service: RenameService,
        tx_repo: TransactionRepo,
        merchant_repo: MerchantRepo
    ):
        self.csv_loader = csv_loader
        self.rename_service = rename_service
        self.tx_repo = tx_repo
        self.merchant_repo = merchant_repo

    async def score_transaction(self, merchant_id: str, merchant_name: str, amount: float) -> TransactionScore:
        # 1. Lookup ID in CSV
        profile = self.csv_loader.get_merchant(merchant_id)
        
        # 2. Fallback: Lookup Name in CSV
        if not profile and merchant_name:
            profile = self.csv_loader.get_merchant_by_name(merchant_name)
        
        # 3. Existing Profile Found
        if profile:
            score = TransactionScore(
                merchant_id=profile.merchant_id,
                merchant_name=profile.merchant_name,
                amount=amount,
                decision=profile.final_decision,
                merchant_trust_score=profile.merchant_trust_score,
                risk_score=profile.risk_score,
                rename_similarity_score=profile.rename_similarity_score,
                closest_company_match=profile.closest_company_match,
                patterns_detected=profile.patterns_detected,
                reasons=self._build_reasons(profile.merchant_trust_score, profile.patterns_detected, profile.rename_similarity_score),
                user_guidance=self._guidance(profile.final_decision)
            )
        else:
            # 4. Unknown -> Fuzzy Match
            best_match, rename_score = self.rename_service.check_similarity(merchant_name)
            
            # Logic from original
            if rename_score >= 90:
                decision, trust = "BLOCK", 25.0
            elif rename_score >= 80:
                decision, trust = "REVIEW", 40.0
            else:
                decision, trust = "REVIEW", 50.0

            patterns = ["NEW_MERCHANT"]
            if rename_score >= 80:
                patterns.append("MERCHANT_REBRAND_PATTERN")

            score = TransactionScore(
                merchant_id=merchant_id,
                merchant_name=merchant_name,
                amount=amount,
                decision=decision,
                merchant_trust_score=trust,
                rename_similarity_score=rename_score,
                closest_company_match=best_match,
                patterns_detected=patterns,
                reasons=self._build_reasons(trust, patterns, rename_score),
                user_guidance=self._guidance(decision)
            )

        # 5. Async Log to DB
        await self.tx_repo.insert(score)
        
        return score

    def _build_reasons(self, trust, patterns, rename_score):
        reasons = []
        if trust < 55:
            reasons.append(f"Low merchant trust score: {trust:.1f}/100")
        if patterns:
            reasons.append("Patterns detected: " + ", ".join(patterns))
        if rename_score >= 80:
            reasons.append(f"Merchant name similar to existing company ({rename_score}%)")
        if not reasons:
            reasons.append("No high-risk signals detected.")
        return reasons

    def _guidance(self, decision):
        if decision == "ALLOW": return "Payment looks safe."
        if decision == "REVIEW": return "Suspicious. Recommended: step-up authentication."
        return "High risk. Recommended: BLOCK transaction."
