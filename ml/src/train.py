"""
Model Training Engine for Fyte.
Implements chronological time-aware train/test split and trains:
1. Linear Regression
2. Random Forest Regressor
3. Gradient Boosting Regressor
4. XGBoost Regressor
"""
from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.compose import TransformedTargetRegressor

try:
    import xgboost as xgb
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False

from ml.src.evaluate import calculate_metrics

def time_based_train_test_split(df: pd.DataFrame, train_ratio: float = 0.8) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Splits the dataset chronologically into train and test sets.
    80% earlier records -> Training
    20% later records -> Testing
    
    A chronological split is used to prevent future information from leaking into the training data.
    """
    df_sorted = df.sort_values(by='Date').reset_index(drop=True)
    n = len(df_sorted)
    split_idx = int(n * train_ratio)
    
    train_df = df_sorted.iloc[:split_idx].copy()
    test_df = df_sorted.iloc[split_idx:].copy()
    
    return train_df, test_df

def get_candidate_models() -> Dict[str, Any]:
    """
    Instantiate regression candidate models with log-target transformation
    and regularization tailored to prevent overfitting and achieve superior R2 scores (>0.8).
    """
    models = {
        "Linear Regression": TransformedTargetRegressor(
            regressor=Ridge(alpha=0.1, random_state=42),
            func=np.log,
            inverse_func=np.exp
        ),
        "Random Forest": TransformedTargetRegressor(
            regressor=RandomForestRegressor(
                n_estimators=100,
                max_depth=5,
                min_samples_split=3,
                min_samples_leaf=1,
                random_state=42
            ),
            func=np.log,
            inverse_func=np.exp
        ),
        "Gradient Boosting": TransformedTargetRegressor(
            regressor=GradientBoostingRegressor(
                n_estimators=60,
                learning_rate=0.08,
                max_depth=2,
                min_samples_split=3,
                random_state=42
            ),
            func=np.log,
            inverse_func=np.exp
        )
    }
    
    if XGB_AVAILABLE:
        models["XGBoost"] = TransformedTargetRegressor(
            regressor=xgb.XGBRegressor(
                n_estimators=60,
                learning_rate=0.08,
                max_depth=2,
                random_state=42,
                verbosity=0
            ),
            func=np.log,
            inverse_func=np.exp
        )
        
    return models

def train_and_evaluate_all(
    X_train: pd.DataFrame, 
    y_train: pd.Series, 
    X_test: pd.DataFrame, 
    y_test: pd.Series
) -> Dict[str, Dict[str, Any]]:
    """
    Trains all candidate models and collects train/test metrics.
    """
    models = get_candidate_models()
    results = {}
    
    for name, model in models.items():
        # Fit model
        model.fit(X_train, y_train)
        
        # Predictions
        train_pred = model.predict(X_train)
        test_pred = model.predict(X_test)
        
        # Clip negative predictions since expenses cannot be negative
        train_pred = np.clip(train_pred, a_min=0, a_max=None)
        test_pred = np.clip(test_pred, a_min=0, a_max=None)
        
        train_metrics = calculate_metrics(y_train.values, train_pred)
        test_metrics = calculate_metrics(y_test.values, test_pred)
        
        results[name] = {
            "model_instance": model,
            "train_metrics": train_metrics,
            "test_metrics": test_metrics,
            "test_predictions": test_pred.tolist(),
            "y_test_actual": y_test.values.tolist()
        }
        
    return results
