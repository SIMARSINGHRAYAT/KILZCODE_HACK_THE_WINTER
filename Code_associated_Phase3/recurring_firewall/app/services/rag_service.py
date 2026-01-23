from ..db.repos.concrete import MerchantRepo, TransactionRepo, PolicyRepo
from ..services.rename_service import RenameService
from ..core.csv_loader import CSVLoader
from ..domain.entities import MerchantProfile

class RAGService:
    def __init__(
        self,
        merchant_repo: MerchantRepo,
        tx_repo: TransactionRepo,
        policy_repo: PolicyRepo,
        csv_loader: CSVLoader
    ):
        self.merchant_repo = merchant_repo
        self.tx_repo = tx_repo
        self.policy_repo = policy_repo
        self.csv_loader = csv_loader

    async def build_context(self, merchant_id: str, merchant_name: str) -> dict:
        # 1. Fetch Profile (DB or CSV)
        profile = None
        if merchant_id:
            profile = await self.merchant_repo.find_one({"merchant_id": merchant_id})
        
        if not profile and merchant_id:
             # Try CSV if not in DB (unlikely if they are investigating a tx, but good fallback)
             csv_p = self.csv_loader.get_merchant(merchant_id)
             if csv_p: profile = csv_p

        # 2. Fetch Recent Transactions
        recent_tx = await self.tx_repo.find_many(
            {"merchant_id": merchant_id}, 
            limit=10, 
            sort=[("timestamp", -1)]
        )

        # 3. Fetch Policy
        merchant_key = self.csv_loader._normalize_name(merchant_name).split(" ")[0] if merchant_name else ""
        policy = await self.policy_repo.find_one({"merchant_key": merchant_key})

        return {
            "merchant_profile": profile.model_dump() if profile else None,
            "recent_transactions": [t.model_dump() for t in recent_tx],
            "policy": policy.model_dump() if policy else None
        }
