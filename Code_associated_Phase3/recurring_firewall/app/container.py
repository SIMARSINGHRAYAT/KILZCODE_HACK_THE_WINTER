from .core.csv_loader import CSVLoader
from .db.mongo import mongo_manager, get_database
from .services.rename_service import RenameService
from .services.gemini_service import GeminiService
from .services.scoring_service import ScoringService
from .db.repos.concrete import MerchantRepo, TransactionRepo, PolicyRepo
from .domain.entities import MerchantProfile, TransactionScore, MerchantPolicy
from .domain.similarity_engine import SimilarityEngine
from .core.logger import logger

class Container:
    def __init__(self):
        self.csv_loader = CSVLoader()
        self.gemini_service = GeminiService()
        self.similarity_engine = None
        self.rename_service = None
        self.scoring_service = None
        
        # Repos
        self.merchant_repo = None
        self.tx_repo = None
        self.policy_repo = None

    async def startup(self):
        logger.info("Container Startup: Initializing components...")
        
        # 1. Connect DB
        await mongo_manager.connect()
        db = mongo_manager.db
        
        # 2. Init Repos
        self.merchant_repo = MerchantRepo(db, "merchant_profiles", MerchantProfile)
        self.tx_repo = TransactionRepo(db, "transactions", TransactionScore)
        self.policy_repo = PolicyRepo(db, "merchant_policies", MerchantPolicy)

        # 3. Load Data
        self.csv_loader.load_data()
        
        # 4. Init Services
        self.similarity_engine = SimilarityEngine(self.csv_loader)
        self.rename_service = RenameService(self.similarity_engine)
        
        self.scoring_service = ScoringService(
            csv_loader=self.csv_loader,
            rename_service=self.rename_service,
            tx_repo=self.tx_repo,
            merchant_repo=self.merchant_repo
        )
        
        from .services.rag_service import RAGService
        self.rag_service = RAGService(
            merchant_repo=self.merchant_repo,
            tx_repo=self.tx_repo,
            policy_repo=self.policy_repo,
            csv_loader=self.csv_loader
        )
        logger.info("Container Startup Complete.")

    async def shutdown(self):
        await mongo_manager.close()

# Singleton
container = Container()
