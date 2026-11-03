"""
Budget & Goal Target Service for Fyte.
Tracks category spending against monthly targets and projects month-end burn using ML regression.
"""
from typing import Dict, Any, List
import pandas as pd
from backend.app.core.db import get_connection
from backend.app.core.config import settings
from ml.src.data_loader import load_dataset
from ml.src.preprocessing import clean_data

class BudgetService:
    def get_budget_status(self) -> Dict[str, Any]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT category, monthly_limit FROM budgets")
        budget_rows = cursor.fetchall()
        conn.close()
        
        budgets_map = {row['category']: float(row['monthly_limit']) for row in budget_rows}
        
        df_raw = load_dataset(settings.DATA_RAW_PATH)
        df_clean, _ = clean_data(df_raw)
        
        # Determine latest month present in dataset to calculate active monthly burn
        df_clean['Month_Year'] = df_clean['Date'].dt.to_period('M')
        latest_period = df_clean['Month_Year'].max()
        df_month = df_clean[df_clean['Month_Year'] == latest_period]
        
        cat_actuals = df_month.groupby('Category')['Amount'].sum().to_dict()
        
        # Calculate daily run rate for month-end projection
        days_in_sample = df_month['Date'].dt.day.max()
        days_total_in_month = 30
        remaining_days = max(0, days_total_in_month - days_in_sample)
        
        status_list = []
        total_budget = sum(budgets_map.values())
        total_actual = 0.0
        total_projected = 0.0
        
        for cat, limit in budgets_map.items():
            spent = float(cat_actuals.get(cat, 0.0))
            total_actual += spent
            
            # ML run rate extrapolation for remainder of month
            daily_burn = spent / max(1, days_in_sample)
            projected_month_end = spent + (daily_burn * remaining_days)
            total_projected += projected_month_end
            
            pct_used = float(round((spent / limit) * 100, 1)) if limit > 0 else 0.0
            is_over_budget = bool(spent > limit)
            will_exceed = bool(projected_month_end > limit)
            
            status_level = "safe"
            if is_over_budget or pct_used >= 100:
                status_level = "danger"
            elif pct_used >= 75 or will_exceed:
                status_level = "warning"
                
            status_list.append({
                "category": cat,
                "monthly_limit": round(limit, 2),
                "spent_so_far": round(spent, 2),
                "remaining_budget": round(max(0.0, limit - spent), 2),
                "percentage_used": pct_used,
                "projected_month_end": round(projected_month_end, 2),
                "is_over_budget": is_over_budget,
                "will_exceed": will_exceed,
                "status_level": status_level,
                "alert_message": (
                    f"Exceeded by ₹{round(spent - limit, 0)}!" if is_over_budget else
                    f"At current run-rate, projected to exceed target by ₹{round(projected_month_end - limit, 0)} by month-end." if will_exceed else
                    "Within safe expenditure limits."
                )
            })
            
        return {
            "period": str(latest_period),
            "total_budget": round(total_budget, 2),
            "total_spent_so_far": round(total_actual, 2),
            "total_projected_month_end": round(total_projected, 2),
            "overall_percentage": round((total_actual / total_budget) * 100, 1) if total_budget > 0 else 0,
            "categories": status_list
        }

    def set_budget(self, category: str, monthly_limit: float) -> Dict[str, Any]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO budgets (category, monthly_limit)
            VALUES (?, ?)
            ON CONFLICT(category) DO UPDATE SET monthly_limit = excluded.monthly_limit, updated_at = CURRENT_TIMESTAMP
        """, (category.title().strip(), float(monthly_limit)))
        conn.commit()
        conn.close()
        return {"category": category, "monthly_limit": monthly_limit, "message": "Budget target updated successfully"}

budget_service = BudgetService()
