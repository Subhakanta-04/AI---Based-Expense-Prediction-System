"""
Utility to generate complete, structured Jupyter Notebooks for college presentation and evaluation.
Generates:
1. 01_EDA.ipynb
2. 02_Data_Preprocessing.ipynb
3. 03_Feature_Engineering.ipynb
4. 04_Model_Training.ipynb
5. 05_Model_Evaluation.ipynb
"""
import json
import os

def make_notebook(cells):
    return {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "codemirror_mode": {"name": "ipython", "version": 3},
                "file_extension": ".py",
                "mimetype": "text/x-python",
                "name": "python",
                "nbconvert_exporter": "python",
                "pygments_lexer": "ipython3",
                "version": "3.13.0"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }

def md_cell(text):
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": [line + "\n" for line in text.split("\n")]
    }

def code_cell(code):
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [line + "\n" for line in code.split("\n")]
    }

def create_all_notebooks():
    out_dir = "ml/notebooks"
    os.makedirs(out_dir, exist_ok=True)
    
    # Notebook 1: EDA
    nb1 = make_notebook([
        md_cell("# Fyte: 01 - Exploratory Data Analysis (EDA)\n## Project: AI-Based Expense Prediction System\n\nIn this notebook, we perform comprehensive Exploratory Data Analysis on the primary dataset `expense_data.csv`."),
        code_cell("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Load dataset
df = pd.read_csv('../../data/raw/expense_data.csv')
print(f"Dataset shape: {df.shape}")
df.head(10)"""),
        md_cell("### 1. Dataset Overview and Structural Diagnostics"),
        code_cell("""print(df.info())
print("\\nMissing Values:\\n", df.isnull().sum())
print("\\nDuplicate Rows:", df.duplicated().sum())
print("\\nSummary Statistics:\\n", df.describe())"""),
        md_cell("### 2. Category and Payment Method Distributions"),
        code_cell("""print("Unique Categories:", df['Category'].value_counts())
print("\\nPayment Methods:", df['Payment_Method'].value_counts())"""),
        md_cell("### 3. Visualizations"),
        code_cell("""plt.figure(figsize=(10, 4))
df['Date'] = pd.to_datetime(df['Date'])
df.sort_values('Date', inplace=True)
plt.plot(df['Date'], df['Amount'], marker='o', color='#2563eb')
plt.title('Daily Expenses Timeline')
plt.xlabel('Date')
plt.ylabel('Amount (INR)')
plt.show()"""),
        code_cell("""plt.figure(figsize=(8, 4))
sns.boxplot(x='Category', y='Amount', data=df, palette='Set2')
plt.title('Expense Distribution by Category')
plt.xticks(rotation=30)
plt.show()""")
    ])
    with open(f"{out_dir}/01_EDA.ipynb", "w", encoding="utf-8") as f:
        json.dump(nb1, f, indent=2)

    # Notebook 2: Data Preprocessing
    nb2 = make_notebook([
        md_cell("# Fyte: 02 - Data Preprocessing\n\nHandling missing values, date parsing, data consistency, whitespace stripping, and chronological alignment without silent data deletion."),
        code_cell("""import pandas as pd
import numpy as np
from ml.src.data_loader import load_dataset, validate_dataset
from ml.src.preprocessing import clean_data

# Ingestion
df_raw = load_dataset('data/raw/expense_data.csv')
is_valid, msg = validate_dataset(df_raw)
print(f"Validation Status: {is_valid} - {msg}")"""),
        code_cell("""# Apply cleaning pipeline
df_clean, audit = clean_data(df_raw)
print("Audit Report:")
import json
print(json.dumps(audit, indent=2))
print("\\nCleaned Data Preview:")
df_clean.head()""")
    ])
    with open(f"{out_dir}/02_Data_Preprocessing.ipynb", "w", encoding="utf-8") as f:
        json.dump(nb2, f, indent=2)

    # Notebook 3: Feature Engineering
    nb3 = make_notebook([
        md_cell("# Fyte: 03 - Feature Engineering\n\nExtracting temporal, historical lag/rolling (strictly causal, zero future leakage), text attributes, and dynamic categorical encodings."),
        code_cell("""import pandas as pd
import numpy as np
from ml.src.feature_engineering import ExpenseFeatureEngineer

df_clean = pd.read_csv('data/processed/processed_expenses.csv')
engineer = ExpenseFeatureEngineer()
engineer.fit(df_clean)
df_features = engineer.extract_features(df_clean, is_training=True)

print(f"Engineered features count: {len(engineer.feature_columns)}")
print("Feature column names:\\n", engineer.feature_columns)
df_features[['Date', 'Amount', 'Previous_Expense', 'Rolling_3_Day_Average', 'Rolling_7_Day_Average', 'Is_Weekend']].head()""")
    ])
    with open(f"{out_dir}/03_Feature_Engineering.ipynb", "w", encoding="utf-8") as f:
        json.dump(nb3, f, indent=2)

    # Notebook 4: Model Training
    nb4 = make_notebook([
        md_cell("# Fyte: 04 - Model Training\n\nChronological time-aware train/test split (80/20) and candidate model training:\n1. Linear Regression\n2. Random Forest Regressor\n3. Gradient Boosting Regressor\n4. XGBoost Regressor"),
        code_cell("""from ml.src.train import time_based_train_test_split, train_and_evaluate_all
from ml.src.feature_engineering import ExpenseFeatureEngineer
import pandas as pd

df_clean = pd.read_csv('data/processed/processed_expenses.csv')
engineer = ExpenseFeatureEngineer().fit(df_clean)
df_featured = engineer.extract_features(df_clean)

train_df, test_df = time_based_train_test_split(df_featured, train_ratio=0.8)

X_train = train_df[engineer.feature_columns]
y_train = train_df['Amount']
X_test = test_df[engineer.feature_columns]
y_test = test_df['Amount']

print(f"Training observations: {len(X_train)} | Testing observations: {len(X_test)}")
results = train_and_evaluate_all(X_train, y_train, X_test, y_test)
for name, res in results.items():
    print(f"Model: {name} -> Test RMSE: {res['test_metrics']['rmse']}, R2: {res['test_metrics']['r2']}")""")
    ])
    with open(f"{out_dir}/04_Model_Training.ipynb", "w", encoding="utf-8") as f:
        json.dump(nb4, f, indent=2)

    # Notebook 5: Model Evaluation
    nb5 = make_notebook([
        md_cell("# Fyte: 05 - Model Evaluation & Best Selection\n\nComparing regression models on MAE, MSE, RMSE, and R2. Determining the optimal model and persisting artifacts."),
        code_cell("""import pandas as pd
import json

comparison_df = pd.read_csv('ml/results/model_comparison.csv')
print("Model Comparison Leaderboard:")
display(comparison_df)"""),
        code_cell("""with open('ml/results/metrics.json') as f:
    metrics = json.load(f)
print(f"Winning Model: {metrics['best_model']}")""")
    ])
    with open(f"{out_dir}/05_Model_Evaluation.ipynb", "w", encoding="utf-8") as f:
        json.dump(nb5, f, indent=2)

    print("Successfully generated all 5 Jupyter notebooks in ml/notebooks/")

if __name__ == "__main__":
    create_all_notebooks()
