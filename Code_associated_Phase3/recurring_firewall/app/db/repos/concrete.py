from .base import BaseRepository
from ...domain.entities import MerchantProfile, TransactionScore, MerchantPolicy

class MerchantRepo(BaseRepository[MerchantProfile]):
    pass

class TransactionRepo(BaseRepository[TransactionScore]):
    pass

class PolicyRepo(BaseRepository[MerchantPolicy]):
    pass
