"""
Inference & Prediction Module for Fyte.
Loads persisted best model and preprocessor to generate single-instance predictions
with reliability scoring based on model evaluation metrics.
"""
import os
import json
from typing import Dict, Any, Tuple
import joblib
import numpy as np
import pandas as pd

class ExpensePredictor:
    def __init__(self, model_dir: str = "ml/models/best_model"):
        self.model_dir = model_dir
        self.model = None
        self.preprocessor = None
        self.metadata = {}
        self.load_artifacts()
        
    def load_artifacts(self) -> bool:
        model_path = os.path.join(self.model_dir, "model.joblib")
        prep_path = os.path.join(self.model_dir, "preprocessor.joblib")
        meta_path = os.path.join(self.model_dir, "metadata.json")
        
        if os.path.exists(model_path) and os.path.exists(prep_path):
            self.model = joblib.load(model_path)
            self.preprocessor = joblib.load(prep_path)
            if os.path.exists(meta_path):
                with open(meta_path, "r") as f:
                    self.metadata = json.load(f)
            return True
        return False

    def predict(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate prediction for an incoming record.
        """
        if self.model is None or self.preprocessor is None:
            if not self.load_artifacts():
                raise RuntimeError("Best model has not been trained or saved yet.")
                
        # Transform record through fitted feature engineer
        X = self.preprocessor.transform_single_record(payload)
        
        # Predict
        raw_pred = self.model.predict(X)[0]
        # Expense cannot be negative
        predicted_amount = float(max(10.0, round(raw_pred, 2)))
        
        # Reliability assessment based on test RMSE and test R2
        test_r2 = self.metadata.get("test_metrics", {}).get("r2", 0.0)
        test_rmse = self.metadata.get("test_metrics", {}).get("rmse", 500.0)
        test_mae = self.metadata.get("test_metrics", {}).get("mae", 300.0)
        
        # Educational reliability calculation
        # R2 > 0.4 -> Moderate/High, R2 > 0 -> Moderate, R2 <= 0 -> Basic Baseline
        if test_r2 >= 0.5:
            reliability_label = "High"
            reliability_score = min(95.0, round(50.0 + (test_r2 * 45), 1))
        elif test_r2 >= 0.2:
            reliability_label = "Moderate"
            reliability_score = round(50.0 + (test_r2 * 40), 1)
        else:
            reliability_label = "Educational Baseline"
            reliability_score = max(40.0, round(50.0 + (test_r2 * 20), 1))
            
        typical_error_margin = round(test_mae, 2)
        lower_bound = max(0.0, round(predicted_amount - typical_error_margin, 2))
        upper_bound = round(predicted_amount + typical_error_margin, 2)
        
        return {
            "predicted_amount": predicted_amount,
            "currency": "INR",
            "model_name": self.metadata.get("best_model_name", "Random Forest Regressor"),
            "reliability_label": reliability_label,
            "reliability_score": reliability_score,
            "test_rmse": test_rmse,
            "test_mae": test_mae,
            "test_r2": test_r2,
            "typical_range": {
                "lower": lower_bound,
                "upper": upper_bound
            },
            "interpretation": (
                f"Based on historical patterns, your estimated expense is ₹{predicted_amount:,.2f}. "
                f"Given the test MAE of ₹{test_mae:,.2f}, the typical expected range is ₹{lower_bound:,.2f} - ₹{upper_bound:,.2f}."
            )
        }
