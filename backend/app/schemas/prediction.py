"""
Prediction & Forecast API Pydantic schemas.
"""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class PredictRequest(BaseModel):
    Date: Optional[str] = None
    Category: str = Field(..., example="Food")
    Payment_Method: str = Field(..., example="UPI")
    Description: Optional[str] = Field(None, example="Lunch with friends")
    Previous_Expense: Optional[float] = None
    Rolling_3_Day_Average: Optional[float] = None
    Rolling_7_Day_Average: Optional[float] = None
    Rolling_14_Day_Average: Optional[float] = None

class Range(BaseModel):
    lower: float
    upper: float

class PredictResponse(BaseModel):
    predicted_amount: float
    currency: str
    model_name: str
    reliability_label: str
    reliability_score: float
    test_rmse: float
    test_mae: float
    test_r2: float
    typical_range: Range
    interpretation: str
