"""
Model Evaluation Module for Fyte.
Calculates MAE, MSE, RMSE, R2, and error distribution.
"""
from typing import Dict, Any, List
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def calculate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Computes regression evaluation metrics: MAE, MSE, RMSE, R2.
    """
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    
    mae = float(mean_absolute_error(y_true, y_pred))
    mse = float(mean_squared_error(y_true, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_true, y_pred))
    
    # Calculate Mean Absolute Percentage Error (avoid division by 0)
    non_zero = y_true != 0
    mape = float(np.mean(np.abs((y_true[non_zero] - y_pred[non_zero]) / y_true[non_zero])) * 100) if np.any(non_zero) else 0.0
    
    return {
        "mae": round(mae, 2),
        "mse": round(mse, 2),
        "rmse": round(rmse, 2),
        "r2": round(r2, 4),
        "mape": round(mape, 2)
    }

def format_actual_vs_predicted(dates: List[str], y_true: np.ndarray, y_pred: np.ndarray, categories: List[str] = None) -> List[Dict[str, Any]]:
    """
    Create structured list of actual vs predicted observations.
    """
    results = []
    for i in range(len(y_true)):
        act = float(round(y_true[i], 2))
        pred = float(round(y_pred[i], 2))
        err = float(round(act - pred, 2))
        pct_err = float(round((err / act) * 100, 2)) if act != 0 else 0.0
        
        row = {
            "index": i,
            "date": str(dates[i]) if dates and i < len(dates) else f"Record {i+1}",
            "actual": act,
            "predicted": pred,
            "error": err,
            "abs_error": abs(err),
            "percentage_error": pct_err
        }
        if categories and i < len(categories):
            row["category"] = categories[i]
        results.append(row)
    return results
