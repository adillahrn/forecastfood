"""
Model Service untuk Food Stock Prediction API
===============================================
Service layer yang mengelola lifecycle model TensorFlow
dan melakukan preprocessing + inference.

Logic prediksi diadaptasi dari:
  src/food_waste_model.py -> predict_food_quantity()
"""

import json
import os
import sys
import numpy as np
import logging

logger = logging.getLogger(__name__)

# Tambahkan parent directory ke path agar bisa import custom objects
PARENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)


class ModelService:
    """
    Service class untuk mengelola model TensorFlow dan artifacts.
    Memuat model sekali saat startup dan menyediakan method prediksi.
    """

    def __init__(self):
        self.model = None
        self.artifacts = None
        self._is_loaded = False

    @property
    def is_loaded(self) -> bool:
        """Cek apakah model sudah dimuat."""
        return self._is_loaded

    def load(
        self,
        model_path: str = None,
        artifacts_path: str = None,
    ) -> None:
        """
        Muat model .keras dan file model_artifacts.json.

        Args:
            model_path: Path ke file .keras model
            artifacts_path: Path ke file model_artifacts.json
        """
        # Default paths relatif ke root project
        base_dir = PARENT_DIR
        if model_path is None:
            model_path = os.path.join(base_dir, "models", "food_waste_model.keras")
        if artifacts_path is None:
            artifacts_path = os.path.join(base_dir, "models", "model_artifacts.json")

        logger.info(f"Memuat model dari: {model_path}")
        logger.info(f"Memuat artifacts dari: {artifacts_path}")

        # Validasi file exists
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file tidak ditemukan: {model_path}")
        if not os.path.exists(artifacts_path):
            raise FileNotFoundError(f"Artifacts file tidak ditemukan: {artifacts_path}")

        # Import TensorFlow dan custom objects
        import tensorflow as tf
        from tensorflow import keras

        # Import custom objects dari src
        from src.food_waste_model import ResidualDenseBlock, HuberMAELoss

        custom_objects = {
            "ResidualDenseBlock": ResidualDenseBlock,
            "HuberMAELoss": HuberMAELoss,
        }

        # Load model
        self.model = keras.models.load_model(
            model_path, custom_objects=custom_objects
        )
        logger.info("Model berhasil dimuat.")

        # Load artifacts
        with open(artifacts_path, "r") as f:
            self.artifacts = json.load(f)
        logger.info("Artifacts berhasil dimuat.")

        self._is_loaded = True

    def predict(self, input_data: dict) -> float:
        """
        Prediksi Quantity of Food untuk satu input event.

        Logic ini identik dengan predict_food_quantity() di
        src/food_waste_model.py untuk menjaga konsistensi hasil.

        Args:
            input_data: Dict berisi fitur event, contoh:
                {
                    "Type of Food": "Meat",
                    "Number of Guests": 310,
                    "Event Type": "Corporate",
                    "Storage Conditions": "Refrigerated",
                    "Seasonality": "All Seasons",
                    "Preparation Method": "Buffet",
                    "Wastage Food Amount": 25
                }

        Returns:
            float: Prediksi quantity of food (porsi)
        """
        if not self._is_loaded:
            raise RuntimeError("Model belum dimuat. Panggil load() terlebih dahulu.")

        feature_cols = self.artifacts["feature_cols"]
        cat_cols = self.artifacts["cat_cols"]
        label_encoders = self.artifacts["label_encoders"]
        scaler_X_mean = np.array(self.artifacts["scaler_X_mean"])
        scaler_X_scale = np.array(self.artifacts["scaler_X_scale"])
        scaler_y_mean = self.artifacts["scaler_y_mean"]
        scaler_y_scale = self.artifacts["scaler_y_scale"]

        # Build feature vector — urutan kolom HARUS sama dengan saat training
        features = []
        for col in feature_cols:
            val = input_data[col]
            if col in cat_cols:
                classes = label_encoders[col]
                if val in classes:
                    val = classes.index(val)
                else:
                    val = 0  # fallback untuk kategori yang tidak dikenal
            features.append(float(val))

        # Standardize (scale)
        X = np.array([features], dtype=np.float32)
        X_scaled = (X - scaler_X_mean) / scaler_X_scale

        # Predict
        y_pred_scaled = self.model.predict(X_scaled, verbose=0).flatten()[0]

        # Inverse scale ke nilai asli
        y_pred = float(y_pred_scaled * scaler_y_scale + scaler_y_mean)

        return y_pred

    def predict_batch(self, inputs: list[dict]) -> list[float]:
        """
        Prediksi Quantity of Food untuk beberapa input sekaligus.

        Menggunakan batch processing untuk efisiensi —
        semua input di-encode dan di-scale bersama,
        lalu diprediksi dalam satu panggilan model.predict().

        Args:
            inputs: List of dicts, masing-masing berisi fitur event.

        Returns:
            List of float: Prediksi quantity untuk setiap input.
        """
        if not self._is_loaded:
            raise RuntimeError("Model belum dimuat. Panggil load() terlebih dahulu.")

        feature_cols = self.artifacts["feature_cols"]
        cat_cols = self.artifacts["cat_cols"]
        label_encoders = self.artifacts["label_encoders"]
        scaler_X_mean = np.array(self.artifacts["scaler_X_mean"])
        scaler_X_scale = np.array(self.artifacts["scaler_X_scale"])
        scaler_y_mean = self.artifacts["scaler_y_mean"]
        scaler_y_scale = self.artifacts["scaler_y_scale"]

        # Build feature matrix untuk semua input
        all_features = []
        for input_data in inputs:
            features = []
            for col in feature_cols:
                val = input_data[col]
                if col in cat_cols:
                    classes = label_encoders[col]
                    if val in classes:
                        val = classes.index(val)
                    else:
                        val = 0
                features.append(float(val))
            all_features.append(features)

        # Scale semua input sekaligus
        X = np.array(all_features, dtype=np.float32)
        X_scaled = (X - scaler_X_mean) / scaler_X_scale

        # Batch predict
        y_pred_scaled = self.model.predict(X_scaled, verbose=0).flatten()

        # Inverse scale
        y_pred = (y_pred_scaled * scaler_y_scale + scaler_y_mean).tolist()

        return y_pred

    def get_model_info(self) -> dict:
        """
        Ambil informasi model dan valid categories.

        Returns:
            Dict berisi info model, fitur, dan kategori valid.
        """
        if not self._is_loaded:
            raise RuntimeError("Model belum dimuat. Panggil load() terlebih dahulu.")

        feature_cols = self.artifacts["feature_cols"]
        cat_cols = self.artifacts["cat_cols"]
        num_cols = self.artifacts["num_cols"]
        label_encoders = self.artifacts["label_encoders"]

        features = []
        for col in feature_cols:
            feature_info = {
                "name": col,
                "type": "categorical" if col in cat_cols else "numerical",
            }
            if col in cat_cols:
                feature_info["valid_values"] = label_encoders[col]
            features.append(feature_info)

        return {
            "model_name": "FoodStockPredictor",
            "description": (
                "Model deep learning untuk memprediksi jumlah makanan optimal "
                "(Quantity of Food) berdasarkan parameter event. "
                "Dibangun menggunakan TensorFlow Functional API "
                "dengan custom ResidualDenseBlock layer."
            ),
            "target": "Quantity of Food (porsi)",
            "features": features,
            "valid_categories": label_encoders,
        }


# Singleton instance
model_service = ModelService()
