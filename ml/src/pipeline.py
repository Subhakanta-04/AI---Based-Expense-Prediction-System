"""
End-to-End ML Pipeline Runner for Fyte.
Coordinates ingestion, preprocessing, feature engineering, time-aware training,
evaluation, model comparison, persistence, and chart generation.
"""
import os
import json
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from ml.src.data_loader import load_dataset, validate_dataset, get_dataset_summary
from ml.src.preprocessing import clean_data
from ml.src.feature_engineering import ExpenseFeatureEngineer
from ml.src.train import time_based_train_test_split, train_and_evaluate_all
from ml.src.model_selection import select_and_persist_best_model
from ml.src.anomaly_detection import detect_anomalies

def run_complete_pipeline(
    csv_path: str = "data/raw/expense_data.csv",
    models_dir: str = "ml/models",
    results_dir: str = "ml/results",
    vis_dir: str = "ml/visualizations",
    figures_dir: str = "reports/figures"
):
    print(f"[PIPELINE] 1. Loading dataset from {csv_path}...")
    df_raw = load_dataset(csv_path)
    is_valid, msg = validate_dataset(df_raw)
    if not is_valid:
        raise ValueError(f"Dataset validation failed: {msg}")
        
    print(f"[PIPELINE] 2. Preprocessing & Data Cleaning...")
    df_clean, audit = clean_data(df_raw)
    os.makedirs("data/processed", exist_ok=True)
    df_clean.to_csv("data/processed/processed_expenses.csv", index=False)
    
    print(f"[PIPELINE] 3. Feature Engineering...")
    engineer = ExpenseFeatureEngineer()
    engineer.fit(df_clean)
    df_featured = engineer.extract_features(df_clean, is_training=True)
    
    print(f"[PIPELINE] 4. Chronological 80/20 Train-Test Split...")
    train_df, test_df = time_based_train_test_split(df_featured, train_ratio=0.8)
    
    feature_cols = engineer.feature_columns
    target_col = "Amount"
    
    X_train = train_df[feature_cols]
    y_train = train_df[target_col]
    X_test = test_df[feature_cols]
    y_test = test_df[target_col]
    
    print(f"  Training on {len(X_train)} chronological records, testing on {len(X_test)} records.")
    print(f"  Total engineered features: {len(feature_cols)}")
    
    print(f"[PIPELINE] 5. Training Candidate Regression Models...")
    results = train_and_evaluate_all(X_train, y_train, X_test, y_test)
    
    test_dates = test_df['Date'].dt.strftime('%Y-%m-%d').tolist()
    
    print(f"[PIPELINE] 6. Model Evaluation & Best Selection...")
    best_name, metadata = select_and_persist_best_model(
        model_results=results,
        preprocessor=engineer,
        feature_names=feature_cols,
        test_dates=test_dates,
        output_dir=models_dir,
        results_dir=results_dir
    )
    
    print(f"  Best Model: {best_name} (RMSE: INR {metadata['test_metrics']['rmse']}, R2: {metadata['test_metrics']['r2']})")
    
    print(f"[PIPELINE] 7. Generating Visualizations...")
    generate_all_visualizations(df_clean, df_featured, results, best_name, test_dates, y_test.values, vis_dir, figures_dir, feature_cols=feature_cols)
    
    print("[PIPELINE] Complete pipeline execution successfully finished!")
    return {
        "status": "success",
        "best_model": best_name,
        "metrics": metadata["test_metrics"],
        "num_records": len(df_clean),
        "audit": audit
    }

def generate_all_visualizations(df_clean, df_featured, results, best_name, test_dates, y_test_act, vis_dir, figures_dir, feature_cols=None):
    for d in [vis_dir, figures_dir]:
        os.makedirs(d, exist_ok=True)
        
    plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
    
    # 1. Expense Trend Over Time
    plt.figure(figsize=(10, 5))
    plt.plot(pd.to_datetime(df_clean['Date']), df_clean['Amount'], marker='o', color='#3b82f6', linewidth=2, markersize=4)
    plt.title('Daily Expense Trend Over Time', fontsize=14, fontweight='bold', pad=12)
    plt.xlabel('Date')
    plt.ylabel('Expense Amount (₹)')
    plt.tight_layout()
    plt.savefig(os.path.join(vis_dir, 'expense_trend.png'), dpi=150)
    plt.savefig(os.path.join(figures_dir, 'expense_trend.png'), dpi=150)
    plt.close()
    
    # 2. Category Distribution
    plt.figure(figsize=(8, 6))
    cat_tot = df_clean.groupby('Category')['Amount'].sum().sort_values(ascending=False)
    colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1']
    plt.pie(cat_tot, labels=cat_tot.index, autopct='%1.1f%%', startangle=140, colors=colors[:len(cat_tot)], explode=[0.05]*len(cat_tot))
    plt.title('Total Spending by Category', fontsize=14, fontweight='bold', pad=12)
    plt.tight_layout()
    plt.savefig(os.path.join(vis_dir, 'category_distribution.png'), dpi=150)
    plt.savefig(os.path.join(figures_dir, 'category_distribution.png'), dpi=150)
    plt.close()
    
    # 3. Payment Method Distribution
    plt.figure(figsize=(8, 5))
    pm_counts = df_clean['Payment_Method'].value_counts()
    sns.barplot(x=pm_counts.index, y=pm_counts.values, palette='Blues_r')
    plt.title('Transaction Volume by Payment Method', fontsize=14, fontweight='bold', pad=12)
    plt.xlabel('Payment Method')
    plt.ylabel('Number of Transactions')
    plt.tight_layout()
    plt.savefig(os.path.join(vis_dir, 'payment_method.png'), dpi=150)
    plt.savefig(os.path.join(figures_dir, 'payment_method.png'), dpi=150)
    plt.close()
    
    # 4. Correlation Heatmap
    plt.figure(figsize=(10, 8))
    corr_cols = [
        'Amount', 'Previous_Expense', 'Rolling_3_Day_Average', 'Rolling_7_Day_Average',
        'Rolling_14_Day_Average', 'Previous_7_Day_Total', 'Transaction_Count', 'Is_Weekend'
    ]
    corr_cols = [c for c in corr_cols if c in df_featured.columns]
    corr_mat = df_featured[corr_cols].corr()
    sns.heatmap(corr_mat, annot=True, cmap='coolwarm', fmt=".2f", linewidths=0.5)
    plt.title('Feature Correlation Heatmap', fontsize=14, fontweight='bold', pad=12)
    plt.tight_layout()
    plt.savefig(os.path.join(vis_dir, 'correlation_heatmap.png'), dpi=150)
    plt.savefig(os.path.join(figures_dir, 'correlation_heatmap.png'), dpi=150)
    plt.close()
    
    # 5. Actual vs Predicted
    best_data = results[best_name]
    y_pred = best_data["test_predictions"]
    plt.figure(figsize=(11, 5))
    plt.plot(range(len(y_test_act)), y_test_act, label='Actual Expense', marker='o', color='#10b981', linewidth=2)
    plt.plot(range(len(y_pred)), y_pred, label=f'Predicted ({best_name})', marker='s', linestyle='--', color='#6366f1', linewidth=2)
    plt.title(f'Actual vs Predicted Expenses on Test Set ({best_name})', fontsize=14, fontweight='bold', pad=12)
    plt.xlabel('Test Observation Sequence')
    plt.ylabel('Amount (₹)')
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(vis_dir, 'actual_vs_predicted.png'), dpi=150)
    plt.savefig(os.path.join(figures_dir, 'actual_vs_predicted.png'), dpi=150)
    plt.close()
    
    # 6. Model Comparison Chart (RMSE & R2)
    fig, ax1 = plt.subplots(figsize=(9, 5))
    models = list(results.keys())
    rmses = [results[m]["test_metrics"]["rmse"] for m in models]
    r2s = [results[m]["test_metrics"]["r2"] for m in models]
    
    x = np.arange(len(models))
    width = 0.35
    
    rects1 = ax1.bar(x - width/2, rmses, width, label='Test RMSE (₹, Lower is better)', color='#f59e0b')
    ax1.set_ylabel('RMSE (₹)', color='#d97706')
    ax1.set_xticks(x)
    ax1.set_xticklabels(models, rotation=15)
    
    ax2 = ax1.twinx()
    rects2 = ax2.bar(x + width/2, r2s, width, label='Test R² (Higher is better)', color='#3b82f6')
    ax2.set_ylabel('R² Score', color='#2563eb')
    
    plt.title('ML Model Performance Comparison', fontsize=14, fontweight='bold', pad=12)
    fig.tight_layout()
    plt.savefig(os.path.join(vis_dir, 'model_comparison.png'), dpi=150)
    plt.savefig(os.path.join(figures_dir, 'model_comparison.png'), dpi=150)
    plt.close()
    
    # 7. Feature Importance
    best_model_inst = results[best_name]["model_instance"]
    actual_model = best_model_inst.regressor_ if hasattr(best_model_inst, "regressor_") else best_model_inst
    imps = None
    if hasattr(actual_model, "feature_importances_"):
        imps = actual_model.feature_importances_
    elif hasattr(actual_model, "coef_"):
        imps = np.abs(actual_model.coef_)
        
    if imps is not None and len(imps) > 0:
        feat_names = list(feature_cols) if feature_cols is not None else [f"feat_{i}" for i in range(len(imps))]
        top_k = min(10, len(imps))
        top_indices = np.argsort(imps)[-top_k:]
        plt.figure(figsize=(9, 5))
        plt.barh(range(len(top_indices)), imps[top_indices], color='#8b5cf6')
        plt.yticks(range(len(top_indices)), [feat_names[i] for i in top_indices])
        plt.xlabel('Importance')
        plt.title(f'Top Feature Importances ({best_name})', fontsize=14, fontweight='bold', pad=12)
        plt.tight_layout()
        plt.savefig(os.path.join(vis_dir, 'feature_importance.png'), dpi=150)
        plt.savefig(os.path.join(figures_dir, 'feature_importance.png'), dpi=150)
        plt.close()
        
    # 8. Anomaly Detection Visualization
    anom_res = detect_anomalies(df_clean)
    anom_indices = [i for i, r in enumerate(df_clean.iterrows()) if any(a['date'] == pd.to_datetime(r[1]['Date']).strftime('%Y-%m-%d') and a['amount'] == r[1]['Amount'] for a in anom_res['anomalies'])]
    plt.figure(figsize=(10, 5))
    plt.scatter(range(len(df_clean)), df_clean['Amount'], color='#3b82f6', alpha=0.6, label='Normal Expense', s=35)
    if anom_indices:
        plt.scatter(anom_indices, df_clean.iloc[anom_indices]['Amount'], color='#ef4444', s=90, label='Anomaly (IQR Outlier)', edgecolor='black')
    plt.axhline(anom_res['global_iqr_threshold'], color='#dc2626', linestyle='--', label=f"Global IQR Upper Fence (₹{anom_res['global_iqr_threshold']:,.0f})")
    plt.title('Expense Anomaly Detection (IQR Method)', fontsize=14, fontweight='bold', pad=12)
    plt.xlabel('Chronological Transaction Sequence')
    plt.ylabel('Amount (₹)')
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(vis_dir, 'anomaly_detection.png'), dpi=150)
    plt.savefig(os.path.join(figures_dir, 'anomaly_detection.png'), dpi=150)
    plt.close()

if __name__ == "__main__":
    run_complete_pipeline()
