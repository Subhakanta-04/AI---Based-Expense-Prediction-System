"""
Prediction Service for Fyte.
Wraps ExpensePredictor to handle single prediction requests with automatic fallback context.
"""
from typing import Dict, Any
import pandas as pd
from backend.app.core.config import settings
from ml.src.predict import ExpensePredictor
from ml.src.data_loader import load_dataset
from ml.src.preprocessing import clean_data

class PredictionService:
    def __init__(self):
        self._predictor = None

    @property
    def predictor(self) -> ExpensePredictor:
        if self._predictor is None:
            self._predictor = ExpensePredictor(model_dir=settings.BEST_MODEL_DIR)
        return self._predictor

    def predict_expense(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict expense for given attributes. If historical values not passed, dynamically inject
        the latest rolling averages from the actual dataset.
        """
        payload = dict(request_data)
        
        # If historical lag parameters not supplied by user, pull recent historical context
        needs_context = any(
            payload.get(k) is None 
            for k in ['Previous_Expense', 'Rolling_3_Day_Average', 'Rolling_7_Day_Average', 'Rolling_14_Day_Average']
        )
        
        if needs_context:
            df_raw = load_dataset(settings.DATA_RAW_PATH)
            df_clean, _ = clean_data(df_raw)
            recent_amts = df_clean['Amount'].tail(14).values
            if len(recent_amts) > 0:
                payload['Previous_Expense'] = payload.get('Previous_Expense') or float(recent_amts[-1])
                payload['Rolling_3_Day_Average'] = payload.get('Rolling_3_Day_Average') or float(recent_amts[-3:].mean())
                payload['Rolling_7_Day_Average'] = payload.get('Rolling_7_Day_Average') or float(recent_amts[-7:].mean())
                payload['Rolling_14_Day_Average'] = payload.get('Rolling_14_Day_Average') or float(recent_amts.mean())
                payload['Transaction_Count'] = len(df_clean) + 1
                
        return self.predictor.predict(payload)

prediction_service = PredictionService()
