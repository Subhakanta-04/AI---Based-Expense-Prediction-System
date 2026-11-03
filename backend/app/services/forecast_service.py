"""
Forecast Service for Fyte.
Generates 7, 14, and 30-day ahead projections.
"""
from typing import Dict, Any
from backend.app.core.config import settings
from backend.app.services.prediction_service import prediction_service
from ml.src.data_loader import load_dataset
from ml.src.preprocessing import clean_data
from ml.src.forecast import generate_forecast

class ForecastService:
    def get_forecast(self, days: int = 30) -> Dict[str, Any]:
        df_raw = load_dataset(settings.DATA_RAW_PATH)
        df_clean, _ = clean_data(df_raw)
        return generate_forecast(df_clean, horizon_days=days, predictor=prediction_service.predictor)

forecast_service = ForecastService()
