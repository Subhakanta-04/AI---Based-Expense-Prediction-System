"""
Multi-Step Expense Forecasting Module for Fyte.
Projects daily spending for the next 7, 14, and 30 days using trained ML models,
updating rolling lag statistics iteratively.
"""
from typing import Dict, Any, List
import datetime
import numpy as np
import pandas as pd
from ml.src.predict import ExpensePredictor

def generate_forecast(
    cleaned_df: pd.DataFrame, 
    horizon_days: int = 30,
    predictor: ExpensePredictor = None
) -> Dict[str, Any]:
    """
    Simulates forward daily spending over next N days.
    """
    if predictor is None:
        predictor = ExpensePredictor()
        
    df_hist = cleaned_df.sort_values(by='Date').reset_index(drop=True)
    last_date = pd.to_datetime(df_hist['Date'].max())
    
    # Calculate historical category proportions to realistically sample future categories
    cat_counts = df_hist['Category'].value_counts(normalize=True).to_dict()
    categories = list(cat_counts.keys())
    cat_weights = list(cat_counts.values())
    
    # Most common payment method per category
    cat_pm_map = {}
    for c in categories:
        mode_pm = df_hist[df_hist['Category'] == c]['Payment_Method'].mode()
        cat_pm_map[c] = mode_pm.iloc[0] if not mode_pm.empty else "UPI"
        
    # Seed historical state
    recent_amounts = df_hist['Amount'].tail(30).tolist()
    
    forecast_records = []
    accumulated_amounts = list(recent_amounts)
    
    current_date = last_date
    for step in range(1, horizon_days + 1):
        current_date += datetime.timedelta(days=1)
        
        # Determine likely category for this day using weighted rotation
        chosen_cat = categories[(step - 1) % len(categories)]
        # Add weekend likelihood if weekend
        if current_date.weekday() in [5, 6] and "Food" in categories:
            chosen_cat = "Food"
            
        chosen_pm = cat_pm_map.get(chosen_cat, "UPI")
        
        # Compute dynamic lag stats strictly from past
        prev_amt = accumulated_amounts[-1]
        roll_3 = np.mean(accumulated_amounts[-3:]) if len(accumulated_amounts) >= 3 else prev_amt
        roll_7 = np.mean(accumulated_amounts[-7:]) if len(accumulated_amounts) >= 7 else roll_3
        roll_14 = np.mean(accumulated_amounts[-14:]) if len(accumulated_amounts) >= 14 else roll_7
        prev_7_tot = np.sum(accumulated_amounts[-7:]) if len(accumulated_amounts) >= 7 else roll_7 * 7
        prev_14_tot = np.sum(accumulated_amounts[-14:]) if len(accumulated_amounts) >= 14 else roll_14 * 14
        prev_30_tot = np.sum(accumulated_amounts[-30:]) if len(accumulated_amounts) >= 30 else roll_14 * 30
        
        payload = {
            "Date": current_date.strftime('%Y-%m-%d'),
            "Category": chosen_cat,
            "Payment_Method": chosen_pm,
            "Description": f"Forecasted {chosen_cat}",
            "Previous_Expense": prev_amt,
            "Rolling_3_Day_Average": roll_3,
            "Rolling_7_Day_Average": roll_7,
            "Rolling_14_Day_Average": roll_14,
            "Previous_7_Day_Total": prev_7_tot,
            "Previous_14_Day_Total": prev_14_tot,
            "Previous_30_Day_Total": prev_30_tot,
            "Transaction_Count": len(df_hist) + step
        }
        
        pred_res = predictor.predict(payload)
        pred_amt = pred_res["predicted_amount"]
        accumulated_amounts.append(pred_amt)
        
        forecast_records.append({
            "step": step,
            "date": current_date.strftime('%Y-%m-%d'),
            "day_name": current_date.strftime('%A'),
            "category": chosen_cat,
            "predicted_amount": pred_amt,
            "lower_bound": pred_res["typical_range"]["lower"],
            "upper_bound": pred_res["typical_range"]["upper"]
        })
        
    # Segment into 7, 14, 30 days summaries
    next_7 = forecast_records[:7]
    next_14 = forecast_records[:14]
    next_30 = forecast_records[:30]
    
    total_7 = sum(r["predicted_amount"] for r in next_7)
    total_14 = sum(r["predicted_amount"] for r in next_14)
    total_30 = sum(r["predicted_amount"] for r in next_30)
    
    # Historical tail for combined visualization chart
    hist_chart_data = []
    for _, r in df_hist.tail(20).iterrows():
        hist_chart_data.append({
            "date": pd.to_datetime(r['Date']).strftime('%Y-%m-%d'),
            "actual": float(r['Amount']),
            "predicted": None,
            "category": r['Category'],
            "is_forecast": False
        })
        
    for r in forecast_records:
        hist_chart_data.append({
            "date": r["date"],
            "actual": None,
            "predicted": r["predicted_amount"],
            "lower_bound": r["lower_bound"],
            "upper_bound": r["upper_bound"],
            "category": r["category"],
            "is_forecast": True
        })
        
    return {
        "next_7_days": {
            "total_spending": round(total_7, 2),
            "daily_average": round(total_7 / 7, 2),
            "records": next_7
        },
        "next_14_days": {
            "total_spending": round(total_14, 2),
            "daily_average": round(total_14 / 14, 2),
            "records": next_14
        },
        "next_30_days": {
            "total_spending": round(total_30, 2),
            "daily_average": round(total_30 / 30, 2),
            "records": next_30
        },
        "combined_chart_series": hist_chart_data,
        "disclaimer": (
            "Forecasts are generated using multi-step ML regression conditioned on historical rolling windows. "
            "Because the training set contains ~114 records, these predictions represent educational pattern extrapolations."
        )
    }
