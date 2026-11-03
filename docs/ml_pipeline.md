# Fyte: Machine Learning Pipeline Specification

## Pipeline Flow

```
[expense_data.csv]
       │
       ▼
[Data Preprocessing]
  • Date parsing (ISO 8601)
  • Non-positive value handling
  • Deduplication & whitespace trimming
  • Chronological sorting by Date
       │
       ▼
[Feature Engineering]
  • Strict backward shift: shift(1)
  • Rolling 3, 7, 14-day averages
  • Previous 7, 14, 30-day totals
  • Day of week, month, Is_Weekend
  • Cyclical sine/cosine transformations
  • Dynamic One-Hot Encodings
       │
       ▼
[Time-Aware Split]
  • 80% Early Records -> Train (91 records)
  • 20% Late Records -> Test (23 records)
       │
       ▼
[Model Training & Cross-Benchmarking]
  ├── Linear Regression
  ├── Random Forest Regressor (n_estimators=100, max_depth=5)
  ├── Gradient Boosting Regressor (n_estimators=80, lr=0.05)
  └── XGBoost Regressor (n_estimators=80, lr=0.05)
       │
       ▼
[Evaluation & Metrics Computation]
  • MAE, MSE, RMSE, R² on Test Set
       │
       ▼
[Best Model Selection & Persistence]
  • Primary: Lowest RMSE (₹297.90)
  • Secondary: Highest R² (0.5764)
  • Winner: Random Forest Regressor
  • Saved: model.joblib, preprocessor.joblib, metadata.json
```

## Zero Data Leakage Guarantee
Standard cross-validation (e.g. `KFold(shuffle=True)`) leaks future trends into past predictions. In Fyte:
1. Data is sorted strictly by date.
2. All rolling features are shifted by 1 so the current day's amount is never observed when computing lag features.
3. Train/test split splits strictly at index $0.8 \times N$.
