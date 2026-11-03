"""
What-If Scenario Simulation Endpoints for Fyte.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.app.services.scenario_service import scenario_service

router = APIRouter(prefix="/ml", tags=["Scenario Simulation"])

class ScenarioRequest(BaseModel):
    cut_food_pct: Optional[float] = 0.0
    cut_shopping_pct: Optional[float] = 0.0
    cut_entertainment_pct: Optional[float] = 0.0
    shopping_cap: Optional[float] = 0.0

@router.post("/scenario-simulation")
def simulate_scenario(req: ScenarioRequest):
    try:
        return scenario_service.simulate_scenario(
            cut_food_pct=req.cut_food_pct or 0.0,
            cut_shopping_pct=req.cut_shopping_pct or 0.0,
            cut_entertainment_pct=req.cut_entertainment_pct or 0.0,
            shopping_cap=req.shopping_cap or 0.0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
