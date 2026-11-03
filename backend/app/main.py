"""
Main FastAPI Application Entrypoint for Fyte.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings
from backend.app.api.auth import router as auth_router
from backend.app.api.dataset import router as dataset_router
from backend.app.api.eda import router as eda_router
from backend.app.api.ml import router as ml_router
from backend.app.api.predictions import router as predictions_router
from backend.app.api.forecast import router as forecast_router
from backend.app.api.anomalies import router as anomalies_router
from backend.app.api.insights import router as insights_router
from backend.app.api.reports import router as reports_router
from backend.app.api.budget import router as budget_router
from backend.app.api.expenses import router as expenses_router
from backend.app.api.scenarios import router as scenarios_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Fyte - Understand your spending. Predict your future. ML Expense Prediction System."
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files for generated visualizations and figures
if os.path.exists(settings.VISUALIZATIONS_DIR):
    app.mount("/static/visualizations", StaticFiles(directory=settings.VISUALIZATIONS_DIR), name="visualizations")

# Include Routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(dataset_router, prefix=settings.API_PREFIX)
app.include_router(eda_router, prefix=settings.API_PREFIX)
app.include_router(ml_router, prefix=settings.API_PREFIX)
app.include_router(predictions_router, prefix=settings.API_PREFIX)
app.include_router(forecast_router, prefix=settings.API_PREFIX)
app.include_router(anomalies_router, prefix=settings.API_PREFIX)
app.include_router(insights_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)
app.include_router(budget_router, prefix=settings.API_PREFIX)
app.include_router(expenses_router, prefix=settings.API_PREFIX)
app.include_router(scenarios_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "message": "Welcome to Fyte Backend API",
        "tagline": "Understand your spending. Predict your future.",
        "docs_url": "/docs",
        "status": "online"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "Fyte",
        "version": settings.VERSION
    }
