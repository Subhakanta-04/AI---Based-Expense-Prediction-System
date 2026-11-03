"""
Reports API Endpoint for Fyte.
"""
import os
from fastapi import APIRouter, HTTPException
from backend.app.core.config import settings

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/summary")
def get_report_content():
    report_path = os.path.join(settings.REPORTS_DIR, "project_report.md")
    if os.path.exists(report_path):
        with open(report_path, "r", encoding="utf-8") as f:
            content = f.read()
        return {"report_markdown": content}
    return {"report_markdown": "# Fyte Project Report\n*Report is generating...*"}
