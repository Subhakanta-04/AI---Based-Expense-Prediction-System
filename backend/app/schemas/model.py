"""
Model API Pydantic schemas.
"""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class Metrics(BaseModel):
    mae: float
    mse: float
    rmse: float
    r2: float
    mape: Optional[float] = None

class ModelComparisonRow(BaseModel):
    Model: str
    MAE: float
    MSE: float
    RMSE: float
    R2: float
    Train_RMSE: float
    Train_R2: float
    Is_Best: bool

class BestModelResponse(BaseModel):
    best_model_name: str
    primary_criterion: str
    secondary_criterion: str
    test_metrics: Dict[str, float]
    train_metrics: Dict[str, float]
    num_features: int
    features: List[str]
    training_time: str

class TrainPipelineResponse(BaseModel):
    status: str
    best_model: str
    metrics: Dict[str, float]
    num_records: int
    audit: Dict[str, Any]
