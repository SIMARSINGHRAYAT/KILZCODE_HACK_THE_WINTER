import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Recurring Payment Firewall"
    APP_VERSION: str = "3.0.0"
    DEBUG: bool = True
    
    # Database
    MONGO_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "recurring_firewall"
    
    # AI / LLM
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "models/gemini-2.5-flash" # Default, can be overridden

    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    ML_DIR: str = os.path.join(BASE_DIR, "ML")
    
    # ML Files
    MASTER_CSV_PATH: str = os.path.join(ML_DIR, "Online retial II", "MERGED MASTER NOTEBOOK", "merged_master_firewall_output.csv")
    COMPANY_CSV_PATH: str = os.path.join(ML_DIR, "Online retial II", "company names", "Company Names.csv")

    model_config = SettingsConfigDict(
        env_file=(".env", "recurring_firewall/app/.env", "app/.env"), 
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
