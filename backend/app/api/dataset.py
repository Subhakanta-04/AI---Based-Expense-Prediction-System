"""
Dataset API Endpoints for Fyte.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.app.schemas.dataset import DatasetInfoResponse, DatasetPreviewResponse, DatasetUploadResponse
from backend.app.services.dataset_service import dataset_service

router = APIRouter(prefix="/dataset", tags=["Dataset"])

@router.get("/info", response_model=DatasetInfoResponse)
def get_dataset_info():
    try:
        return dataset_service.get_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/preview", response_model=DatasetPreviewResponse)
def get_dataset_preview(limit: int = 50):
    try:
        return dataset_service.get_preview(limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload", response_model=DatasetUploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are supported.")
    try:
        content = await file.read()
        res = dataset_service.save_uploaded_dataset(content, file.filename)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process upload: {str(e)}")

@router.post("/reset")
def reset_default_dataset():
    try:
        return dataset_service.reset_default_dataset()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
