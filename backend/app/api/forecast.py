"""
Forecast API Endpoints for Fyte.
"""
from fastapi import APIRouter, HTTPException, Query
from backend.app.services.forecast_service import forecast_service

router = APIRouter(prefix="/ml", tags=["Forecast"])

@router.get("/forecast")
def get_forecast(days: int = Query(30, ge=7, le=60)):
    try:
        return forecast_service.get_forecast(days=days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast error: {str(e)}")
