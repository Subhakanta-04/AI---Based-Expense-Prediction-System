"""
EDA API Endpoints for Fyte.
"""
from fastapi import APIRouter, HTTPException
from backend.app.services.eda_service import eda_service

router = APIRouter(prefix="/eda", tags=["Exploratory Data Analysis"])

@router.get("/summary")
def get_eda_summary():
    try:
        return eda_service.get_eda_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/charts")
def get_eda_charts():
    try:
        return eda_service.get_charts_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/correlation")
def get_eda_correlation():
    try:
        return eda_service.get_correlation_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
