"""
Anomaly Detection API Endpoints for Fyte.
"""
from fastapi import APIRouter, HTTPException
from backend.app.services.anomaly_service import anomaly_service

router = APIRouter(prefix="/ml", tags=["Anomalies"])

@router.get("/anomalies")
def get_anomalies():
    try:
        return anomaly_service.get_anomalies()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
