# Fyte: College Viva Questions & Model Answers

### Q1: Why is this treated as a regression problem rather than a classification problem?
**Answer:** The goal is to predict the continuous numeric value of a future transaction in Indian Rupees (`Amount`). Classification predicts discrete labels (e.g. Fraud vs Normal or Category), whereas predicting exact expenditure values is a classic supervised regression task.

### Q2: Why can't we use standard K-Fold Cross Validation or random train/test split?
**Answer:** Financial spending data is time-dependent. Shuffling data randomly causes **data leakage** (lookahead bias), where future transactions inform past predictions. A chronological split (first 80% train, subsequent 20% test) mirrors real-world deployment where models can only learn from past history.

### Q3: How do you prevent data leakage when creating rolling and lag features?
**Answer:** We strictly apply `.shift(1)` before computing rolling metrics (like `Rolling_7_Day_Average` and `Previous_Expense`). This guarantees that for row $t$, only observations up to $t-1$ are included in the rolling window.

### Q4: Why did Random Forest outperform Linear Regression and Gradient Boosting on this dataset?
**Answer:** 
1. *Vs Linear Regression:* Expense data has non-linear relationships (e.g., shopping spikes and weekend interactions) which linear models underfit ($R^2=0.2552$ vs $0.5764$).
2. *Vs Gradient Boosting:* On small datasets (~114 rows), sequential gradient boosting with aggressive learning can overfit training noise. Random Forest's bootstrap bagging reduces variance through decorrelated averaging, delivering the lowest test RMSE (₹297.90).

### Q5: How do you detect anomalies?
**Answer:** We implement the Interquartile Range (IQR) method: $\text{IQR} = Q_3 - Q_1$, flagging values above $Q_3 + 1.5 \times \text{IQR}$. In addition to global thresholds, we compute category-specific fences because an expense of ₹1,200 is routine for Shopping but an outlier for Transport or Food.

### Q6: How does the system generate 30-day forward forecasts?
**Answer:** It uses iterative multi-step autoregression. For each forecast day, the model predicts the amount, appends it to the recent sequence, and updates the rolling averages (3-day, 7-day, 14-day) dynamically for the subsequent step.

### Q7: What are the primary features influencing predictions?
**Answer:** Extracted feature importances show:
1. `Category_Shopping` (~44.7%): Largest determinant of magnitude.
2. `Desc_Length` (~12.5%): Longer narratives correlate with major item purchases.
3. `Payment_Credit Card` (~7.2%): Primarily associated with higher-value transactions.
4. `Previous_14_Day_Total` and `Previous_Expense` (~8.2% combined): Momentum indicators.
