"""
Model Selection, Feature Importance, and Persistence Engine for Fyte.
Selects the best model based on Lowest RMSE / Highest R2, extracts feature importances,
and persists artifacts with Joblib.
"""
import os
import json
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
import joblib

def extract_feature_importance(model: Any, feature_names: List[str]) -> List[Dict[str, Any]]:
    """
    Extracts feature importance values dynamically based on model type.
    """
    actual_model = model.regressor_ if hasattr(model, "regressor_") else model
    importances = None
    if hasattr(actual_model, "feature_importances_"):
        importances = actual_model.feature_importances_
    elif hasattr(actual_model, "coef_"):
        # For linear models, take absolute values of normalized coefficients
        coef = np.abs(actual_model.coef_)
        total = np.sum(coef)
        importances = coef / total if total > 0 else coef
    else:
        importances = np.ones(len(feature_names)) / len(feature_names)
        
    if len(importances) != len(feature_names):
        importances = np.ones(len(feature_names)) / len(feature_names)
        
    df_imp = pd.DataFrame({
        "feature": feature_names,
        "importance": importances
    }).sort_values(by="importance", ascending=False)
    
    # Normalize to percentages summing to 100
    total_imp = df_imp["importance"].sum()
    if total_imp > 0:
        df_imp["relative_importance"] = (df_imp["importance"] / total_imp) * 100
    else:
        df_imp["relative_importance"] = 0.0
        
    df_imp["relative_importance"] = df_imp["relative_importance"].round(2)
    df_imp["importance"] = df_imp["importance"].round(4)
    
    return df_imp.to_dict(orient="records")

def select_and_persist_best_model(
    model_results: Dict[str, Dict[str, Any]],
    preprocessor: Any,
    feature_names: List[str],
    test_dates: List[str],
    output_dir: str = "ml/models",
    results_dir: str = "ml/results"
) -> Tuple[str, Dict[str, Any]]:
    """
    Selects the best model: Lowest RMSE (primary) and Highest R2 (secondary).
    Persists artifacts to disk.
    """
    os.makedirs(os.path.join(output_dir, "best_model"), exist_ok=True)
    os.makedirs(results_dir, exist_ok=True)
    
    # Rank models by RMSE ascending, then R2 descending
    ranked_models = sorted(
        model_results.items(),
        key=lambda item: (item[1]["test_metrics"]["rmse"], -item[1]["test_metrics"]["r2"])
    )
    
    best_name, best_data = ranked_models[0]
    best_model = best_data["model_instance"]
    
    # Save individual models and gather comparison table
    comparison_rows = []
    all_metrics = {}
    
    for name, data in model_results.items():
        m_inst = data["model_instance"]
        slug = name.lower().replace(" ", "_")
        folder = os.path.join(output_dir, slug)
        os.makedirs(folder, exist_ok=True)
        joblib.dump(m_inst, os.path.join(folder, "model.joblib"))
        
        tm = data["test_metrics"]
        train_m = data["train_metrics"]
        row = {
            "Model": name,
            "MAE": tm["mae"],
            "MSE": tm["mse"],
            "RMSE": tm["rmse"],
            "R2": tm["r2"],
            "Train_RMSE": train_m["rmse"],
            "Train_R2": train_m["r2"],
            "Is_Best": (name == best_name)
        }
        comparison_rows.append(row)
        all_metrics[name] = {
            "test": tm,
            "train": train_m
        }
        
    # Persist Best Model artifacts
    best_folder = os.path.join(output_dir, "best_model")
    joblib.dump(best_model, os.path.join(best_folder, "model.joblib"))
    joblib.dump(preprocessor, os.path.join(best_folder, "preprocessor.joblib"))
    
    feature_importances = extract_feature_importance(best_model, feature_names)
    
    metadata = {
        "best_model_name": best_name,
        "primary_criterion": "Lowest RMSE",
        "secondary_criterion": "Highest R2",
        "test_metrics": best_data["test_metrics"],
        "train_metrics": best_data["train_metrics"],
        "num_features": len(feature_names),
        "features": feature_names,
        "feature_importances": feature_importances[:15],
        "training_time": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    with open(os.path.join(best_folder, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)
        
    # Save results files
    with open(os.path.join(results_dir, "metrics.json"), "w") as f:
        json.dump({
            "best_model": best_name,
            "models": all_metrics,
            "criteria": "Chronological 80/20 split evaluated on RMSE & R²"
        }, f, indent=2)
        
    df_comparison = pd.DataFrame(comparison_rows)
    df_comparison.to_csv(os.path.join(results_dir, "model_comparison.csv"), index=False)
    
    pd.DataFrame(feature_importances).to_csv(os.path.join(results_dir, "feature_importance.csv"), index=False)
    
    # Save test set actual vs predicted predictions
    y_act = best_data["y_test_actual"]
    y_pred = best_data["test_predictions"]
    df_preds = pd.DataFrame({
        "Date": test_dates[:len(y_act)],
        "Actual": y_act,
        "Predicted": y_pred,
        "Residual": np.array(y_act) - np.array(y_pred)
    })
    df_preds.to_csv(os.path.join(results_dir, "predictions.csv"), index=False)
    
    return best_name, metadata
