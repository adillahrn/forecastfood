"""
Food Stock Prediction - Deep Learning Model
=============================================
Capstone Project CC26-PSU403

Requirements fulfilled:
- TensorFlow Functional API model
- Custom Layer (ResidualDenseBlock)
- Custom Loss Function (HuberMAELoss)
- Custom Callback (EarlyStoppingWithRestore)
- Model saved in .keras format
- Inference code included

Dataset: food_wastage_cleaned.csv
Target: Quantity of Food (regression - prediksi stok makanan)
"""

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
import matplotlib.pyplot as plt
import json
import os

# ============================================================
# 1. DATA LOADING & PREPROCESSING
# ============================================================

def load_and_preprocess_data(csv_path='food_wastage_cleaned.csv'):
    """Load and preprocess the food wastage dataset."""
    data = pd.read_csv(csv_path)
    print(f"Dataset shape: {data.shape}")
    print(f"Columns: {data.columns.tolist()}")
    print(data.head())
    print(data.describe())

    # Separate features and target
    target_col = 'Quantity of Food'
    feature_cols = [c for c in data.columns if c != target_col]

    # Identify categorical and numerical columns
    cat_cols = data[feature_cols].select_dtypes(include='object').columns.tolist()
    num_cols = data[feature_cols].select_dtypes(include='number').columns.tolist()

    print(f"\nCategorical features: {cat_cols}")
    print(f"Numerical features: {num_cols}")

    # Encode categorical features
    label_encoders = {}
    for col in cat_cols:
        le = LabelEncoder()
        data[col] = le.fit_transform(data[col])
        label_encoders[col] = le
        print(f"  {col}: {list(le.classes_)}")

    # Split features and target
    X = data[feature_cols].values.astype(np.float32)
    y = data[target_col].values.astype(np.float32)

    # Scale features
    scaler_X = StandardScaler()
    X_scaled = scaler_X.fit_transform(X)

    # Scale target (for better training)
    scaler_y = StandardScaler()
    y_scaled = scaler_y.fit_transform(y.reshape(-1, 1)).flatten()

    # Train/validation/test split (70/15/15)
    X_train, X_temp, y_train, y_temp = train_test_split(
        X_scaled, y_scaled, test_size=0.3, random_state=42
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42
    )

    print(f"\nTrain: {X_train.shape[0]} samples")
    print(f"Validation: {X_val.shape[0]} samples")
    print(f"Test: {X_test.shape[0]} samples")

    return (X_train, y_train, X_val, y_val, X_test, y_test,
            scaler_X, scaler_y, label_encoders, feature_cols, cat_cols, num_cols)


# ============================================================
# 2. CUSTOM COMPONENTS
# ============================================================

# --- Custom Layer: Residual Dense Block ---
@keras.utils.register_keras_serializable(package="FoodWaste")
class ResidualDenseBlock(keras.layers.Layer):
    """
    Custom residual dense block layer.
    Applies Dense -> BatchNorm -> ReLU -> Dense -> BatchNorm,
    then adds the input (residual connection) for better gradient flow.
    """
    def __init__(self, units, dropout_rate=0.3, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.dropout_rate = dropout_rate

    def build(self, input_shape):
        input_dim = input_shape[-1]
        self.dense1 = keras.layers.Dense(self.units, kernel_initializer='he_normal')
        self.bn1 = keras.layers.BatchNormalization()
        self.dense2 = keras.layers.Dense(input_dim, kernel_initializer='he_normal')
        self.bn2 = keras.layers.BatchNormalization()
        self.dropout = keras.layers.Dropout(self.dropout_rate)
        super().build(input_shape)

    def call(self, inputs, training=False):
        x = self.dense1(inputs)
        x = self.bn1(x, training=training)
        x = tf.nn.relu(x)
        x = self.dropout(x, training=training)
        x = self.dense2(x)
        x = self.bn2(x, training=training)
        # Residual connection
        return tf.nn.relu(x + inputs)

    def get_config(self):
        config = super().get_config()
        config.update({
            'units': self.units,
            'dropout_rate': self.dropout_rate,
        })
        return config


# --- Custom Loss Function: Combined Huber + MAE Loss ---
@keras.utils.register_keras_serializable(package="FoodWaste")
class HuberMAELoss(keras.losses.Loss):
    """
    Custom loss combining Huber loss and MAE for robust regression.
    Huber loss is less sensitive to outliers, MAE provides
    interpretable error measurement.
    """
    def __init__(self, delta=1.0, alpha=0.7, **kwargs):
        super().__init__(**kwargs)
        self.delta = delta
        self.alpha = alpha

    def call(self, y_true, y_pred):
        y_true = tf.cast(y_true, tf.float32)
        y_pred = tf.cast(y_pred, tf.float32)
        huber = tf.keras.losses.huber(y_true, y_pred, delta=self.delta)
        mae = tf.reduce_mean(tf.abs(y_true - y_pred))
        return self.alpha * huber + (1.0 - self.alpha) * mae

    def get_config(self):
        config = super().get_config()
        config.update({
            'delta': self.delta,
            'alpha': self.alpha,
        })
        return config


# --- Custom Callback: Early Stopping with Best Weights Restore ---
class EarlyStoppingWithRestore(keras.callbacks.Callback):
    """
    Custom callback that monitors val_loss,
    stops training if no improvement after `patience` epochs,
    and restores the best weights.
    Also logs training progress.
    """
    def __init__(self, patience=15, min_delta=1e-4, verbose=1):
        super().__init__()
        self.patience = patience
        self.min_delta = min_delta
        self.verbose = verbose
        self.best_loss = np.inf
        self.best_weights = None
        self.wait = 0
        self.stopped_epoch = 0
        self.history = {'epoch': [], 'val_loss': [], 'improvement': []}

    def on_epoch_end(self, epoch, logs=None):
        current_loss = logs.get('val_loss')
        self.history['epoch'].append(epoch)
        self.history['val_loss'].append(current_loss)

        if current_loss < self.best_loss - self.min_delta:
            improvement = self.best_loss - current_loss
            self.history['improvement'].append(improvement)
            self.best_loss = current_loss
            self.best_weights = self.model.get_weights()
            self.wait = 0
            if self.verbose:
                print(f"  [EarlyStop] Epoch {epoch+1}: val_loss improved to {current_loss:.6f}")
        else:
            self.history['improvement'].append(0)
            self.wait += 1
            if self.verbose and self.wait % 5 == 0:
                print(f"  [EarlyStop] Epoch {epoch+1}: no improvement for {self.wait} epochs")
            if self.wait >= self.patience:
                self.stopped_epoch = epoch
                self.model.stop_training = True
                if self.best_weights is not None:
                    self.model.set_weights(self.best_weights)
                if self.verbose:
                    print(f"  [EarlyStop] Stopped at epoch {epoch+1}, restoring best weights (val_loss={self.best_loss:.6f})")

    def on_train_end(self, logs=None):
        if self.stopped_epoch > 0 and self.verbose:
            print(f"  [EarlyStop] Training stopped early at epoch {self.stopped_epoch+1}")


# ============================================================
# 3. BUILD MODEL (Functional API)
# ============================================================

def build_model(input_dim):
    """
    Build the food waste prediction model using TensorFlow Functional API.
    Architecture: Input -> Dense(128) -> ResidualDenseBlock(256) ->
                  ResidualDenseBlock(256) -> Dense(64) -> Output(1)
    """
    inputs = keras.Input(shape=(input_dim,), name='features_input')

    # Initial dense projection
    x = keras.layers.Dense(128, kernel_initializer='he_normal')(inputs)
    x = keras.layers.BatchNormalization()(x)
    x = keras.layers.Activation('relu')(x)
    x = keras.layers.Dropout(0.2)(x)

    # Project to 256 for residual blocks
    x = keras.layers.Dense(256, kernel_initializer='he_normal')(x)
    x = keras.layers.BatchNormalization()(x)
    x = keras.layers.Activation('relu')(x)

    # Custom Residual Dense Blocks
    x = ResidualDenseBlock(units=512, dropout_rate=0.3, name='res_block_1')(x)
    x = ResidualDenseBlock(units=512, dropout_rate=0.3, name='res_block_2')(x)

    # Final layers
    x = keras.layers.Dense(64, activation='relu', kernel_initializer='he_normal')(x)
    x = keras.layers.Dropout(0.2)(x)
    x = keras.layers.Dense(32, activation='relu', kernel_initializer='he_normal')(x)

    # Output
    outputs = keras.layers.Dense(1, name='quantity_output')(x)

    model = keras.Model(inputs=inputs, outputs=outputs, name='FoodStockPredictor')
    return model


# ============================================================
# 4. TRAINING
# ============================================================

def train_model(model, X_train, y_train, X_val, y_val,
                epochs=200, batch_size=32, learning_rate=1e-3):
    """Compile and train the model."""

    # Custom loss
    custom_loss = HuberMAELoss(delta=1.0, alpha=0.7)

    # Optimizer
    optimizer = keras.optimizers.Adam(learning_rate=learning_rate)

    model.compile(
        optimizer=optimizer,
        loss=custom_loss,
        metrics=[
            keras.metrics.MeanAbsoluteError(name='mae'),
            keras.metrics.RootMeanSquaredError(name='rmse'),
        ]
    )

    model.summary()

    # Callbacks
    callbacks = [
        EarlyStoppingWithRestore(patience=20, min_delta=1e-4, verbose=1),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss', factor=0.5, patience=10, min_lr=1e-6, verbose=1
        ),
    ]

    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=callbacks,
        verbose=1
    )

    return history


# ============================================================
# 5. EVALUATION & VISUALIZATION
# ============================================================

def evaluate_model(model, X_test, y_test, scaler_y):
    """Evaluate model on test set and print metrics."""
    results = model.evaluate(X_test, y_test, verbose=0)
    print("\n=== Test Set Evaluation (scaled) ===")
    for name, val in zip(model.metrics_names, results):
        print(f"  {name}: {val:.6f}")

    # Predictions in original scale
    y_pred_scaled = model.predict(X_test, verbose=0).flatten()
    y_pred = scaler_y.inverse_transform(y_pred_scaled.reshape(-1, 1)).flatten()
    y_true = scaler_y.inverse_transform(y_test.reshape(-1, 1)).flatten()

    mae_original = np.mean(np.abs(y_true - y_pred))
    rmse_original = np.sqrt(np.mean((y_true - y_pred) ** 2))
    mape = np.mean(np.abs((y_true - y_pred) / (y_true + 1e-8))) * 100

    print(f"\n=== Test Set Evaluation (original scale) ===")
    print(f"  MAE:  {mae_original:.4f}")
    print(f"  RMSE: {rmse_original:.4f}")
    print(f"  MAPE: {mape:.2f}%")

    return y_true, y_pred


def plot_training_history(history):
    """Plot training and validation loss/metrics."""
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))

    # Loss
    axes[0].plot(history.history['loss'], label='Train Loss', color='#2196F3')
    axes[0].plot(history.history['val_loss'], label='Val Loss', color='#FF5722')
    axes[0].set_title('Loss over Epochs')
    axes[0].set_xlabel('Epoch')
    axes[0].set_ylabel('Loss')
    axes[0].legend()
    axes[0].grid(alpha=0.3)

    # MAE
    axes[1].plot(history.history['mae'], label='Train MAE', color='#2196F3')
    axes[1].plot(history.history['val_mae'], label='Val MAE', color='#FF5722')
    axes[1].set_title('MAE over Epochs')
    axes[1].set_xlabel('Epoch')
    axes[1].set_ylabel('MAE')
    axes[1].legend()
    axes[1].grid(alpha=0.3)

    # RMSE
    axes[2].plot(history.history['rmse'], label='Train RMSE', color='#2196F3')
    axes[2].plot(history.history['val_rmse'], label='Val RMSE', color='#FF5722')
    axes[2].set_title('RMSE over Epochs')
    axes[2].set_xlabel('Epoch')
    axes[2].set_ylabel('RMSE')
    axes[2].legend()
    axes[2].grid(alpha=0.3)

    plt.suptitle('Training History', fontsize=14)
    plt.tight_layout()
    plt.savefig('training_history.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Training history plot saved to training_history.png")


def plot_predictions(y_true, y_pred):
    """Plot predicted vs actual values."""
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Scatter plot
    axes[0].scatter(y_true, y_pred, alpha=0.5, color='#2196F3', s=20)
    min_val = min(y_true.min(), y_pred.min())
    max_val = max(y_true.max(), y_pred.max())
    axes[0].plot([min_val, max_val], [min_val, max_val], 'r--', lw=2, label='Perfect')
    axes[0].set_xlabel('Actual Quantity of Food')
    axes[0].set_ylabel('Predicted Quantity of Food')
    axes[0].set_title('Predicted vs Actual')
    axes[0].legend()
    axes[0].grid(alpha=0.3)

    # Residual plot
    residuals = y_true - y_pred
    axes[1].hist(residuals, bins=30, color='#2196F3', edgecolor='white', alpha=0.8)
    axes[1].axvline(x=0, color='red', linestyle='--', lw=2)
    axes[1].set_xlabel('Residual (Actual - Predicted)')
    axes[1].set_ylabel('Frequency')
    axes[1].set_title('Residual Distribution')
    axes[1].grid(alpha=0.3, axis='y')

    plt.suptitle('Model Predictions Analysis', fontsize=14)
    plt.tight_layout()
    plt.savefig('predictions_analysis.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Predictions analysis plot saved to predictions_analysis.png")


# ============================================================
# 6. SAVE MODEL & ARTIFACTS
# ============================================================

def save_model_and_artifacts(model, scaler_X, scaler_y, label_encoders,
                              feature_cols, cat_cols, num_cols):
    """Save model in .keras format and preprocessing artifacts."""
    # Save model
    model_path = 'food_waste_model.keras'
    model.save(model_path)
    print(f"\nModel saved to: {model_path}")

    # Save preprocessing artifacts
    artifacts = {
        'feature_cols': feature_cols,
        'cat_cols': cat_cols,
        'num_cols': num_cols,
        'scaler_X_mean': scaler_X.mean_.tolist(),
        'scaler_X_scale': scaler_X.scale_.tolist(),
        'scaler_y_mean': float(scaler_y.mean_[0]),
        'scaler_y_scale': float(scaler_y.scale_[0]),
        'label_encoders': {
            col: list(le.classes_) for col, le in label_encoders.items()
        }
    }

    artifacts_path = 'model_artifacts.json'
    with open(artifacts_path, 'w') as f:
        json.dump(artifacts, f, indent=2)
    print(f"Artifacts saved to: {artifacts_path}")

    return model_path, artifacts_path


# ============================================================
# 7. INFERENCE
# ============================================================

def load_model_for_inference(model_path='food_waste_model.keras',
                              artifacts_path='model_artifacts.json'):
    """Load model and artifacts for inference."""
    custom_objects = {
        'ResidualDenseBlock': ResidualDenseBlock,
        'HuberMAELoss': HuberMAELoss,
    }
    model = keras.models.load_model(model_path, custom_objects=custom_objects)

    with open(artifacts_path, 'r') as f:
        artifacts = json.load(f)

    return model, artifacts


def predict_food_quantity(model, artifacts, input_data):
    """
    Predict optimal food quantity (stock) for an event.

    Parameters:
        model: loaded Keras model
        artifacts: dict with preprocessing info
        input_data: dict with feature values, e.g.:
            {
                'Type of Food': 'Meat',
                'Number of Guests': 310,
                'Event Type': 'Corporate',
                'Wastage Food Amount': 25,
                'Storage Conditions': 'Refrigerated',
                'Seasonality': 'All Seasons',
                'Preparation Method': 'Buffet'
            }

    Returns:
        float: predicted quantity of food (stock)
    """
    feature_cols = artifacts['feature_cols']
    cat_cols = artifacts['cat_cols']
    label_encoders = artifacts['label_encoders']
    scaler_X_mean = np.array(artifacts['scaler_X_mean'])
    scaler_X_scale = np.array(artifacts['scaler_X_scale'])
    scaler_y_mean = artifacts['scaler_y_mean']
    scaler_y_scale = artifacts['scaler_y_scale']

    # Build feature vector
    features = []
    for col in feature_cols:
        val = input_data[col]
        if col in cat_cols:
            classes = label_encoders[col]
            if val in classes:
                val = classes.index(val)
            else:
                val = 0  # fallback
        features.append(float(val))

    # Scale
    X = np.array([features], dtype=np.float32)
    X_scaled = (X - scaler_X_mean) / scaler_X_scale

    # Predict
    y_pred_scaled = model.predict(X_scaled, verbose=0).flatten()[0]
    y_pred = y_pred_scaled * scaler_y_scale + scaler_y_mean

    return y_pred


# ============================================================
# 8. MAIN EXECUTION
# ============================================================

if __name__ == '__main__':
    print("=" * 60)
    print("Food Stock Prediction - Deep Learning Model")
    print("=" * 60)

    # 1. Load data
    print("\n--- Step 1: Load & Preprocess Data ---")
    (X_train, y_train, X_val, y_val, X_test, y_test,
     scaler_X, scaler_y, label_encoders,
     feature_cols, cat_cols, num_cols) = load_and_preprocess_data()

    # 2. Build model
    print("\n--- Step 2: Build Model (Functional API + Custom Layer) ---")
    model = build_model(input_dim=X_train.shape[1])

    # 3. Train
    print("\n--- Step 3: Train Model (Custom Loss + Custom Callback) ---")
    history = train_model(model, X_train, y_train, X_val, y_val,
                          epochs=200, batch_size=32, learning_rate=1e-3)

    # 4. Evaluate
    print("\n--- Step 4: Evaluate Model ---")
    y_true, y_pred = evaluate_model(model, X_test, y_test, scaler_y)

    # 5. Visualize
    print("\n--- Step 5: Visualize Results ---")
    plot_training_history(history)
    plot_predictions(y_true, y_pred)

    # 6. Save
    print("\n--- Step 6: Save Model (.keras) & Artifacts ---")
    save_model_and_artifacts(model, scaler_X, scaler_y, label_encoders,
                              feature_cols, cat_cols, num_cols)

    # 7. Inference demo
    print("\n--- Step 7: Inference Demo ---")
    model_loaded, artifacts_loaded = load_model_for_inference()

    sample_input = {
        'Type of Food': 'Meat',
        'Number of Guests': 310,
        'Event Type': 'Corporate',
        'Wastage Food Amount': 25,
        'Storage Conditions': 'Refrigerated',
        'Seasonality': 'All Seasons',
        'Preparation Method': 'Buffet'
    }

    prediction = predict_food_quantity(model_loaded, artifacts_loaded, sample_input)
    print(f"\nSample Input: {sample_input}")
    print(f"Predicted Quantity of Food (Stock): {prediction:.2f}")

    print("\n" + "=" * 60)
    print("DONE! All checklist items completed.")
    print("=" * 60)
