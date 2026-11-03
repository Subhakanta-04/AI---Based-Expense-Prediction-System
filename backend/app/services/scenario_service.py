"""
What-If Scenario Simulation Service for Fyte.
Simulates behavioral and policy adjustments (cutting specific categories, capping purchases)
and projects adjusted forward 30-day expenditures using the trained ML model.
"""
from typing import Dict, Any, List
from backend.app.services.forecast_service import forecast_service

class ScenarioService:
    def simulate_scenario(
        self,
        cut_food_pct: float = 0.0,
        cut_shopping_pct: float = 0.0,
        cut_entertainment_pct: float = 0.0,
        shopping_cap: float = 0.0
    ) -> Dict[str, Any]:
        # 1. Get baseline 30-day forecast
        baseline = forecast_service.get_forecast(days=30)
        baseline_records = baseline["next_30_days"]["records"]
        baseline_total = baseline["next_30_days"]["total_spending"]
        
        scenario_records = []
        simulated_total = 0.0
        savings_by_cat = {"Food": 0.0, "Shopping": 0.0, "Entertainment": 0.0, "Other": 0.0}
        
        for r in baseline_records:
            cat = r["category"]
            orig_amt = r["predicted_amount"]
            adj_amt = orig_amt
            
            if cat == "Food" and cut_food_pct > 0:
                reduction = orig_amt * (cut_food_pct / 100.0)
                adj_amt = max(50.0, orig_amt - reduction)
                savings_by_cat["Food"] += (orig_amt - adj_amt)
            elif cat == "Shopping":
                if cut_shopping_pct > 0:
                    reduction = orig_amt * (cut_shopping_pct / 100.0)
                    adj_amt = max(100.0, orig_amt - reduction)
                if shopping_cap > 0 and adj_amt > shopping_cap:
                    adj_amt = shopping_cap
                savings_by_cat["Shopping"] += (orig_amt - adj_amt)
            elif cat == "Entertainment" and cut_entertainment_pct > 0:
                reduction = orig_amt * (cut_entertainment_pct / 100.0)
                adj_amt = max(50.0, orig_amt - reduction)
                savings_by_cat["Entertainment"] += (orig_amt - adj_amt)
                
            simulated_total += adj_amt
            scenario_records.append({
                "step": r["step"],
                "date": r["date"],
                "day_name": r["day_name"],
                "category": cat,
                "baseline_amount": orig_amt,
                "simulated_amount": round(adj_amt, 2),
                "daily_savings": round(orig_amt - adj_amt, 2)
            })
            
        total_savings = max(0.0, baseline_total - simulated_total)
        savings_pct = round((total_savings / baseline_total * 100), 1) if baseline_total > 0 else 0.0
        
        return {
            "baseline_30_day_total": round(baseline_total, 2),
            "scenario_30_day_total": round(simulated_total, 2),
            "projected_monthly_savings": round(total_savings, 2),
            "savings_percentage": savings_pct,
            "category_savings": {k: round(v, 2) for k, v in savings_by_cat.items()},
            "daily_comparison": scenario_records,
            "verdict": f"Applying these behavioral adjustments is projected to reduce your next month's spending by ₹{round(total_savings, 0):,} ({savings_pct}% reduction)."
        }

scenario_service = ScenarioService()
