# ⚡ Fyte
### *"Understand your spending. Predict your future."*

Fyte is a complete, full-stack Machine Learning project and fintech web application designed to analyze personal expenditure patterns, isolate statistical anomalies, and forecast future spending using time-aware supervised regression.

Built specifically as an exemplary **College / Capstone Machine Learning Project**, the core of the application centers on authentic, rigorous data science principles:
**Dataset → Data Preprocessing → EDA → Feature Engineering → ML Training → Model Comparison → Evaluation → Prediction → Visualization → Insights**

---

## 🌟 Key Highlights & Engineering Features

- **User Authentication (Login & Logout):** SQLite-backed user credentials, salted SHA-256 password hashing, token sessions, and **1-Click Quick Demo Sign In** (`Dr. Alex Morgan` & `Aarav Sharma`).
- **Target Budget Tracker & ML Overspend Prediction:** Set monthly category spending goals with real-time progress bars and automated month-end burn rate forecasting.
- **Interactive "What-If" Scenario Simulator:** Adjust sliders for category reductions and purchase ceilings to forecast monthly monetary savings.
- **Live Transaction Ingestion with Instant Anomaly Checking:** "+ Record Expense" modal that appends records and immediately flags statistical outliers.
- **College Viva & Defense Assistant:** Built-in interactive viva preparation flashcards covering math, code, and conceptual defense questions.
- **Primary Dataset (`expense_data.csv`):** 114 real-world chronological expense transactions spanning 6 months (January 2024 to June 2024).
- **Zero Future Data Leakage:** All historical rolling and lag metrics (`Previous_Expense`, `Rolling_7_Day_Average`, etc.) strictly enforce causal shifting (`.shift(1)`).
- **Time-Aware Chronological Train/Test Split:** 80% earlier records for training, 20% later records for testing—preventing lookahead bias.
- **Multi-Model Benchmark Leaderboard:**
  - 🌲 **Random Forest Regressor (Champion):** Test RMSE ₹297.90 | $R^2 = 0.5764$
  - ⚡ **Gradient Boosting Regressor:** Test RMSE ₹338.72 | $R^2 = 0.4523$
  - 🚀 **XGBoost Regressor:** Test RMSE ₹355.12 | $R^2 = 0.3980$
  - 📈 **Linear Regression (Baseline):** Test RMSE ₹395.00 | $R^2 = 0.2552$
- **Feature Importance:** Dynamic extraction from tree models highlighting high-impact drivers (e.g. `Category_Shopping` 44.7%, `Desc_Length` 12.6%, `Payment_Credit Card` 7.2%).
- **Interactive Prediction Simulator:** Instant expense estimation with empirical reliability scoring based on test error margins.
- **Multi-Step Forecast Engine:** Autoregressive projections for Next 7, 14, and 30 days.
- **Statistical Anomaly Detection:** IQR and Z-Score detection isolating unusual outliers globally and within specific categories.
- **Statistically Grounded AI Insights:** Dynamically computed spending takeaways with zero hallucinated advice.
- **Jupyter Notebooks:** Complete, structured notebooks under `ml/notebooks/` ready for demonstration and viva review.

---

## 📁 Project Structure

```text
d:\Expenses\
├── README.md
├── requirements.txt
├── .gitignore
├── .env.example
├── expense_data.csv                 # Primary dataset
├── data/
│   ├── raw/
│   │   └── expense_data.csv
│   └── processed/
│       └── processed_expenses.csv
├── ml/
│   ├── notebooks/
│   │   ├── 01_EDA.ipynb
│   │   ├── 02_Data_Preprocessing.ipynb
│   │   ├── 03_Feature_Engineering.ipynb
│   │   ├── 04_Model_Training.ipynb
│   │   └── 05_Model_Evaluation.ipynb
│   ├── src/
│   │   ├── data_loader.py
│   │   ├── preprocessing.py
│   │   ├── feature_engineering.py
│   │   ├── train.py
│   │   ├── evaluate.py
│   │   ├── predict.py
│   │   ├── model_selection.py
│   │   ├── anomaly_detection.py
│   │   ├── forecast.py
│   │   └── pipeline.py
│   ├── models/
│   │   └── best_model/
│   │       ├── model.joblib
│   │       ├── preprocessor.joblib
│   │       └── metadata.json
│   ├── results/
│   │   ├── metrics.json
│   │   ├── model_comparison.csv
│   │   ├── predictions.csv
│   │   └── feature_importance.csv
│   └── visualizations/
│       ├── expense_trend.png
│       ├── category_distribution.png
│       ├── correlation_heatmap.png
│       ├── actual_vs_predicted.png
│       └── model_comparison.png
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/ (dataset, eda, ml, predictions, forecast, anomalies, insights, reports)
│   │   ├── services/
│   │   ├── schemas/
│   │   └── core/
│   └── tests/
├── frontend/                        # React + TypeScript + Tailwind CSS
├── reports/
│   ├── figures/
│   └── project_report.md            # Comprehensive 15-section report
└── docs/
    ├── architecture.md
    ├── ml_pipeline.md
    ├── dataset_description.md
    ├── api_documentation.md
    └── viva_questions.md
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Startup

Make sure Python 3.10+ is installed.

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run initial ML pipeline (trains models, saves joblib artifacts & generates figures)
python -m ml.src.pipeline

# 3. Run backend unit tests (11 automated test suites)
python -m unittest discover -s backend/tests

# 4. Start FastAPI server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend Setup & Startup

```bash
cd frontend
npm install
npm run dev
```
The modern dashboard will launch at: [http://localhost:5173](http://localhost:5173)

---

