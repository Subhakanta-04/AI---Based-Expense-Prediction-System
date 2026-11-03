"""
Machine Learning API Endpoints for Fyte.
"""
from fastapi import APIRouter, HTTPException
from backend.app.schemas.model import TrainPipelineResponse, BestModelResponse
from backend.app.services.ml_service import ml_service

router = APIRouter(prefix="/ml", tags=["Machine Learning"])

@router.post("/train", response_model=TrainPipelineResponse)
def train_models():
    try:
        res = ml_service.train_models()
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training error: {str(e)}")

@router.get("/models")
def get_all_models_comparison():
    try:
        return ml_service.get_comparison()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/best-model", response_model=BestModelResponse)
def get_best_model():
    try:
        return ml_service.get_best_model_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
def get_metrics():
    try:
        return ml_service.get_metrics_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/feature-importance")
def get_feature_importance():
    try:
        return ml_service.get_feature_importance()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/actual-vs-predicted")
def get_actual_vs_predicted():
    try:
        return ml_service.get_actual_vs_predicted()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
