# 📄 Dokumentasi Model Deep Learning — Food Stock Prediction
## Capstone Project CC26-PSU403

---

## 1. Deskripsi Masalah Bisnis

### Latar Belakang
Pemborosan makanan (*food waste*) merupakan masalah global yang berdampak pada ekonomi dan lingkungan. Salah satu penyebab utamanya adalah **ketidaktepatan dalam memperkirakan jumlah stok makanan** yang dibutuhkan untuk suatu acara.

### Pertanyaan Bisnis
> **"Berapa jumlah stok makanan (Quantity of Food) yang optimal untuk disiapkan, berdasarkan karakteristik acara seperti jenis makanan, jumlah tamu, tipe acara, kondisi penyimpanan, musim, dan metode penyajian?"**

### Solusi
Model deep learning yang memprediksi **Quantity of Food** berdasarkan 7 fitur input, sehingga event organizer dapat:
- Menyiapkan stok makanan secara lebih akurat
- Mengurangi pemborosan makanan
- Menghemat biaya operasional

---

## 2. Dataset

| Properti | Nilai |
|---|---|
| **File** | `food_wastage_cleaned.csv` |
| **Total Data** | 1.782 baris |
| **Jumlah Fitur** | 7 (input) + 1 (target) |

### Kolom Dataset

| Kolom | Tipe | Range / Kategori | Peran |
|---|---|---|---|
| Type of Food | Kategorikal | Baked Goods, Dairy Products, Fruits, Meat, Vegetables | Input |
| Number of Guests | Numerik | 207 – 491 | Input |
| Event Type | Kategorikal | Birthday, Corporate, Social Gathering, Wedding | Input |
| Storage Conditions | Kategorikal | Refrigerated, Room Temperature | Input |
| Seasonality | Kategorikal | All Seasons, Summer, Winter | Input |
| Preparation Method | Kategorikal | Buffet, Finger Food, Sit-down Dinner | Input |
| Wastage Food Amount | Numerik | 10 – 63 | Input |
| **Quantity of Food** | **Numerik** | **280 – 500** | **Target (Output)** |

### Pembagian Data

| Set | Jumlah | Persentase |
|---|---|---|
| Training | 1.247 | 70% |
| Validation | 267 | 15% |
| Test | 268 | 15% |

---

## 3. Arsitektur Model

Model dibangun menggunakan **TensorFlow Functional API** dengan nama `FoodStockPredictor`.

```
Input (7 fitur)
  │
  ├── Dense(128) → BatchNorm → ReLU → Dropout(0.2)
  │
  ├── Dense(256) → BatchNorm → ReLU
  │
  ├── ResidualDenseBlock(512) ← Custom Layer
  │       │── Dense(512) → BatchNorm → ReLU → Dropout(0.3)
  │       │── Dense(256) → BatchNorm
  │       └── Residual Connection (x + input) → ReLU
  │
  ├── ResidualDenseBlock(512) ← Custom Layer
  │
  ├── Dense(64, relu) → Dropout(0.2)
  │
  ├── Dense(32, relu)
  │
  └── Dense(1) → Output: Predicted Quantity of Food
```

| Parameter | Nilai |
|---|---|
| Total Parameters | 586.113 (2.24 MB) |
| Trainable Parameters | 582.273 (2.22 MB) |
| Non-trainable Parameters | 3.840 (15.00 KB) |

---

## 4. Komponen Kustom

### 4.1 Custom Layer: `ResidualDenseBlock`

**Tujuan:** Meningkatkan kemampuan model untuk belajar representasi kompleks melalui *residual connection*, yang membantu mengatasi masalah *vanishing gradient*.

**Cara Kerja:**
1. Input masuk ke Dense layer pertama (ekspansi dimensi)
2. Dilakukan BatchNormalization → ReLU → Dropout
3. Dense layer kedua (kembali ke dimensi input)
4. BatchNormalization
5. **Residual connection**: output ditambahkan dengan input asli
6. Aktivasi ReLU pada hasil penjumlahan

```python
def call(self, inputs, training=False):
    x = self.dense1(inputs)        # Dense(512)
    x = self.bn1(x, training)      # BatchNorm
    x = tf.nn.relu(x)              # Aktivasi
    x = self.dropout(x, training)  # Regularisasi
    x = self.dense2(x)             # Dense(256) - kembali ke dim input
    x = self.bn2(x, training)      # BatchNorm
    return tf.nn.relu(x + inputs)  # Residual + ReLU
```

### 4.2 Custom Loss Function: `HuberMAELoss`

**Tujuan:** Menggabungkan kekuatan Huber Loss (tahan terhadap outlier) dan MAE (mudah diinterpretasi) untuk regresi yang lebih robust.

**Formula:**
```
Loss = α × Huber(y_true, y_pred) + (1-α) × MAE(y_true, y_pred)
```

| Parameter | Nilai | Fungsi |
|---|---|---|
| `delta` | 1.0 | Threshold Huber Loss |
| `alpha` | 0.7 | Bobot Huber (70% Huber, 30% MAE) |

**Keuntungan:**
- Huber Loss: Kurang sensitif terhadap outlier dibanding MSE
- MAE: Memberikan error yang mudah diinterpretasi
- Kombinasi keduanya menghasilkan training yang stabil

### 4.3 Custom Callback: `EarlyStoppingWithRestore`

**Tujuan:** Menghentikan training jika model tidak menunjukkan perbaikan, dan mengembalikan bobot terbaik.

| Parameter | Nilai | Fungsi |
|---|---|---|
| `patience` | 20 | Jumlah epoch tanpa perbaikan sebelum stop |
| `min_delta` | 0.0001 | Minimum perbaikan yang dianggap signifikan |
| `verbose` | 1 | Cetak progress ke console |

**Fitur:**
- Monitor `val_loss` setiap epoch
- Simpan bobot terbaik secara otomatis
- Restore bobot terbaik saat training berhenti
- Log progress training

---

## 5. Proses Training

| Konfigurasi | Nilai |
|---|---|
| Optimizer | Adam |
| Learning Rate | 0.001 (awal) |
| Batch Size | 32 |
| Max Epochs | 200 |
| Actual Epochs | 49 (early stopped) |
| LR Reduction | ReduceLROnPlateau (factor=0.5, patience=10) |

### Preprocessing
1. **Encoding Kategorikal:** LabelEncoder untuk semua fitur kategorikal
2. **Scaling Fitur:** StandardScaler (mean=0, std=1)
3. **Scaling Target:** StandardScaler pada Quantity of Food

---

## 6. Hasil Evaluasi

### Metrik pada Test Set (268 sampel)

| Metrik | Nilai (Scaled) | Nilai (Original) | Keterangan |
|---|---|---|---|
| **Loss** | 0.4188 | — | Custom HuberMAE loss |
| **MAE** | 0.47 | **30.72** | Rata-rata error absolut |
| **RMSE** | — | **41.33** | Root Mean Squared Error |
| **MAPE** | — | **7.56%** | Mean Absolute Percentage Error |
| **Akurasi (≈)** | — | **~92.44%** | 100% - MAPE |

### Interpretasi
- Model memprediksi stok makanan dengan **rata-rata error ±30.72 unit** dari nilai sebenarnya
- Dalam persentase, prediksi model **akurat ~92.44%** dari nilai sebenarnya
- Range target: 280–500 (rentang 220 unit), sehingga MAE 30.72 ≈ **14% dari rentang**

### Visualisasi
- **`training_history.png`** — Grafik Loss, MAE, dan RMSE selama training
- **`predictions_analysis.png`** — Scatter plot Predicted vs Actual dan distribusi residual

---

## 7. File Output

| File | Deskripsi |
|---|---|
| `food_waste_model.py` | Script utama model (training, evaluation, inference) |
| `food_waste_model.keras` | Model TensorFlow yang sudah dilatih (siap produksi) |
| `model_artifacts.json` | Konfigurasi preprocessing (scaler, encoder) |
| `training_history.png` | Plot kurva training |
| `predictions_analysis.png` | Plot analisis prediksi |

---

## 8. Cara Penggunaan (Inference)

### Load Model
```python
from food_waste_model import load_model_for_inference, predict_food_quantity

model, artifacts = load_model_for_inference(
    model_path='food_waste_model.keras',
    artifacts_path='model_artifacts.json'
)
```

### Prediksi
```python
result = predict_food_quantity(model, artifacts, {
    'Type of Food': 'Meat',           # Jenis makanan
    'Number of Guests': 310,          # Jumlah tamu
    'Event Type': 'Corporate',        # Tipe acara
    'Wastage Food Amount': 25,        # Perkiraan food waste
    'Storage Conditions': 'Refrigerated',  # Kondisi penyimpanan
    'Seasonality': 'All Seasons',     # Musim
    'Preparation Method': 'Buffet'    # Metode penyajian
})

print(f"Stok makanan yang disarankan: {result:.0f} unit")
# Output: Stok makanan yang disarankan: 400 unit
```

---

## 9. Checklist Kepatuhan Capstone

| Requirement | Status | Detail |
|---|---|---|
| Model Deep Learning (Functional API / Subclassing) | ✅ | TensorFlow Functional API |
| Custom Layer | ✅ | `ResidualDenseBlock` |
| Custom Loss Function | ✅ | `HuberMAELoss` |
| Custom Callback | ✅ | `EarlyStoppingWithRestore` |
| Model disimpan dalam format .keras / SavedModel | ✅ | `food_waste_model.keras` |
| Kode inference | ✅ | `predict_food_quantity()` |
