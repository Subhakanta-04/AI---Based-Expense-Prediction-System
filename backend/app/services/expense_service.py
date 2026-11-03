"""
Expense Ingestion & Real-Time Anomaly Evaluation Service for Fyte.
Allows users to append real transactions with immediate statistical verification.
"""
import os
import pandas as pd
from typing import Dict, Any
from backend.app.core.config import settings
from ml.src.data_loader import load_dataset
from ml.src.preprocessing import clean_data
from ml.src.anomaly_detection import detect_anomalies

class ExpenseService:
    def add_expense(self, date: str, category: str, amount: float, payment_method: str, description: str) -> Dict[str, Any]:
        category = category.strip().title()
        payment_method = payment_method.strip()
        amount = float(amount)
        if amount <= 0:
            raise ValueError("Amount must be greater than zero.")
            
        new_row = {
            "Date": date,
            "Category": category,
            "Amount": amount,
            "Payment_Method": payment_method,
            "Description": description.strip() if description else f"{category} transaction"
        }
        
        # Load existing dataset
        raw_path = settings.DATA_RAW_PATH
        root_path = os.path.join(settings.BASE_DIR, "expense_data.csv")
        
        df_raw = load_dataset(raw_path)
        df_new = pd.concat([df_raw, pd.DataFrame([new_row])], ignore_index=True)
        
        # Save back to CSV files
        df_new.to_csv(raw_path, index=False)
        if os.path.exists(root_path):
            df_new.to_csv(root_path, index=False)
            
        # Clean and run immediate anomaly inspection
        df_clean, _ = clean_data(df_new)
        anomalies_res = detect_anomalies(df_clean)
        
        # Check if the newly added transaction triggered an outlier
        is_anomaly = False
        anomaly_reason = "Transaction adheres to historical category distribution."
        for an in anomalies_res.get("anomalies", []):
            if an["date"] == date and an["amount"] == amount and an["category"] == category:
                is_anomaly = True
                anomaly_reason = an["reason"]
                break
                
        return {
            "success": True,
            "record": new_row,
            "total_records": len(df_new),
            "is_anomaly": is_anomaly,
            "anomaly_reason": anomaly_reason,
            "global_threshold": anomalies_res.get("global_iqr_threshold", 1787.5),
            "message": "Expense record saved successfully!"
        }

expense_service = ExpenseService()
