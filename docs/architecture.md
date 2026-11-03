# Fyte: System Architecture

## High-Level Architectural Diagram

```
+--------------------------------------------------------------------------------+
|                               Frontend Layer                                   |
|  React 18 + TypeScript + Tailwind CSS + Lucide Icons + Recharts Data Viz       |
|  • Dashboard       • Dataset Management   • Interactive EDA                    |
|  • Train Model UI  • Model Comparison     • Expense Prediction Simulator       |
|  • 30-Day Forecast • Anomaly Explorer     • AI Behavioral Insights             |
+---------------------------------------+----------------------------------------+
                                        |  REST API (Axios / Fetch JSON)
                                        v
+--------------------------------------------------------------------------------+
|                               Backend Layer (FastAPI)                          |
|  FastAPI Application • Async Endpoints • Pydantic Schema Validation • CORS     |
|  +--------------------+---------------------+--------------------+-------------+
|  | /api/dataset/*     | /api/eda/*          | /api/ml/*          | /api/reports|
|  +--------------------+---------------------+--------------------+-------------+
|  | DatasetService     | EDAService          | MLService          | ForecastSvc |
+---------------------------------------+----------------------------------------+
                                        |  Python In-Memory & File IO
                                        v
+--------------------------------------------------------------------------------+
|                              Machine Learning Engine                           |
|  • Data Ingestion (data_loader.py) -> Preprocessing & Cleaning (preprocessing.py)|
|  • Strict Causal Feature Engineering (feature_engineering.py)                  |
|  • Time-Aware Train/Test Split (80% Train, 20% Chronological Test)             |
|  • Multi-Model Training: Linear Reg, Random Forest, Gradient Boost, XGBoost    |
|  • Evaluation & Metrics: MAE, MSE, RMSE, R² (evaluate.py)                      |
|  • Persistence: Joblib model.joblib, preprocessor.joblib, metadata.json        |
|  • Statistical Anomaly Engine (IQR + Z-Score)                                  |
+--------------------------------------------------------------------------------+
```

## Directory Structure
- `data/`: Raw CSV files and processed clean files.
- `ml/`: Preprocessing, feature engineering, model training, evaluation, persistence, and notebooks.
- `backend/`: FastAPI application, endpoints, schemas, and unit tests.
- `frontend/`: React single-page application with responsive fintech dashboard.
- `reports/`: Complete project report and generated figures.
- `docs/`: Technical guides, API documentation, and college viva questions.
