"""
Machine Learning Service for Fyte.
Handles model training execution, comparisons, metrics retrieval, and artifact inspections.
"""
import os
import json
import pandas as pd
from typing import Dict, Any, List
from backend.app.core.config import settings
from ml.src.pipeline import run_complete_pipeline

class MLService:
    def __init__(self):
        self.results_dir = settings.RESULTS_DIR
        self.best_model_dir = settings.BEST_MODEL_DIR

    def train_models(self) -> Dict[str, Any]:
        """
        Executes complete pipeline: preprocessing -> feature engineering -> training -> persistence.
        """
        res = run_complete_pipeline(
            csv_path=settings.DATA_RAW_PATH,
            models_dir=settings.MODELS_DIR,
            results_dir=self.results_dir,
            vis_dir=settings.VISUALIZATIONS_DIR,
            figures_dir=os.path.join(settings.REPORTS_DIR, "figures")
        )
        return res

    def get_best_model_info(self) -> Dict[str, Any]:
        meta_file = os.path.join(self.best_model_dir, "metadata.json")
        if not os.path.exists(meta_file):
            # If not yet trained, run pipeline once to initialize!
            self.train_models()
            
        with open(meta_file, "r") as f:
            data = json.load(f)
        return data

    def get_comparison(self) -> List[Dict[str, Any]]:
        comp_file = os.path.join(self.results_dir, "model_comparison.csv")
        if not os.path.exists(comp_file):
            self.train_models()
        df = pd.read_csv(comp_file)
        return df.to_dict(orient="records")

    def get_metrics_summary(self) -> Dict[str, Any]:
        metrics_file = os.path.join(self.results_dir, "metrics.json")
        if not os.path.exists(metrics_file):
            self.train_models()
        with open(metrics_file, "r") as f:
            return json.load(f)

    def get_feature_importance(self) -> List[Dict[str, Any]]:
        feat_file = os.path.join(self.results_dir, "feature_importance.csv")
        if not os.path.exists(feat_file):
            self.train_models()
        df = pd.read_csv(feat_file)
        return df.head(15).to_dict(orient="records")

    def get_actual_vs_predicted(self) -> List[Dict[str, Any]]:
        pred_file = os.path.join(self.results_dir, "predictions.csv")
        if not os.path.exists(pred_file):
            self.train_models()
        df = pd.read_csv(pred_file)
        # Round numerical values
        df['Actual'] = df['Actual'].round(2)
        df['Predicted'] = df['Predicted'].round(2)
        df['Residual'] = df['Residual'].round(2)
        return df.to_dict(orient="records")

ml_service = MLService()
