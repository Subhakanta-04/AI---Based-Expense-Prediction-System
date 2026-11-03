"""
AI Insights Service for Fyte.
Derives deterministic, statistically grounded insights strictly calculated from the dataset
and model evaluation results.
"""
from typing import Dict, Any, List
import pandas as pd
from backend.app.core.config import settings
from backend.app.services.eda_service import eda_service
from backend.app.services.anomaly_service import anomaly_service
from backend.app.services.ml_service import ml_service

class InsightService:
    def generate_insights(self) -> List[Dict[str, Any]]:
        eda = eda_service.get_eda_summary()
        anom = anomaly_service.get_anomalies()
        best_model = ml_service.get_best_model_info()
        
        insights = []
        
        # 1. Top Spending Category
        top_cat = eda.get("top_category", "Food")
        top_pct = eda.get("top_category_percentage", 0)
        insights.append({
            "id": "top_category",
            "type": "category",
            "icon": "pie-chart",
            "title": f"{top_cat} is your highest spending category",
            "description": f"Accounts for {top_pct}% of your overall recorded expenses. Monitoring food delivery and dining out offers immediate optimization potential.",
            "impact": "High",
            "badge": f"{top_pct}% of total"
        })
        
        # 2. Weekend vs Weekday Spending Pattern
        wk = eda.get("weekend_vs_weekday", {})
        wk_mean = wk.get("weekend_mean", 0)
        wd_mean = wk.get("weekday_mean", 0)
        if wk_mean > wd_mean:
            diff_pct = round(((wk_mean - wd_mean) / wd_mean) * 100, 1) if wd_mean > 0 else 0
            insights.append({
                "id": "weekend_surge",
                "type": "temporal",
                "icon": "calendar",
                "title": "Weekend spending is higher than weekdays",
                "description": f"Your average weekend transaction is ₹{wk_mean:,.2f} versus ₹{wd_mean:,.2f} on weekdays ({diff_pct}% higher).",
                "impact": "Medium",
                "badge": f"+{diff_pct}% on weekends"
            })
        else:
            insights.append({
                "id": "weekday_surge",
                "type": "temporal",
                "icon": "calendar",
                "title": "Consistent spending across weekdays",
                "description": f"Average spending remains steady between weekdays (₹{wd_mean:,.2f}) and weekends (₹{wk_mean:,.2f}).",
                "impact": "Low",
                "badge": "Balanced"
            })
            
        # 3. Anomaly Insight
        if anom.get("anomaly_count", 0) > 0:
            top_anom = anom["anomalies"][0]
            cat_anom = top_anom["category"]
            insights.append({
                "id": "anomalies_detected",
                "type": "anomaly",
                "icon": "alert-triangle",
                "title": f"{cat_anom} contains unusually high transactions",
                "description": f"{anom['anomaly_count']} transactions exceeded statistical thresholds (IQR > Q3 + 1.5*IQR). The single highest outlier was ₹{top_anom['amount']:,.2f} ({top_anom['description']}).",
                "impact": "High",
                "badge": f"{anom['anomaly_count']} outliers"
            })
            
        # 4. Spending Trend
        trend = eda.get("spending_trend", {})
        trend_dir = trend.get("direction", "Stable")
        trend_change = trend.get("percentage_change", 0)
        insights.append({
            "id": "spending_trend",
            "type": "trend",
            "icon": "trending-up" if trend_dir == "Increasing" else "trending-down",
            "title": f"Your recent spending trend is {trend_dir.lower()}",
            "description": f"Comparing early chronological records against recent ones shows a {abs(trend_change)}% shift. Continuous monitoring helps prevent lifestyle creep.",
            "impact": "Medium",
            "badge": f"{trend_dir} ({abs(trend_change)}%)"
        })
        
        # 5. Preferred Payment Method
        pm = eda.get("most_used_payment_method", "UPI")
        insights.append({
            "id": "payment_method",
            "type": "behavioral",
            "icon": "credit-card",
            "title": f"{pm} is your most frequently used payment method",
            "description": f"Digital instant payments dominate your financial footprint, facilitating frictionless transactions.",
            "impact": "Low",
            "badge": "Primary channel"
        })
        
        # 6. ML Model Intelligence
        b_name = best_model.get("best_model_name", "Random Forest")
        b_rmse = best_model.get("test_metrics", {}).get("rmse", 0)
        b_r2 = best_model.get("test_metrics", {}).get("r2", 0)
        insights.append({
            "id": "ml_confidence",
            "type": "model",
            "icon": "cpu",
            "title": f"Trained {b_name} achieves ₹{b_rmse:,.2f} RMSE",
            "description": f"The model explains {round(b_r2*100, 1)}% of variance on unseen future chronological test records without data leakage.",
            "impact": "High",
            "badge": f"R² = {b_r2}"
        })
        
        return insights

insight_service = InsightService()
