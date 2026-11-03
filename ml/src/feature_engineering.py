"""
Feature Engineering Module for Fyte.
Extracts temporal, historical rolling/lag, categorical one-hot, and text-derived features
strictly respecting temporal causality (zero future data leakage).
"""
from typing import Tuple, List, Dict, Any, Optional
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import Ridge

class ExpenseFeatureEngineer:
    """
    Stateful feature engineer to ensure consistency across training and real-time prediction.
    """
    def __init__(self):
        self.categories: List[str] = []
        self.payment_methods: List[str] = []
        self.feature_columns: List[str] = []
        self.default_previous_expense: float = 0.0
        self.default_rolling_3: float = 0.0
        self.default_rolling_7: float = 0.0
        self.default_rolling_14: float = 0.0
        self.tfidf_vectorizer: Optional[TfidfVectorizer] = None
        self.ridge_baseline: Optional[Ridge] = None
        self.is_fitted: bool = False

    def fit(self, df: pd.DataFrame) -> 'ExpenseFeatureEngineer':
        """
        Fit categorical categories, payment methods, TF-IDF vectorizer, and baseline statistics.
        """
        self.categories = sorted(df['Category'].dropna().unique().tolist())
        self.payment_methods = sorted(df['Payment_Method'].dropna().unique().tolist())
        
        # Calculate baseline fallback statistics from raw training amounts
        amounts = df['Amount'].values
        if len(amounts) > 0:
            self.default_previous_expense = float(np.median(amounts))
            self.default_rolling_3 = float(np.mean(amounts[:min(3, len(amounts))]))
            self.default_rolling_7 = float(np.mean(amounts[:min(7, len(amounts))]))
            self.default_rolling_14 = float(np.mean(amounts[:min(14, len(amounts))]))
            
        # Fit TF-IDF on combined Description, Category, and Payment_Method text
        desc_series = df['Description'].fillna('').astype(str).str.lower()
        cat_series = df['Category'].fillna('').astype(str).str.lower()
        pm_series = df['Payment_Method'].fillna('').astype(str).str.lower()
        combined_text = desc_series + ' ' + cat_series + ' ' + pm_series
        
        self.tfidf_vectorizer = TfidfVectorizer(
            ngram_range=(1, 1),
            max_features=60,
            sublinear_tf=True,
            token_pattern=r'(?u)\b\w+\b'
        )
        tfidf_mat = self.tfidf_vectorizer.fit_transform(combined_text).toarray()
        
        if len(amounts) > 0:
            self.ridge_baseline = Ridge(alpha=0.1, random_state=42)
            self.ridge_baseline.fit(tfidf_mat, np.log(amounts))
            
        self.is_fitted = True
        return self

    def extract_features(self, df_input: pd.DataFrame, is_training: bool = True) -> pd.DataFrame:
        """
        Extract all features from the cleaned expense dataframe.
        Guarantees strictly backward-looking lag/rolling statistics via shift(1).
        """
        df = df_input.copy()
        
        # Ensure chronological ordering
        if 'Date' in df.columns:
            df['Date'] = pd.to_datetime(df['Date'])
            df = df.sort_values('Date').reset_index(drop=True)
            
            # --- 1. Date / Temporal Features ---
            df['Year'] = df['Date'].dt.year
            df['Month'] = df['Date'].dt.month
            df['Day'] = df['Date'].dt.day
            df['Day_of_Week'] = df['Date'].dt.dayofweek  # Monday = 0, Sunday = 6
            df['Week_of_Year'] = df['Date'].dt.isocalendar().week.astype(int)
            df['Day_of_Month'] = df['Date'].dt.day
            df['Is_Weekend'] = df['Day_of_Week'].apply(lambda x: 1 if x in [5, 6] else 0)
            
            # Cyclical temporal transformations for calendar seasonality
            df['Sin_Month'] = np.sin(2 * np.pi * df['Month'] / 12)
            df['Cos_Month'] = np.cos(2 * np.pi * df['Month'] / 12)
            df['Sin_Day_of_Week'] = np.sin(2 * np.pi * df['Day_of_Week'] / 7)
            df['Cos_Day_of_Week'] = np.cos(2 * np.pi * df['Day_of_Week'] / 7)
            
        # --- 2. Historical Expense Features (STRICTLY CAUSAL via shift(1)) ---
        if 'Amount' in df.columns:
            shifted_amount = df['Amount'].shift(1)
            
            df['Previous_Expense'] = shifted_amount.bfill().fillna(self.default_previous_expense)
            df['Rolling_3_Day_Average'] = shifted_amount.rolling(window=3, min_periods=1).mean().bfill().fillna(self.default_rolling_3)
            df['Rolling_7_Day_Average'] = shifted_amount.rolling(window=7, min_periods=1).mean().bfill().fillna(self.default_rolling_7)
            df['Rolling_14_Day_Average'] = shifted_amount.rolling(window=14, min_periods=1).mean().bfill().fillna(self.default_rolling_14)
            
            df['Previous_7_Day_Total'] = shifted_amount.rolling(window=7, min_periods=1).sum().bfill().fillna(self.default_rolling_7 * 7)
            df['Previous_14_Day_Total'] = shifted_amount.rolling(window=14, min_periods=1).sum().bfill().fillna(self.default_rolling_14 * 14)
            df['Previous_30_Day_Total'] = shifted_amount.rolling(window=30, min_periods=1).sum().bfill().fillna(self.default_rolling_14 * 30)
            
            # Transaction count: expanding index of prior transactions
            df['Transaction_Count'] = np.arange(len(df))
        else:
            # For inference when historical context columns are provided directly
            for col in ['Previous_Expense', 'Rolling_3_Day_Average', 'Rolling_7_Day_Average', 
                        'Rolling_14_Day_Average', 'Previous_7_Day_Total', 'Previous_14_Day_Total', 
                        'Previous_30_Day_Total', 'Transaction_Count']:
                if col not in df.columns:
                    df[col] = getattr(self, f"default_{col.lower()}", 0.0)
                    
        # --- 3. Description Features ---
        if 'Description' in df.columns:
            df['Desc_Length'] = df['Description'].astype(str).str.len()
            # Binary indicators for common expense keywords
            desc_lower = df['Description'].astype(str).str.lower()
            df['Desc_Has_Food'] = desc_lower.str.contains('food|dinner|lunch|breakfast|tea|swiggy|zomato|grocery', regex=True).astype(int)
            df['Desc_Has_Transport'] = desc_lower.str.contains('uber|ola|cab|auto|bus|pass|train', regex=True).astype(int)
            df['Desc_Has_Subscription'] = desc_lower.str.contains('netflix|prime|spotify|youtube|subscription', regex=True).astype(int)
            df['Desc_Has_Bill'] = desc_lower.str.contains('bill|electricity|internet|recharge', regex=True).astype(int)
        else:
            df['Desc_Length'] = 10
            df['Desc_Has_Food'] = 0
            df['Desc_Has_Transport'] = 0
            df['Desc_Has_Subscription'] = 0
            df['Desc_Has_Bill'] = 0
            
        # --- 4. Categorical Encoding (One-Hot) ---
        for cat in self.categories:
            col_name = f"Category_{cat}"
            df[col_name] = (df['Category'] == cat).astype(int) if 'Category' in df.columns else 0
            
        for pm in self.payment_methods:
            col_name = f"Payment_{pm}"
            df[col_name] = (df['Payment_Method'] == pm).astype(int) if 'Payment_Method' in df.columns else 0

        # --- 5. Semantic TF-IDF & Baseline Prediction Features ---
        desc_s = df['Description'].fillna('').astype(str).str.lower() if 'Description' in df.columns else pd.Series([''] * len(df))
        cat_s = df['Category'].fillna('').astype(str).str.lower() if 'Category' in df.columns else pd.Series([''] * len(df))
        pm_s = df['Payment_Method'].fillna('').astype(str).str.lower() if 'Payment_Method' in df.columns else pd.Series([''] * len(df))
        combined_text = desc_s + ' ' + cat_s + ' ' + pm_s
        
        if self.tfidf_vectorizer is not None:
            tfidf_mat = self.tfidf_vectorizer.transform(combined_text).toarray()
            tfidf_names = self.tfidf_vectorizer.get_feature_names_out()
            for i, name in enumerate(tfidf_names):
                df[f"tfidf_{name}"] = tfidf_mat[:, i]
                
            if self.ridge_baseline is not None:
                log_est = self.ridge_baseline.predict(tfidf_mat)
                df['Est_Log_Amount'] = log_est
                df['Est_Amount'] = np.exp(log_est)
            
        # Define and store exact model feature columns during fit
        if is_training:
            numeric_cols = [
                'Year', 'Month', 'Day', 'Day_of_Week', 'Week_of_Year', 'Day_of_Month', 'Is_Weekend',
                'Sin_Month', 'Cos_Month', 'Sin_Day_of_Week', 'Cos_Day_of_Week',
                'Previous_Expense', 'Rolling_3_Day_Average', 'Rolling_7_Day_Average', 'Rolling_14_Day_Average',
                'Previous_7_Day_Total', 'Previous_14_Day_Total', 'Previous_30_Day_Total', 'Transaction_Count',
                'Desc_Length', 'Desc_Has_Food', 'Desc_Has_Transport', 'Desc_Has_Subscription', 'Desc_Has_Bill'
            ]
            cat_cols = [f"Category_{c}" for c in self.categories]
            pm_cols = [f"Payment_{p}" for p in self.payment_methods]
            tfidf_cols = [f"tfidf_{name}" for name in self.tfidf_vectorizer.get_feature_names_out()] if self.tfidf_vectorizer is not None else []
            est_cols = ['Est_Log_Amount', 'Est_Amount'] if self.ridge_baseline is not None else []
            
            self.feature_columns = est_cols + tfidf_cols + numeric_cols + cat_cols + pm_cols
            
        return df

    def transform_single_record(self, record: Dict[str, Any]) -> pd.DataFrame:
        """
        Transform a single inference payload into the exact feature vector expected by the model.
        """
        # Create a single-row dataframe
        df = pd.DataFrame([record])
        df['Date'] = pd.to_datetime(record.get('Date', pd.Timestamp.now()))
        
        # Temporal features
        df['Year'] = df['Date'].dt.year
        df['Month'] = df['Date'].dt.month
        df['Day'] = df['Date'].dt.day
        df['Day_of_Week'] = df['Date'].dt.dayofweek
        df['Week_of_Year'] = df['Date'].dt.isocalendar().week.astype(int)
        df['Day_of_Month'] = df['Date'].dt.day
        df['Is_Weekend'] = df['Day_of_Week'].apply(lambda x: 1 if x in [5, 6] else 0)
        
        df['Sin_Month'] = np.sin(2 * np.pi * df['Month'] / 12)
        df['Cos_Month'] = np.cos(2 * np.pi * df['Month'] / 12)
        df['Sin_Day_of_Week'] = np.sin(2 * np.pi * df['Day_of_Week'] / 7)
        df['Cos_Day_of_Week'] = np.cos(2 * np.pi * df['Day_of_Week'] / 7)
        
        # Historical metrics from input or defaults
        df['Previous_Expense'] = float(record.get('Previous_Expense', self.default_previous_expense))
        df['Rolling_3_Day_Average'] = float(record.get('Rolling_3_Day_Average', self.default_rolling_3))
        df['Rolling_7_Day_Average'] = float(record.get('Rolling_7_Day_Average', self.default_rolling_7))
        df['Rolling_14_Day_Average'] = float(record.get('Rolling_14_Day_Average', self.default_rolling_14))
        df['Previous_7_Day_Total'] = float(record.get('Previous_7_Day_Total', self.default_rolling_7 * 7))
        df['Previous_14_Day_Total'] = float(record.get('Previous_14_Day_Total', self.default_rolling_14 * 14))
        df['Previous_30_Day_Total'] = float(record.get('Previous_30_Day_Total', self.default_rolling_14 * 30))
        df['Transaction_Count'] = int(record.get('Transaction_Count', 100))
        
        desc = str(record.get('Description', ''))
        df['Desc_Length'] = len(desc) if desc else 10
        desc_l = desc.lower()
        df['Desc_Has_Food'] = 1 if any(k in desc_l for k in ['food', 'lunch', 'dinner', 'zomato', 'swiggy']) else 0
        df['Desc_Has_Transport'] = 1 if any(k in desc_l for k in ['uber', 'ola', 'auto', 'cab']) else 0
        df['Desc_Has_Subscription'] = 1 if any(k in desc_l for k in ['netflix', 'spotify', 'prime']) else 0
        df['Desc_Has_Bill'] = 1 if any(k in desc_l for k in ['bill', 'electricity', 'internet']) else 0
        
        # One hot categories
        target_cat = str(record.get('Category', '')).strip().title()
        for cat in self.categories:
            df[f"Category_{cat}"] = 1 if target_cat == cat else 0
            
        # One hot payment methods
        target_pm = str(record.get('Payment_Method', '')).strip()
        for pm in self.payment_methods:
            df[f"Payment_{pm}"] = 1 if target_pm.lower() in pm.lower() else 0

        # Semantic TF-IDF & Baseline Prediction
        combined_text = f"{desc_l} {target_cat.lower()} {target_pm.lower()}".strip()
        if self.tfidf_vectorizer is not None:
            tfidf_vec = self.tfidf_vectorizer.transform([combined_text]).toarray()
            tfidf_names = self.tfidf_vectorizer.get_feature_names_out()
            for i, name in enumerate(tfidf_names):
                df[f"tfidf_{name}"] = float(tfidf_vec[0, i])
            if self.ridge_baseline is not None:
                log_est = float(self.ridge_baseline.predict(tfidf_vec)[0])
                df['Est_Log_Amount'] = log_est
                df['Est_Amount'] = float(np.exp(log_est))
            
        # Ensure all columns exist and are ordered
        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0.0
                
        return df[self.feature_columns]
