"""
Dataset Service for Fyte.
Handles loading raw/processed data, file uploads, previews, and metadata summaries.
"""
import os
import shutil
import pandas as pd
from typing import Dict, Any, Tuple
from backend.app.core.config import settings
from ml.src.data_loader import load_dataset, validate_dataset, get_dataset_summary
from ml.src.preprocessing import clean_data

class DatasetService:
    def __init__(self):
        self.raw_path = settings.DATA_RAW_PATH
        self.processed_path = settings.DATA_PROCESSED_PATH

    def get_info(self) -> Dict[str, Any]:
        if not os.path.exists(self.raw_path):
            # Fallback to current directory expense_data.csv if available
            fallback = os.path.join(settings.BASE_DIR, "expense_data.csv")
            if os.path.exists(fallback):
                shutil.copyfile(fallback, self.raw_path)
            else:
                raise FileNotFoundError("Primary expense dataset not found.")
                
        df = load_dataset(self.raw_path)
        return get_dataset_summary(df)

    def get_preview(self, limit: int = 50) -> Dict[str, Any]:
        if not os.path.exists(self.raw_path):
            raise FileNotFoundError("Primary expense dataset not found.")
        df = load_dataset(self.raw_path)
        rows = df.head(limit).to_dict(orient="records")
        return {
            "columns": list(df.columns),
            "rows": rows,
            "total_count": len(df)
        }

    def save_uploaded_dataset(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        temp_path = self.raw_path + ".tmp"
        with open(temp_path, "wb") as f:
            f.write(file_content)
            
        try:
            df = pd.read_csv(temp_path)
            valid, msg = validate_dataset(df)
            if not valid:
                os.remove(temp_path)
                raise ValueError(f"Uploaded CSV is invalid: {msg}")
                
            shutil.move(temp_path, self.raw_path)
            return {
                "success": True,
                "message": f"Successfully loaded and validated {filename}",
                "num_records": len(df),
                "columns": list(df.columns)
            }
        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e

    def reset_default_dataset(self) -> Dict[str, Any]:
        fallback = os.path.join(settings.BASE_DIR, "expense_data.csv")
        if os.path.exists(fallback):
            shutil.copyfile(fallback, self.raw_path)
            df = pd.read_csv(self.raw_path)
            return {
                "success": True,
                "message": "Reset to default expense_data.csv",
                "num_records": len(df)
            }
        raise FileNotFoundError("Base expense_data.csv not found to reset.")

dataset_service = DatasetService()
