"""
Exploratory Data Analysis (EDA) Service for Fyte.
Generates comprehensive statistical profiles, charts, correlation matrices, and trend metrics.
"""
import os
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from backend.app.core.config import settings
from ml.src.data_loader import load_dataset
from ml.src.preprocessing import clean_data
from ml.src.feature_engineering import ExpenseFeatureEngineer

class EDAService:
    def __init__(self):
        self.raw_path = settings.DATA_RAW_PATH

    def _get_cleaned_df(self) -> pd.DataFrame:
        if not os.path.exists(self.raw_path):
            raise FileNotFoundError("Primary expense dataset not found.")
        df_raw = load_dataset(self.raw_path)
        df_clean, _ = clean_data(df_raw)
        return df_clean

    def get_eda_summary(self) -> Dict[str, Any]:
        df = self._get_cleaned_df()
        
        total_expense = float(df['Amount'].sum())
        avg_expense = float(round(df['Amount'].mean(), 2))
        max_expense = float(df['Amount'].max())
        min_expense = float(df['Amount'].min())
        median_expense = float(df['Amount'].median())
        
        # Category breakdown
        cat_group = df.groupby('Category')['Amount'].agg(['sum', 'mean', 'count', 'max']).reset_index()
        cat_group['percentage'] = (cat_group['sum'] / total_expense * 100).round(2)
        cat_group = cat_group.sort_values(by='sum', ascending=False)
        
        category_breakdown = []
        for _, r in cat_group.iterrows():
            category_breakdown.append({
                "category": r['Category'],
                "total_spent": round(float(r['sum']), 2),
                "average_spent": round(float(r['mean']), 2),
                "transaction_count": int(r['count']),
                "highest_expense": round(float(r['max']), 2),
                "percentage_of_total": float(r['percentage'])
            })
            
        top_cat = category_breakdown[0] if category_breakdown else {"category": "N/A", "percentage_of_total": 0}
        
        # Payment method breakdown
        pm_group = df.groupby('Payment_Method')['Amount'].agg(['sum', 'count', 'mean']).reset_index()
        pm_group = pm_group.sort_values(by='count', ascending=False)
        payment_breakdown = []
        for _, r in pm_group.iterrows():
            payment_breakdown.append({
                "payment_method": r['Payment_Method'],
                "total_spent": round(float(r['sum']), 2),
                "transaction_count": int(r['count']),
                "average_spent": round(float(r['mean']), 2),
                "percentage_volume": round(float(r['count'] / len(df) * 100), 2)
            })
            
        most_used_pm = payment_breakdown[0] if payment_breakdown else {"payment_method": "N/A"}
        
        # Weekend vs Weekday analysis
        df['DayOfWeek'] = df['Date'].dt.dayofweek
        df['IsWeekend'] = df['DayOfWeek'].apply(lambda x: "Weekend" if x in [5, 6] else "Weekday")
        wk_stats = df.groupby('IsWeekend')['Amount'].agg(['mean', 'sum', 'count']).to_dict(orient="index")
        
        # Spending Trend calculation (Linear slope across chronological records)
        x_indices = np.arange(len(df))
        y_amounts = df['Amount'].values
        slope, intercept = np.polyfit(x_indices, y_amounts, 1)
        trend_direction = "Increasing" if slope > 0.5 else ("Decreasing" if slope < -0.5 else "Stable")
        
        # Compare first 30 days vs last 30 days
        half_n = len(df) // 2
        first_half_avg = df.iloc[:half_n]['Amount'].mean()
        second_half_avg = df.iloc[half_n:]['Amount'].mean()
        trend_percentage_change = round(((second_half_avg - first_half_avg) / first_half_avg) * 100, 2)
        
        return {
            "total_records": len(df),
            "total_expense": round(total_expense, 2),
            "average_expense": avg_expense,
            "median_expense": median_expense,
            "max_expense": max_expense,
            "min_expense": min_expense,
            "top_category": top_cat["category"],
            "top_category_percentage": top_cat["percentage_of_total"],
            "most_used_payment_method": most_used_pm["payment_method"],
            "categories": category_breakdown,
            "payment_methods": payment_breakdown,
            "spending_trend": {
                "direction": trend_direction,
                "slope": round(float(slope), 3),
                "percentage_change": trend_percentage_change,
                "description": f"Overall expenses show a {trend_direction.lower()} trend with a {abs(trend_percentage_change)}% shift between earlier and recent cycles."
            },
            "weekend_vs_weekday": {
                "weekend_mean": round(float(wk_stats.get("Weekend", {}).get("mean", 0)), 2),
                "weekend_total": round(float(wk_stats.get("Weekend", {}).get("sum", 0)), 2),
                "weekend_count": int(wk_stats.get("Weekend", {}).get("count", 0)),
                "weekday_mean": round(float(wk_stats.get("Weekday", {}).get("mean", 0)), 2),
                "weekday_total": round(float(wk_stats.get("Weekday", {}).get("sum", 0)), 2),
                "weekday_count": int(wk_stats.get("Weekday", {}).get("count", 0)),
            }
        }

    def get_charts_data(self) -> Dict[str, Any]:
        df = self._get_cleaned_df()
        
        # 1. Timeline series
        timeline = []
        for _, r in df.iterrows():
            timeline.append({
                "date": r['Date'].strftime('%Y-%m-%d'),
                "amount": float(r['Amount']),
                "category": r['Category'],
                "payment_method": r['Payment_Method'],
                "description": r['Description']
            })
            
        # 2. Monthly aggregates
        df['Month_Year'] = df['Date'].dt.strftime('%b %Y')
        df['Month_Num'] = df['Date'].dt.to_period('M')
        monthly_grouped = df.groupby('Month_Num').agg(
            total=('Amount', 'sum'),
            average=('Amount', 'mean'),
            count=('Amount', 'count')
        ).reset_index()
        monthly_grouped['month'] = monthly_grouped['Month_Num'].astype(str)
        monthly_series = []
        for _, r in monthly_grouped.iterrows():
            monthly_series.append({
                "month": r['month'],
                "total": round(float(r['total']), 2),
                "average": round(float(r['average']), 2),
                "count": int(r['count'])
            })
            
        # 3. Day of week pattern
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        df['DayName'] = df['Date'].dt.day_name()
        day_group = df.groupby('DayName').agg(
            total=('Amount', 'sum'),
            average=('Amount', 'mean'),
            count=('Amount', 'count')
        ).reindex(day_names).fillna(0).reset_index()
        
        daily_pattern = []
        for _, r in day_group.iterrows():
            daily_pattern.append({
                "day": r['DayName'],
                "total": round(float(r['total']), 2),
                "average": round(float(r['average']), 2),
                "count": int(r['count'])
            })
            
        # 4. Top 10 highest expenses
        top_expenses = []
        for _, r in df.sort_values(by='Amount', ascending=False).head(10).iterrows():
            top_expenses.append({
                "date": r['Date'].strftime('%Y-%m-%d'),
                "category": r['Category'],
                "amount": float(r['Amount']),
                "payment_method": r['Payment_Method'],
                "description": r['Description']
            })
            
        # 5. Amount distribution histogram buckets
        bins = [0, 250, 500, 1000, 2000, 5000]
        labels = ["₹0-250", "₹250-500", "₹500-1k", "₹1k-2k", "₹2k+"]
        df['Bucket'] = pd.cut(df['Amount'], bins=bins, labels=labels, include_lowest=True)
        bucket_counts = df['Bucket'].value_counts()[labels].to_dict()
        distribution_buckets = [{"range": k, "count": int(v)} for k, v in bucket_counts.items()]
        
        return {
            "timeline": timeline,
            "monthly": monthly_series,
            "daily_pattern": daily_pattern,
            "top_expenses": top_expenses,
            "distribution_buckets": distribution_buckets
        }

    def get_correlation_data(self) -> Dict[str, Any]:
        df = self._get_cleaned_df()
        engineer = ExpenseFeatureEngineer().fit(df)
        df_featured = engineer.extract_features(df, is_training=True)
        
        cols = [
            'Amount', 'Previous_Expense', 'Rolling_3_Day_Average', 'Rolling_7_Day_Average',
            'Rolling_14_Day_Average', 'Previous_7_Day_Total', 'Transaction_Count', 'Is_Weekend'
        ]
        available_cols = [c for c in cols if c in df_featured.columns]
        corr_matrix = df_featured[available_cols].corr().round(3).fillna(0).to_dict()
        
        return {
            "features": available_cols,
            "correlation_matrix": corr_matrix
        }

eda_service = EDAService()
