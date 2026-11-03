"""
Anomaly Detection Service for Fyte.
"""
from typing import Dict, Any
from backend.app.core.config import settings
from ml.src.data_loader import load_dataset
from ml.src.preprocessing import clean_data
from ml.src.anomaly_detection import detect_anomalies

class AnomalyService:
    def get_anomalies(self) -> Dict[str, Any]:
        df_raw = load_dataset(settings.DATA_RAW_PATH)
        df_clean, _ = clean_data(df_raw)
        return detect_anomalies(df_clean)

anomaly_service = AnomalyService()
