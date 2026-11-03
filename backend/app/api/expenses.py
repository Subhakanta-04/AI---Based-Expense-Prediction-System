"""
Expense Ingestion Endpoints for Fyte.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.services.expense_service import expense_service

router = APIRouter(prefix="/expenses", tags=["Expenses"])

class AddExpenseRequest(BaseModel):
    Date: str
    Category: str
    Amount: float
    Payment_Method: str
    Description: str = ""

@router.post("/add")
def add_expense(req: AddExpenseRequest):
    try:
        res = expense_service.add_expense(
            date=req.Date,
            category=req.Category,
            amount=req.Amount,
            payment_method=req.Payment_Method,
            description=req.Description
        )
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
