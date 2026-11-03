"""
AI Insights API Endpoints for Fyte.
"""
from fastapi import APIRouter, HTTPException
from backend.app.services.insight_service import insight_service

router = APIRouter(prefix="/ml", tags=["Insights"])

@router.get("/insights")
def get_insights():
    try:
        return insight_service.generate_insights()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
