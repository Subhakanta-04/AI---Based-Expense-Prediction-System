"""
Budget API Endpoints for Fyte.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.services.budget_service import budget_service

router = APIRouter(prefix="/budget", tags=["Budget & Targets"])

class SetBudgetRequest(BaseModel):
    category: str
    monthly_limit: float

@router.get("/status")
def get_budget_status():
    try:
        return budget_service.get_budget_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/set")
def set_budget(req: SetBudgetRequest):
    try:
        return budget_service.set_budget(req.category, req.monthly_limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
