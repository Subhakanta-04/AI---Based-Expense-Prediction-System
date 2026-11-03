"""
Data Loader Module for Fyte.
Handles loading and validating expense datasets.
"""
import os
from typing import Dict, Any, Tuple
import pandas as pd

REQUIRED_COLUMNS = ['Date', 'Category', 'Amount', 'Payment_Method', 'Description']

def load_dataset(filepath: str) -> pd.DataFrame:
    """
    Load expense dataset from CSV file.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Dataset file not found at: {filepath}")
    
    df = pd.read_csv(filepath)
    return df

def validate_dataset(df: pd.DataFrame) -> Tuple[bool, str]:
    """
    Validate that the dataframe contains the required columns.
    """
    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        return False, f"Missing required columns: {', '.join(missing)}"
    if len(df) == 0:
        return False, "Dataset is empty"
    return True, "Dataset is valid"

def get_dataset_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Generate structural and summary statistics of the raw dataset.
    """
    # Temporary date parsing for summary without modifying df
    temp_dates = pd.to_datetime(df['Date'], errors='coerce') if 'Date' in df.columns else pd.Series()
    valid_dates = temp_dates.dropna()
    
    date_min = valid_dates.min().strftime('%Y-%m-%d') if not valid_dates.empty else "N/A"
    date_max = valid_dates.max().strftime('%Y-%m-%d') if not valid_dates.empty else "N/A"
    
    missing_by_col = df.isnull().sum().to_dict()
    duplicate_rows = int(df.duplicated().sum())
    
    categories = df['Category'].dropna().unique().tolist() if 'Category' in df.columns else []
    payment_methods = df['Payment_Method'].dropna().unique().tolist() if 'Payment_Method' in df.columns else []
    
    amounts = pd.to_numeric(df['Amount'], errors='coerce').dropna() if 'Amount' in df.columns else pd.Series()
    
    return {
        "num_records": int(len(df)),
        "num_columns": int(len(df.columns)),
        "columns": list(df.columns),
        "data_types": {col: str(df[col].dtype) for col in df.columns},
        "missing_values": missing_by_col,
        "total_missing_values": int(sum(missing_by_col.values())),
        "duplicate_records": duplicate_rows,
        "date_range": {
            "start": date_min,
            "end": date_max
        },
        "num_categories": len(categories),
        "categories": categories,
        "num_payment_methods": len(payment_methods),
        "payment_methods": payment_methods,
        "amount_stats": {
            "total": float(amounts.sum()) if not amounts.empty else 0.0,
            "mean": float(round(amounts.mean(), 2)) if not amounts.empty else 0.0,
            "median": float(round(amounts.median(), 2)) if not amounts.empty else 0.0,
            "std": float(round(amounts.std(), 2)) if not amounts.empty else 0.0,
            "min": float(amounts.min()) if not amounts.empty else 0.0,
            "max": float(amounts.max()) if not amounts.empty else 0.0
        }
    }
