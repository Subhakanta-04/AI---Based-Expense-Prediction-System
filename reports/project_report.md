# Fyte: Project Technical & Viva Evaluation Report
## AI-Based Expense Prediction and Financial Behavioral Analytics System

**Project Tagline:** *"Understand your spending. Predict your future."*  
**Academic Level:** College / Capstone Machine Learning Project  
**Target Domain:** Financial Analytics, Time-Series Supervised Regression, Behavioral Anomaly Detection  

---

## 1. Introduction
Personal financial management is frequently hindered by lack of visibility into future obligations and impulsive spending habits. Conventional expense management tools are strictly retrospective—they log historical entries into static ledgers without offering predictive intelligence. 

**Fyte** is an end-to-end Machine Learning system engineered to bridge this gap. Rather than acting as a simple database viewer, Fyte formulates expense forecasting as a **Supervised Time-Series Regression Problem**, extracting seasonal patterns, sequential transaction momentum, and category interactions from chronological spending logs to forecast future expense quantities and isolate statistical anomalies.

---

## 2. Problem Statement
Given an ordered sequence of discrete historical expense transactions characterized by transactional timestamps, expense categories, payment methods, transaction amounts, and contextual descriptions:
$$\mathcal{D} = \{(t_i, C_i, P_i, D_i, y_i)\}_{i=1}^N$$
where $y_i \in \mathbb{R}^+$ denotes the transaction expense amount.

The primary objective is to estimate a parameterized mapping function:
$$\hat{y}_{t+k} = f(\mathbf{x}_{t+k}; \mathbf{\theta})$$
where $\mathbf{x}_{t+k}$ encapsulates temporal signals, historical rolling statistics strictly prior to $t+k$, and categorical encodings, minimizing the expected empirical risk without introducing forward-looking data leakage.

---

## 3. Objectives
1. **End-to-End Pipeline Execution:** Implement an integrated machine learning workflow encompassing data ingestion, cleaning, feature engineering, chronological train/test partitioning, model training, evaluation, selection, and deployment.
2. **Strict Causality & Leakage Prevention:** Guarantee that all rolling aggregates and lag indicators strictly utilize observations prior to the predicted transaction ($t-1$), avoiding lookahead bias.
3. **Multi-Model Benchmark:** Train, tune, and evaluate multiple distinct regression families:
   - Linear Regression (Ordinary Least Squares baseline)
   - Random Forest Regressor (Ensemble Bagging)
   - Gradient Boosting Regressor (Sequential Boosting)
   - XGBoost Regressor (Regularized Extreme Gradient Boosting)
4. **Deterministic Anomaly Isolation:** Detect outlier expenses using Interquartile Range (IQR) and Z-score methods at global and category-specific granularities.
5. **Interactive Full-Stack Web Application:** Deliver an intuitive, fintech-grade dashboard with real-time prediction, 7/14/30-day forward forecasts, and data-backed AI insights.

---

## 4. Dataset Description
The system operates on the primary dataset `expense_data.csv`, comprising **114 valid chronological expense entries** recorded between **January 2, 2024** and **June 30, 2024** (spanning a 6-month observation window).

### Dataset Schema
| Column Name | Data Type | Description | Sample Values |
| :--- | :--- | :--- | :--- |
| `Date` | Date String (`YYYY-MM-DD`) | Calendar date of transaction | `2024-01-02`, `2024-05-18` |
| `Category` | Categorical String | Spending classification | `Food`, `Shopping`, `Transport`, `Health`, `Utilities`, `Entertainment` |
| `Amount` | Numerical (Float/Int) | Expense value in Indian Rupees (INR) | `85.0`, `450.0`, `4000.0` |
| `Payment_Method`| Categorical String | Transactional payment vehicle | `UPI`, `Credit Card`, `Cash`, `Net Banking` |
| `Description` | Text String | Freeform transaction narrative | `Zomato order`, `Uber`, `Monsoon clothes` |

### Key Dataset Statistics
- **Total Records:** 114
- **Total Expenditure:** ₹79,330.00
- **Mean Transaction:** ₹695.88
- **Median Transaction:** ₹455.00
- **Standard Deviation:** ₹721.46
- **Minimum Transaction:** ₹85.00 (Tea & Snacks)
- **Maximum Transaction:** ₹4,000.00 (Summer Clothes)
- **Distinct Categories:** 6 (`Food`, `Shopping`, `Transport`, `Entertainment`, `Health`, `Utilities`)
- **Distinct Payment Methods:** 4 (`UPI`, `Credit Card`, `Cash`, `Net Banking`)

---

## 5. Data Preprocessing
To maintain data integrity without destructive loss, the pipeline applies structured preprocessing steps:
1. **String Normalization:** Whitespace trimming and standardized title casing across `Category` and `Payment_Method`. Standard acronyms like `UPI` are preserved.
2. **Date Parsing:** Strict conversion of `Date` strings to ISO-8601 standard `datetime64[ns]` objects. Records with unparseable timestamps are isolated.
3. **Numerical Coercion:** Coercion of `Amount` to non-negative floats ($Amount > 0$).
4. **Deduplication:** Check for duplicate transactions occurring on the identical date with the identical category, method, and amount.
5. **Chronological Sorting:** The dataset is explicitly sorted by `Date` in ascending order.
6. **Transparent Auditing:** A structured audit log records every transformation executed (no silent row deletion).

---

## 6. Exploratory Data Analysis (EDA)
Comprehensive statistical exploration revealed pronounced spending behaviors:

### 1. Category Breakdown
- **Food:** Accounts for **43.86%** of all transactions (50 records) and **₹19,745.00** total expenditure (mean ₹394.90).
- **Shopping:** Accounts for **₹31,450.00** total expenditure (**39.64%** of total spend), with a high mean transaction value of **₹1,655.26**.
- **Utilities:** Predictable recurring expenses occurring twice a month (Electricity ₹1,500 and Internet ₹800), totaling **₹13,800.00**.
- **Transport:** Frequent, low-to-medium value rides (Auto rickshaw, Uber, Ola) averaging ₹233.04.
- **Entertainment:** Regular monthly digital subscriptions (Netflix ₹499, Spotify ₹299, Prime ₹649) and outings.
- **Health:** Medicine, checkups, and gym fees averaging ₹845.83.

### 2. Payment Method Volume
- **UPI:** Dominates transactional frequency (**57.89%** of all transactions), primarily utilized for everyday Food and Transport.
- **Credit Card:** Utilized predominantly for high-value Shopping and Dining (mean ₹1,657.89).
- **Cash:** Retained for local Transport (Auto) and local groceries/pharmacy.
- **Net Banking:** Exclusively dedicated to recurring Utility bill payments.

### 3. Temporal Patterns
- **Weekend Surge:** Average weekend expenditure is higher than weekday expenditure due to leisure dining, shopping, and social outings.
- **Spending Trend:** Overall trend shows an increasing slope over the 6-month period (+18.4% shift between earlier and later cycles).

---

## 7. Feature Engineering
Feature engineering bridges the raw CSV columns and machine learning algorithms. In financial time series, the most critical design constraint is **zero future data leakage**.

### 1. Calendar & Temporal Features
- `Year`, `Month`, `Day`, `Day_of_Week` ($0=\text{Monday}, 6=\text{Sunday}$), `Week_of_Year`, `Day_of_Month`.
- `Is_Weekend`: Binary flag indicating Saturday or Sunday ($1$) versus weekdays ($0$).
- `Sin_Month`, `Cos_Month`, `Sin_Day_of_Week`, `Cos_Day_of_Week`: Cyclical trigonometric transformations preserving circular calendar geometry.

### 2. Historical Rolling & Lag Features (Strictly Causal)
To prevent lookahead bias, all window calculations use values shifted by 1 ($y_{t-1}$):
$$\text{Previous\_Expense} = y_{t-1}$$
$$\text{Rolling\_3\_Day\_Average} = \frac{1}{3} \sum_{i=1}^3 y_{t-i}$$
$$\text{Rolling\_7\_Day\_Average} = \frac{1}{7} \sum_{i=1}^7 y_{t-i}$$
$$\text{Rolling\_14\_Day\_Average} = \frac{1}{14} \sum_{i=1}^{14} y_{t-i}$$
$$\text{Previous\_7\_Day\_Total} = \sum_{i=1}^7 y_{t-i}, \quad \text{Previous\_14\_Day\_Total} = \sum_{i=1}^{14} y_{t-i}$$
$$\text{Transaction\_Count} = t - 1$$
Initial NaN values created by shifting are backfilled using baseline training medians to retain early observations.

### 3. Categorical Encodings
- One-hot binary indicator vectors for each dynamically discovered Category (`Category_Food`, `Category_Shopping`, etc.) and Payment Method (`Payment_UPI`, `Payment_Credit Card`, etc.).

### 4. Text & Description Attributes
- Description character length (`Desc_Length`) and keyword indicators (`Desc_Has_Food`, `Desc_Has_Bill`, `Desc_Has_Subscription`, `Desc_Has_Transport`). Raw text tokens are excluded to prevent high-cardinality overfitting on a small dataset.

---

## 8. Machine Learning Algorithms
The system implements four diverse regression algorithms:

1. **Linear Regression:** Baseline parametric model estimating ordinary least squares coefficients.
2. **Random Forest Regressor:** Non-parametric bagging ensemble of decision trees. Averages predictions across decorrelated trees, exhibiting robust variance reduction and resilience to outliers.
3. **Gradient Boosting Regressor:** Boosting ensemble that builds sequential shallow trees, each correcting pseudo-residuals of predecessors via gradient descent in function space.
4. **XGBoost Regressor:** Scaled tree boosting incorporating second-order Taylor approximations for loss expansion and explicit $L_1/L_2$ regularization on tree leaf weights.

---

## 9. Train-Test Methodology
Because financial transactions possess inherent chronological dependency, **random shuffling (K-Fold cross validation without time awareness) is strictly prohibited**. Shuffling would introduce future information into historical predictions.

- **Split Ratio:** Chronological 80% Training (first 91 records) / 20% Testing (last 23 records).
- **Time Boundary:** Training set covers January 2, 2024 through May 18, 2024. The test set evaluates May 20, 2024 through June 30, 2024.

---

## 10. Model Evaluation
Models are evaluated on the unseen chronological test set using standard regression criteria:
- **Mean Absolute Error (MAE):** $\text{MAE} = \frac{1}{N}\sum |y_i - \hat{y}_i|$
- **Mean Squared Error (MSE):** $\text{MSE} = \frac{1}{N}\sum (y_i - \hat{y}_i)^2$
- **Root Mean Squared Error (RMSE):** $\text{RMSE} = \sqrt{\text{MSE}}$
- **Coefficient of Determination ($R^2$):** $R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$

---

## 11. Results & Best Model Selection
Actual evaluation results computed on the test partition:

| Model Family | Test MAE (₹) | Test MSE | Test RMSE (₹) | Test $R^2$ Score | Train RMSE (₹) | Train $R^2$ | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Random Forest Regressor** | **₹204.05** | **88,745.68** | **₹297.90** | **0.5764** | ₹211.04 | 0.9217 | 🏆 **Best Performing** |
| **Gradient Boosting Regressor** | ₹178.18 | 114,731.07 | ₹338.72 | 0.4523 | ₹95.86 | 0.9838 | Runner-up |
| **XGBoost Regressor** | ₹182.39 | 126,107.57 | ₹355.12 | 0.3980 | ₹112.41 | 0.9778 | Third |
| **Linear Regression** | ₹281.49 | 156,026.91 | ₹395.00 | 0.2552 | ₹339.33 | 0.7976 | Baseline |

### Selection Decision
**Random Forest Regressor** was selected as the operational champion based on the primary criterion of **Lowest Test RMSE (₹297.90)** and secondary criterion of **Highest Test $R^2$ (0.5764)**. It maintained balanced generalization with minimal overfitting compared to deeper boosted trees.

### Feature Importance (Random Forest)
1. `Category_Shopping`: **44.73%** (strongest predictor of high expense spikes)
2. `Desc_Length`: **12.56%** (longer descriptions correlate with major purchases)
3. `Payment_Credit Card`: **7.20%**
4. `Previous_14_Day_Total`: **4.13%**
5. `Previous_Expense`: **4.09%**
6. `Category_Utilities`: **3.29%**
7. `Payment_Net Banking`: **3.02%**
8. `Desc_Has_Bill`: **2.76%**
9. `Rolling_14_Day_Average`: **2.43%**
10. `Category_Health`: **2.31%**

---

## 12. Prediction Engine
The prediction module accepts input attributes (Date, Category, Payment Method, Description) and optional historical parameters. If historical metrics are omitted by the user, the engine dynamically injects current rolling statistics from the latest dataset records.

- **Non-Negative Constraint:** Predicted outputs are bound by $\hat{y} \ge 0$.
- **Reliability Metric:** Rather than fabricating pseudo-Bayesian confidence intervals, Fyte reports an **empirical reliability score** directly mapped to test set $R^2$ and MAE margin of error.

---

## 13. Anomaly Detection
Anomalies are detected using the **Interquartile Range (IQR)** method:
$$\text{IQR} = Q_3 - Q_1$$
$$\text{Upper Threshold} = Q_3 + 1.5 \times \text{IQR}$$

- **Global Threshold:** ₹1,787.50
- **Identified Outliers:** 7 transactions identified as statistically anomalous, notably:
  - ₹4,000.00 (Summer clothes, Shopping)
  - ₹3,500.00 (Gadget accessory, Shopping)
  - ₹3,200.00 (Shoes & bag, Shopping)
  - ₹2,800.00 (Festival shopping, Shopping)
  - ₹2,500.00 (Electronics, Shopping)
- **Category-specific Sensitivity:** An expense of ₹1,200 is typical in `Shopping`, but anomalous in `Food` or `Transport`. The system calculates category-specific fences to highlight contextual deviations.

---

## 14. Limitations
1. **Sample Size:** The dataset contains 114 records. While adequate for college-level demonstration and pattern extraction, real-world deployment requires thousands of records across multiple years.
2. **Exogenous Factors:** The model does not observe user income, bank balances, unexpected emergency events, or macroeconomic inflation.
3. **Educational Intent:** Predictions represent algorithmic trend extrapolations for educational evaluation, not certified financial advice.

---

## 15. Future Scope
1. **Multi-User Partitioning:** Extending SQLite schema to support multi-tenant accounts with personalized model pipelines.
2. **Automated Receipt Ingestion:** Integrating OCR (Tesseract / Vision LLM) to automatically extract line items and dates from payment screenshots.
3. **Ensemble Stacking:** Developing a meta-regressor combining Random Forest, Gradient Boosting, and ARIMA time-series models.
4. **Budget Alert Sidecars:** Automated web push notifications when forward 7-day predicted spend exceeds predefined target ceilings.
