from ..container import container

def get_scoring_service():
    return container.scoring_service

def get_gemini_service():
    return container.gemini_service

def get_rag_service():
    return container.rag_service

def get_tx_repo():
    return container.tx_repo
