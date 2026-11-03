"""
Anomaly Detection Module for Fyte.
Identifies outlier and anomalous expenses using:
1. Interquartile Range (IQR) method (global and category-level)
2. Z-Score method
"""
from typing import Dict, Any, List
import numpy as np
import pandas as pd

def detect_anomalies(df: pd.DataFrame, z_threshold: float = 2.5, iqr_multiplier: float = 1.5) -> Dict[str, Any]:
    """
    Identifies anomalous expenses using both Global IQR, Category-specific IQR, and Z-score.
    """
    df_work = df.copy()
    
    # 1. Global Z-Score
    mean_val = df_work['Amount'].mean()
    std_val = df_work['Amount'].std()
    df_work['Z_Score'] = (df_work['Amount'] - mean_val) / std_val if std_val > 0 else 0
    df_work['Is_ZScore_Anomaly'] = (df_work['Z_Score'] > z_threshold).astype(int)
    
    # 2. Global IQR
    q25 = df_work['Amount'].quantile(0.25)
    q75 = df_work['Amount'].quantile(0.75)
    iqr = q75 - q25
    global_upper_bound = q75 + (iqr_multiplier * iqr)
    df_work['Is_Global_IQR_Anomaly'] = (df_work['Amount'] > global_upper_bound).astype(int)
    
    # 3. Category-wise IQR (sensitive to category contexts)
    cat_thresholds = {}
    is_cat_anomaly = []
    anomaly_reasons = []
    
    for _, row in df_work.iterrows():
        cat = row['Category']
        amt = row['Amount']
        cat_subset = df_work[df_work['Category'] == cat]['Amount']
        
        if len(cat_subset) >= 4:
            cat_q25 = cat_subset.quantile(0.25)
            cat_q75 = cat_subset.quantile(0.75)
            cat_iqr = cat_q75 - cat_q25
            cat_upper = cat_q75 + (iqr_multiplier * cat_iqr)
            cat_thresholds[cat] = {
                "q25": round(cat_q25, 2),
                "q75": round(cat_q75, 2),
                "iqr": round(cat_iqr, 2),
                "upper_threshold": round(cat_upper, 2),
                "median": round(cat_subset.median(), 2)
            }
        else:
            cat_upper = global_upper_bound
            cat_thresholds[cat] = {
                "upper_threshold": round(cat_upper, 2),
                "median": round(cat_subset.median(), 2) if len(cat_subset) > 0 else round(amt, 2)
            }
            
        if amt > cat_upper or row['Is_Global_IQR_Anomaly'] == 1:
            is_cat_anomaly.append(1)
            reason = (
                f"Amount of ₹{amt:,.0f} exceeds category typical ceiling of "
                f"₹{cat_thresholds[cat]['upper_threshold']:,.0f} (Category median: ₹{cat_thresholds[cat]['median']:,.0f})."
            )
            anomaly_reasons.append(reason)
        else:
            is_cat_anomaly.append(0)
            anomaly_reasons.append("Normal spending")
            
    df_work['Is_Anomaly'] = is_cat_anomaly
    df_work['Anomaly_Reason'] = anomaly_reasons
    
    # Separate normal and anomalous
    anomalies_df = df_work[df_work['Is_Anomaly'] == 1].sort_values(by='Amount', ascending=False)
    normal_df = df_work[df_work['Is_Anomaly'] == 0]
    
    anomalous_records = []
    for _, r in anomalies_df.iterrows():
        anomalous_records.append({
            "date": pd.to_datetime(r['Date']).strftime('%Y-%m-%d'),
            "category": r['Category'],
            "amount": float(r['Amount']),
            "payment_method": r['Payment_Method'],
            "description": r.get('Description', ''),
            "z_score": round(float(r['Z_Score']), 2),
            "reason": r['Anomaly_Reason']
        })
        
    normal_records_sample = []
    for _, r in normal_df.head(20).iterrows():
        normal_records_sample.append({
            "date": pd.to_datetime(r['Date']).strftime('%Y-%m-%d'),
            "category": r['Category'],
            "amount": float(r['Amount']),
            "payment_method": r['Payment_Method'],
            "description": r.get('Description', '')
        })
        
    return {
        "total_transactions": len(df_work),
        "anomaly_count": len(anomalies_df),
        "anomaly_percentage": round((len(anomalies_df) / len(df_work)) * 100, 2),
        "total_anomalous_amount": float(anomalies_df['Amount'].sum()),
        "global_iqr_threshold": round(float(global_upper_bound), 2),
        "category_thresholds": cat_thresholds,
        "anomalies": anomalous_records,
        "normal_sample": normal_records_sample
    }
