"""
Dataset API Pydantic schemas.
"""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class DatasetInfoResponse(BaseModel):
    num_records: int
    num_columns: int
    columns: List[str]
    data_types: Dict[str, str]
    missing_values: Dict[str, int]
    total_missing_values: int
    duplicate_records: int
    date_range: Dict[str, str]
    num_categories: int
    categories: List[str]
    num_payment_methods: int
    payment_methods: List[str]
    amount_stats: Dict[str, float]

class DatasetPreviewResponse(BaseModel):
    columns: List[str]
    rows: List[Dict[str, Any]]
    total_count: int

class DatasetUploadResponse(BaseModel):
    success: bool
    message: str
    num_records: int
    columns: List[str]
