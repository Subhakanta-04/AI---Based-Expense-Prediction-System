"""
Prediction API Endpoints for Fyte.
"""
from fastapi import APIRouter, HTTPException
from backend.app.schemas.prediction import PredictRequest, PredictResponse
from backend.app.services.prediction_service import prediction_service

router = APIRouter(prefix="/ml", tags=["Predictions"])

@router.post("/predict", response_model=PredictResponse)
def predict_expense(request: PredictRequest):
    try:
        result = prediction_service.predict_expense(request.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
