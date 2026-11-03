"""
Authentication API Endpoints for Fyte.
"""
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
from backend.app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "Financial Analyst"

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(req: RegisterRequest):
    try:
        return auth_service.register(req.name, req.email, req.password, req.role or "Financial Analyst")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
def login(req: LoginRequest):
    try:
        return auth_service.login(req.email, req.password)
    except ValueError as ve:
        raise HTTPException(status_code=401, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication token required.")
    token = authorization.replace("Bearer ", "")
    user = auth_service.verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    return user

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully."}
