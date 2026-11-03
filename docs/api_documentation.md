# Fyte: REST API Documentation

Base URL: `http://localhost:8000/api`

## Authentication Endpoints
- `POST /auth/register`: Create a new user account with hashed password in SQLite.
- `POST /auth/login`: Authenticate email & password, returns JWT session token.
- `GET /auth/me`: Validates session token and returns active user profile.
- `POST /auth/logout`: Cleans session token.

## Budget & Goal Targets Endpoints
- `GET /budget/status`: Returns monthly limits, actual current spend, remaining balance, and ML month-end overspend projections.
- `POST /budget/set`: Sets or updates the monthly spending limit for a category.

## Live Expense Ingestion Endpoints
- `POST /expenses/add`: Records a new expense into `expense_data.csv` and returns immediate real-time IQR anomaly verification.

## Scenario Simulation Endpoints
- `POST /ml/scenario-simulation`: Simulates behavioral adjustments (e.g. cutting Food by 20%, Shopping cap at ₹2,500) and projects 30-day savings.

## Dataset Endpoints
- `GET /dataset/info`: Returns record count, column schemas, null counts, and summary statistics.
- `GET /dataset/preview?limit=50`: Returns first N records of the dataset.
- `POST /dataset/upload`: Uploads a replacement CSV file with schema validation.
- `POST /dataset/reset`: Restores the default `expense_data.csv`.

## EDA Endpoints
- `GET /eda/summary`: High-level expense metrics, category breakdown, spending trend, weekend vs weekday.
- `GET /eda/charts`: Time series points, monthly breakdown, day of week distribution, top expenses.
- `GET /eda/correlation`: Correlation matrix for engineered numerical features.

## Machine Learning Endpoints
- `POST /ml/train`: Triggers the end-to-end ML training pipeline.
- `GET /ml/models`: Retrieves model comparison table with MAE, MSE, RMSE, R².
- `GET /ml/best-model`: Metadata of champion model.
- `GET /ml/metrics`: Formatted evaluation metrics.
- `GET /ml/feature-importance`: Feature importance ranking from the best model.
- `GET /ml/actual-vs-predicted`: Test set actual vs predicted values with residuals.

## Prediction & Forecast Endpoints
- `POST /ml/predict`: Generates predicted amount and reliability assessment for an expense instance.
- `GET /ml/forecast?days=30`: Multi-step forward projection for 7, 14, and 30 days.

## Anomalies & Insights Endpoints
- `GET /ml/anomalies`: Anomaly detection results via IQR and Z-Score methods.
- `GET /ml/insights`: Rule-based and statistical AI insights grounded in the dataset.
- `GET /reports/summary`: Full markdown project report.
