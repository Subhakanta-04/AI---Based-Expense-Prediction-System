"""
Core Configuration for Fyte Backend.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

class Settings:
    BASE_DIR: str = str(BASE_DIR)
    PROJECT_NAME: str = "Fyte"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # File Paths
    DATA_RAW_PATH: str = os.path.join(BASE_DIR, "data", "raw", "expense_data.csv")
    DATA_PROCESSED_PATH: str = os.path.join(BASE_DIR, "data", "processed", "processed_expenses.csv")
    MODELS_DIR: str = os.path.join(BASE_DIR, "ml", "models")
    BEST_MODEL_DIR: str = os.path.join(MODELS_DIR, "best_model")
    RESULTS_DIR: str = os.path.join(BASE_DIR, "ml", "results")
    VISUALIZATIONS_DIR: str = os.path.join(BASE_DIR, "ml", "visualizations")
    REPORTS_DIR: str = os.path.join(BASE_DIR, "reports")
    
    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    ALLOWED_ORIGIN_REGEX: str = r"https://.*\.vercel\.app"

settings = Settings()
