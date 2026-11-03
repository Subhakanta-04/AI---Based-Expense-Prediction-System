"""
Data Preprocessing Pipeline for Fyte.
Cleans raw expense data, validates types, handles missing values/duplicates,
and prepares the dataset for feature engineering.
"""
from typing import Tuple, Dict, Any
import pandas as pd
import numpy as np

def clean_data(df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans raw expense records.
    - Strips whitespace from string columns
    - Coerces 'Date' to datetime and drops unparseable dates
    - Coerces 'Amount' to positive float, handling non-numeric or <=0 values
    - Standardizes Category and Payment_Method text
    - Identifies and handles duplicate rows transparently
    - Chronologically sorts dataset by Date to preserve temporal ordering
    
    Returns:
        cleaned_df: pd.DataFrame
        audit_report: Dict detailing exact cleaning actions taken
    """
    df = df_raw.copy()
    initial_rows = len(df)
    
    audit_report: Dict[str, Any] = {
        "initial_rows": initial_rows,
        "actions_taken": [],
        "duplicates_found": 0,
        "invalid_dates_dropped": 0,
        "invalid_amounts_handled": 0,
        "missing_values_handled": {},
        "final_rows": 0
    }
    
    # 1. Clean string columns (strip whitespace)
    for col in ['Category', 'Payment_Method', 'Description']:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()
    audit_report["actions_taken"].append("Trimmed whitespace from Category, Payment_Method, and Description.")
    
    # 2. Check and log missing values before imputation/cleaning
    for col in df.columns:
        null_count = int(df[col].isnull().sum())
        if null_count > 0:
            audit_report["missing_values_handled"][col] = null_count
            
    # 3. Parse Dates
    df['Date_Parsed'] = pd.to_datetime(df['Date'], errors='coerce')
    invalid_dates = df['Date_Parsed'].isnull().sum()
    if invalid_dates > 0:
        audit_report["invalid_dates_dropped"] = int(invalid_dates)
        audit_report["actions_taken"].append(f"Dropped {invalid_dates} rows with unparseable dates.")
        df = df.dropna(subset=['Date_Parsed'])
    df['Date'] = df['Date_Parsed']
    df = df.drop(columns=['Date_Parsed'])
    
    # 4. Handle Amounts
    df['Amount'] = pd.to_numeric(df['Amount'], errors='coerce')
    invalid_amounts = df['Amount'].isnull() | (df['Amount'] <= 0)
    invalid_amount_count = int(invalid_amounts.sum())
    if invalid_amount_count > 0:
        audit_report["invalid_amounts_handled"] = invalid_amount_count
        audit_report["actions_taken"].append(f"Removed {invalid_amount_count} rows with invalid or zero amounts.")
        df = df[~invalid_amounts]
        
    # 5. Handle Description missing
    if 'Description' in df.columns:
        df['Description'] = df['Description'].fillna("Unspecified")
        
    # 6. Check duplicates
    duplicate_count = int(df.duplicated(subset=['Date', 'Category', 'Amount', 'Payment_Method']).sum())
    if duplicate_count > 0:
        audit_report["duplicates_found"] = duplicate_count
        # We drop duplicate transactions occurring on the exact same date with identical amount/category/method
        df = df.drop_duplicates(subset=['Date', 'Category', 'Amount', 'Payment_Method'], keep='first')
        audit_report["actions_taken"].append(f"Identified and removed {duplicate_count} duplicate records.")
    else:
        audit_report["actions_taken"].append("Verified zero duplicate records present.")
        
    # 7. Standardize categories & payment methods capitalization
    df['Category'] = df['Category'].str.title()
    # Retain standard acronyms like UPI
    def clean_payment_method(val: str) -> str:
        val_upper = val.upper()
        if "UPI" in val_upper:
            return "UPI"
        if "CREDIT" in val_upper:
            return "Credit Card"
        if "DEBIT" in val_upper:
            return "Debit Card"
        if "NET" in val_upper or "BANK" in val_upper:
            return "Net Banking"
        if "CASH" in val_upper:
            return "Cash"
        return val.title()
    
    df['Payment_Method'] = df['Payment_Method'].apply(clean_payment_method)
    
    # 8. Sort chronologically by Date
    df = df.sort_values(by='Date').reset_index(drop=True)
    audit_report["actions_taken"].append("Sorted dataset chronologically by Date for time-series integrity.")
    
    audit_report["final_rows"] = len(df)
    audit_report["date_min"] = df['Date'].min().strftime('%Y-%m-%d')
    audit_report["date_max"] = df['Date'].max().strftime('%Y-%m-%d')
    
    return df, audit_report
