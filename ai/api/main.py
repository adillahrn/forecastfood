"""
Food Stock Prediction — REST API
==================================
FastAPI application untuk melayani model machine learning
Food Stock Prediction secara mandiri.

Capstone Project CC26-PSU403

Jalankan:
    uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

Dokumentasi interaktif:
    - Swagger UI: http://localhost:8000/docs
    - ReDoc:      http://localhost:8000/redoc
"""

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.schemas import (
    BatchPredictionRequest,
    BatchPredictionResponse,
    ErrorResponse,
    HealthResponse,
    ModelInfoResponse,
    PredictionRequest,
    PredictionResponse,
    PredictionResult,
)
from api.model_service import model_service

# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("api")


# ============================================================
# LIFESPAN — Load model on startup
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model saat server start, cleanup saat shutdown."""
    logger.info("=" * 60)
    logger.info("🚀 Starting Food Stock Prediction API...")
    logger.info("=" * 60)

    try:
        model_service.load()
        logger.info("✅ Model berhasil dimuat dan siap menerima request.")
    except Exception as e:
        logger.error(f"❌ Gagal memuat model: {e}")
        logger.warning("⚠️  Server berjalan tanpa model. Endpoint /predict tidak akan berfungsi.")

    yield

    logger.info("🛑 Shutting down API server...")


# ============================================================
# APP INITIALIZATION
# ============================================================

app = FastAPI(
    title="Food Stock Prediction API",
    description=(
        "REST API untuk memprediksi jumlah makanan optimal (**Quantity of Food**) "
        "berdasarkan parameter event menggunakan model deep learning TensorFlow.\n\n"
        "**Model**: FoodStockPredictor (Functional API + ResidualDenseBlock)\n\n"
        "**Fitur Input**: Type of Food, Number of Guests, Event Type, "
        "Storage Conditions, Seasonality, Preparation Method, Wastage Food Amount\n\n"
        "**Capstone Project CC26-PSU403**"
    ),
    version="1.0.0",
    lifespan=lifespan,
    responses={
        422: {"model": ErrorResponse, "description": "Validation Error"},
        500: {"model": ErrorResponse, "description": "Internal Server Error"},
    },
)


# ============================================================
# CORS MIDDLEWARE — Open Access
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HELPER: Konversi PredictionRequest ke dict model input
# ============================================================

def _request_to_model_input(req: PredictionRequest) -> dict:
    """
    Konversi Pydantic request ke dict dengan key yang sesuai
    urutan fitur di model_artifacts.json.
    """
    return {
        "Type of Food": req.type_of_food,
        "Number of Guests": req.number_of_guests,
        "Event Type": req.event_type,
        "Storage Conditions": req.storage_conditions,
        "Seasonality": req.seasonality,
        "Preparation Method": req.preparation_method,
        "Wastage Food Amount": req.wastage_food_amount,
    }


# ============================================================
# ENDPOINTS
# ============================================================

@app.get(
    "/",
    tags=["General"],
    summary="Root — Info API",
)
def root():
    """Informasi dasar tentang API."""
    return {
        "name": "Food Stock Prediction API",
        "version": "1.0.0",
        "description": "REST API untuk memprediksi jumlah makanan optimal berdasarkan parameter event.",
        "docs": "/docs",
        "health": "/health",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["General"],
    summary="Health Check",
)
def health_check():
    """Cek status kesehatan API dan apakah model sudah dimuat."""
    if model_service.is_loaded:
        return HealthResponse(
            status="healthy",
            model_loaded=True,
            message="API berjalan normal. Model siap menerima prediksi.",
        )
    else:
        return HealthResponse(
            status="degraded",
            model_loaded=False,
            message="API berjalan, tetapi model belum dimuat. Endpoint /predict tidak tersedia.",
        )


@app.post(
    "/predict",
    response_model=PredictionResponse,
    tags=["Prediction"],
    summary="Prediksi Tunggal",
    responses={
        200: {
            "description": "Prediksi berhasil",
            "content": {
                "application/json": {
                    "example": {
                        "status": "success",
                        "data": {
                            "predicted_quantity": 412.35,
                            "input_summary": {
                                "type_of_food": "Meat",
                                "number_of_guests": 310,
                                "event_type": "Corporate",
                                "storage_conditions": "Refrigerated",
                                "seasonality": "All Seasons",
                                "preparation_method": "Buffet",
                                "wastage_food_amount": 25,
                            },
                        },
                    }
                }
            },
        },
        503: {"model": ErrorResponse, "description": "Model belum dimuat"},
    },
)
def predict(request: PredictionRequest):
    """
    Prediksi jumlah makanan optimal untuk satu event.

    Masukkan parameter event (jenis makanan, jumlah tamu, tipe acara, dll.)
    dan API akan mengembalikan prediksi **Quantity of Food** dalam satuan porsi.
    """
    if not model_service.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="Model belum dimuat. Coba lagi nanti.",
        )

    try:
        model_input = _request_to_model_input(request)
        predicted_quantity = model_service.predict(model_input)

        return PredictionResponse(
            status="success",
            data=PredictionResult(
                predicted_quantity=round(predicted_quantity, 2),
                input_summary=request.model_dump(),
            ),
        )

    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Terjadi kesalahan saat prediksi: {str(e)}",
        )


@app.post(
    "/predict/batch",
    response_model=BatchPredictionResponse,
    tags=["Prediction"],
    summary="Prediksi Batch",
    responses={
        503: {"model": ErrorResponse, "description": "Model belum dimuat"},
    },
)
def predict_batch(request: BatchPredictionRequest):
    """
    Prediksi jumlah makanan optimal untuk beberapa event sekaligus.

    Kirim array berisi maksimal **100 item** dan API akan
    mengembalikan prediksi untuk setiap item secara efisien
    menggunakan batch processing.
    """
    if not model_service.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="Model belum dimuat. Coba lagi nanti.",
        )

    try:
        model_inputs = [_request_to_model_input(item) for item in request.items]
        predictions = model_service.predict_batch(model_inputs)

        results = []
        for item, pred in zip(request.items, predictions):
            results.append(
                PredictionResult(
                    predicted_quantity=round(pred, 2),
                    input_summary=item.model_dump(),
                )
            )

        return BatchPredictionResponse(
            status="success",
            predictions=results,
            count=len(results),
        )

    except Exception as e:
        logger.error(f"Batch prediction error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Terjadi kesalahan saat batch prediksi: {str(e)}",
        )


@app.get(
    "/model/info",
    response_model=ModelInfoResponse,
    tags=["Model"],
    summary="Info Model",
    responses={
        503: {"model": ErrorResponse, "description": "Model belum dimuat"},
    },
)
def model_info():
    """
    Informasi tentang model yang digunakan.

    Mengembalikan daftar fitur, tipe data, kategori valid,
    dan deskripsi model.
    """
    if not model_service.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="Model belum dimuat. Coba lagi nanti.",
        )

    try:
        info = model_service.get_model_info()
        return ModelInfoResponse(**info)

    except Exception as e:
        logger.error(f"Model info error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Terjadi kesalahan: {str(e)}",
        )


# ============================================================
# GLOBAL EXCEPTION HANDLER
# ============================================================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Menangani exception yang tidak tertangkap oleh handler lain."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "detail": "Terjadi kesalahan internal pada server.",
        },
    )


# ============================================================
# ENTRY POINT (untuk menjalankan langsung dengan python)
# ============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
