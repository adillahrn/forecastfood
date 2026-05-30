"""
Pydantic Schemas untuk Food Stock Prediction API
=================================================
Validasi request/response dengan tipe data yang ketat
menggunakan Literal types sesuai kategori di model_artifacts.json.
"""

from typing import Literal, Optional
from pydantic import BaseModel, Field


# ============================================================
# REQUEST SCHEMAS
# ============================================================

class PredictionRequest(BaseModel):
    """Schema untuk single prediction request."""

    type_of_food: Literal[
        "Baked Goods", "Dairy Products", "Fruits", "Meat", "Vegetables"
    ] = Field(
        ...,
        description="Jenis makanan yang akan disiapkan",
        examples=["Meat"],
    )

    number_of_guests: int = Field(
        ...,
        ge=1,
        le=1000,
        description="Jumlah tamu yang diundang",
        examples=[310],
    )

    event_type: Literal[
        "Birthday", "Corporate", "Social Gathering", "Wedding"
    ] = Field(
        ...,
        description="Jenis acara/event",
        examples=["Corporate"],
    )

    storage_conditions: Literal[
        "Refrigerated", "Room Temperature"
    ] = Field(
        ...,
        description="Kondisi penyimpanan makanan",
        examples=["Refrigerated"],
    )

    seasonality: Literal[
        "All Seasons", "Summer", "Winter"
    ] = Field(
        ...,
        description="Musim saat acara berlangsung",
        examples=["All Seasons"],
    )

    preparation_method: Literal[
        "Buffet", "Finger Food", "Sit-down Dinner"
    ] = Field(
        ...,
        description="Metode penyajian makanan",
        examples=["Buffet"],
    )

    wastage_food_amount: float = Field(
        ...,
        ge=0,
        le=100,
        description="Estimasi jumlah makanan yang terbuang (porsi)",
        examples=[25],
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "type_of_food": "Meat",
                    "number_of_guests": 310,
                    "event_type": "Corporate",
                    "storage_conditions": "Refrigerated",
                    "seasonality": "All Seasons",
                    "preparation_method": "Buffet",
                    "wastage_food_amount": 25,
                }
            ]
        }
    }


class BatchPredictionRequest(BaseModel):
    """Schema untuk batch prediction request."""

    items: list[PredictionRequest] = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Daftar item yang akan diprediksi (maks 100)",
    )


# ============================================================
# RESPONSE SCHEMAS
# ============================================================

class PredictionResult(BaseModel):
    """Hasil prediksi tunggal."""

    predicted_quantity: float = Field(
        ...,
        description="Prediksi jumlah makanan optimal (porsi)",
    )
    input_summary: dict = Field(
        ...,
        description="Ringkasan input yang digunakan untuk prediksi",
    )


class PredictionResponse(BaseModel):
    """Response untuk single prediction."""

    status: str = "success"
    data: PredictionResult


class BatchPredictionResponse(BaseModel):
    """Response untuk batch prediction."""

    status: str = "success"
    predictions: list[PredictionResult]
    count: int = Field(..., description="Jumlah prediksi yang dihasilkan")


class HealthResponse(BaseModel):
    """Response untuk health check."""

    status: str
    model_loaded: bool
    message: str


class ModelInfoResponse(BaseModel):
    """Response untuk model info."""

    model_name: str
    description: str
    target: str
    features: list[dict]
    valid_categories: dict


class ErrorResponse(BaseModel):
    """Response untuk error."""

    status: str = "error"
    detail: str
