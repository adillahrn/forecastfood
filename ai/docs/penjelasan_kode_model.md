# 📖 Penjelasan Kode Model Deep Learning — Step by Step
## Untuk Presentasi Capstone

> Dokumen ini menjelaskan setiap bagian kode `food_waste_model.py` dengan bahasa sederhana agar mudah dipahami dan dijelaskan saat presentasi.

---

## Bagian 1: Import Library

```python
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
import matplotlib.pyplot as plt
import json
```

**Penjelasan sederhana:**
- `numpy` → Library untuk operasi matematika dan array (misal: menghitung rata-rata, membuat array angka)
- `pandas` → Library untuk membaca dan mengolah data tabel (CSV)
- `tensorflow` & `keras` → Framework utama untuk membuat dan melatih model deep learning
- `train_test_split` → Fungsi untuk membagi data jadi data latih, validasi, dan tes
- `LabelEncoder` → Mengubah data teks (misal "Meat", "Vegetables") jadi angka (0, 1, 2...) karena model hanya mengerti angka
- `StandardScaler` → Menormalkan data agar semua fitur punya skala yang sama (rata-rata 0, standar deviasi 1)
- `matplotlib` → Library untuk membuat grafik/visualisasi
- `json` → Untuk menyimpan dan membaca file konfigurasi

> **Kalau ditanya:** *"Kenapa pakai StandardScaler?"*
> Jawab: "Karena fitur-fitur kita punya range berbeda — Number of Guests (207-491) vs Wastage (10-63). Kalau tidak di-scale, model akan lebih fokus ke fitur dengan angka besar dan mengabaikan fitur kecil."

---

## Bagian 2: Load & Preprocess Data

```python
def load_and_preprocess_data(csv_path='food_wastage_cleaned.csv'):
    data = pd.read_csv(csv_path)

    target_col = 'Quantity of Food'
    feature_cols = [c for c in data.columns if c != target_col]
```

**Penjelasan:**
1. Baca file CSV ke dalam DataFrame pandas
2. Tentukan kolom **target** (yang mau diprediksi) = `Quantity of Food`
3. Semua kolom lainnya otomatis jadi **fitur** (input)

```python
    cat_cols = data[feature_cols].select_dtypes(include='object').columns.tolist()
    num_cols = data[feature_cols].select_dtypes(include='number').columns.tolist()
```

**Penjelasan:**
- Pisahkan fitur jadi 2 kelompok:
  - **Kategorikal** (teks): Type of Food, Event Type, Storage Conditions, Seasonality, Preparation Method
  - **Numerikal** (angka): Number of Guests, Wastage Food Amount

```python
    label_encoders = {}
    for col in cat_cols:
        le = LabelEncoder()
        data[col] = le.fit_transform(data[col])
        label_encoders[col] = le
```

**Penjelasan:**
- Ubah semua data teks jadi angka. Contoh:
  - "Baked Goods" → 0, "Dairy Products" → 1, "Fruits" → 2, "Meat" → 3, "Vegetables" → 4
- Simpan encoder-nya supaya nanti bisa dipakai lagi saat inference

```python
    scaler_X = StandardScaler()
    X_scaled = scaler_X.fit_transform(X)
    scaler_y = StandardScaler()
    y_scaled = scaler_y.fit_transform(y.reshape(-1, 1)).flatten()
```

**Penjelasan:**
- Normalkan semua fitur dan target ke skala standar (rata-rata = 0, std = 1)
- Ini membuat training lebih stabil dan cepat konvergen

```python
    X_train, X_temp, y_train, y_temp = train_test_split(
        X_scaled, y_scaled, test_size=0.3, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42)
```

**Penjelasan:**
- Bagi data jadi 3 bagian:
  - **Training (70%)** = 1.247 data → untuk melatih model
  - **Validation (15%)** = 267 data → untuk mengecek apakah model overfitting saat training
  - **Test (15%)** = 268 data → untuk evaluasi akhir performa model

> **Kalau ditanya:** *"Kenapa dibagi 3? Kenapa tidak 2 saja?"*
> Jawab: "Data training untuk melatih model, data validasi untuk memantau apakah model belajar dengan baik atau overfitting (terlalu menghafal data training), dan data test untuk mengevaluasi performa final model pada data yang belum pernah dilihat sama sekali."

---

## Bagian 3: Custom Layer — `ResidualDenseBlock`

```python
@keras.utils.register_keras_serializable(package="FoodWaste")
class ResidualDenseBlock(keras.layers.Layer):
```

**Apa itu?** Ini adalah **layer buatan sendiri** (custom layer) yang merupakan variasi dari Dense layer biasa, ditambah dengan teknik **residual connection**.

**Kenapa dibuat?** Untuk memenuhi checklist capstone yang mengharuskan implementasi minimal satu komponen kustom.

```python
    def build(self, input_shape):
        input_dim = input_shape[-1]
        self.dense1 = keras.layers.Dense(self.units, kernel_initializer='he_normal')
        self.bn1 = keras.layers.BatchNormalization()
        self.dense2 = keras.layers.Dense(input_dim, kernel_initializer='he_normal')
        self.bn2 = keras.layers.BatchNormalization()
        self.dropout = keras.layers.Dropout(self.dropout_rate)
```

**Penjelasan tiap komponen:**
- `Dense` → Layer neural network standar yang menghubungkan semua neuron. `he_normal` adalah cara inisialisasi bobot yang bagus untuk aktivasi ReLU
- `BatchNormalization` → Menormalkan output setiap layer agar training lebih stabil dan cepat
- `Dropout(0.3)` → Secara acak "mematikan" 30% neuron saat training untuk mencegah overfitting

```python
    def call(self, inputs, training=False):
        x = self.dense1(inputs)      # Masuk ke Dense pertama
        x = self.bn1(x, training)    # Normalisasi
        x = tf.nn.relu(x)           # Aktivasi ReLU: ubah nilai negatif jadi 0
        x = self.dropout(x, training) # Dropout untuk regularisasi
        x = self.dense2(x)          # Dense kedua (kembali ke dimensi awal)
        x = self.bn2(x, training)   # Normalisasi lagi
        return tf.nn.relu(x + inputs) # ← INI RESIDUAL CONNECTION!
```

**Apa itu Residual Connection?**
- Baris `x + inputs` menambahkan input asli ke output layer
- Ini seperti "jalan pintas" — model bisa memilih untuk melewatkan informasi langsung tanpa harus melalui semua transformasi
- **Manfaat:** Mencegah masalah *vanishing gradient* (gradien yang terlalu kecil sehingga model tidak bisa belajar) dan membuat model lebih dalam bisa tetap belajar dengan baik

> **Kalau ditanya:** *"Apa bedanya dengan Dense layer biasa?"*
> Jawab: "Dense layer biasa hanya melakukan transformasi linear + aktivasi. ResidualDenseBlock saya menambahkan residual connection — yaitu menjumlahkan output transformasi dengan input aslinya. Ini membantu model belajar fitur yang lebih kompleks tanpa kehilangan informasi dari input."

```python
    def get_config(self):
        config = super().get_config()
        config.update({'units': self.units, 'dropout_rate': self.dropout_rate})
        return config
```

**Penjelasan:** Fungsi ini diperlukan agar custom layer bisa disimpan (save) dan di-load kembali. Tanpa ini, model tidak bisa disimpan ke file `.keras`.

---

## Bagian 4: Custom Loss Function — `HuberMAELoss`

```python
@keras.utils.register_keras_serializable(package="FoodWaste")
class HuberMAELoss(keras.losses.Loss):
```

**Apa itu Loss Function?** Loss function mengukur seberapa "salah" prediksi model. Semakin kecil loss = semakin bagus prediksi. Model belajar dengan cara mencoba memperkecil nilai loss ini.

```python
    def call(self, y_true, y_pred):
        huber = tf.keras.losses.huber(y_true, y_pred, delta=self.delta)
        mae = tf.reduce_mean(tf.abs(y_true - y_pred))
        return self.alpha * huber + (1.0 - self.alpha) * mae
```

**Penjelasan formula:**
```
Loss = 0.7 × Huber Loss + 0.3 × MAE
```

**Kenapa menggabungkan 2 loss?**

| Loss | Kelebihan | Kekurangan |
|---|---|---|
| **MSE** (Mean Squared Error) | Sensitif terhadap error besar | Terlalu sensitif terhadap outlier |
| **MAE** (Mean Absolute Error) | Mudah diinterpretasi, stabil | Gradien konstan, training lambat |
| **Huber Loss** | Gabungan MSE & MAE — tahan outlier | Kurang intuitif |

Dengan menggabungkan Huber (70%) dan MAE (30%):
- Model **tahan terhadap outlier** (data yang nilainya ekstrem)
- Training tetap **stabil**
- Error tetap **mudah diinterpretasi**

> **Kalau ditanya:** *"Kenapa tidak pakai MSE biasa?"*
> Jawab: "MSE menghitung kuadrat error, jadi kalau ada satu data yang sangat berbeda (outlier), MSE akan sangat besar dan mengganggu training. Huber Loss lebih tahan terhadap outlier. Saya kombinasikan dengan MAE agar hasilnya juga mudah diinterpretasi."

---

## Bagian 5: Custom Callback — `EarlyStoppingWithRestore`

```python
class EarlyStoppingWithRestore(keras.callbacks.Callback):
```

**Apa itu Callback?** Callback adalah fungsi yang dipanggil otomatis di setiap akhir epoch training. Kita bisa memantau dan mengontrol proses training.

```python
    def on_epoch_end(self, epoch, logs=None):
        current_loss = logs.get('val_loss')
        if current_loss < self.best_loss - self.min_delta:
            # Ada perbaikan → simpan bobot terbaik
            self.best_loss = current_loss
            self.best_weights = self.model.get_weights()
            self.wait = 0
        else:
            # Tidak ada perbaikan
            self.wait += 1
            if self.wait >= self.patience:  # patience = 20
                # Berhenti dan kembalikan bobot terbaik
                self.model.stop_training = True
                self.model.set_weights(self.best_weights)
```

**Cara kerja (analogi sederhana):**
1. Setiap epoch, cek: "Apakah val_loss (error pada data validasi) mengecil?"
2. Kalau **iya** → simpan bobot model ini sebagai "terbaik saat ini"
3. Kalau **tidak** → catat (counter +1)
4. Kalau **20 epoch berturut-turut** tidak ada perbaikan → **STOP training** dan kembalikan bobot terbaik

**Kenapa ini penting?**
- Tanpa early stopping, model bisa **overfitting** — belajar terlalu lama sampai menghafal data training, tapi buruk pada data baru
- Fitur "restore best weights" memastikan kita selalu dapat model terbaik, bukan model terakhir

> **Kalau ditanya:** *"Bedanya dengan EarlyStopping bawaan Keras?"*
> Jawab: "Secara fungsional mirip, tapi saya membuat dari awal (from scratch) sebagai custom callback untuk memenuhi checklist capstone. Selain itu, saya menambahkan logging progress dan tracking improvement history."

---

## Bagian 6: Build Model (Functional API)

```python
def build_model(input_dim):
    inputs = keras.Input(shape=(input_dim,), name='features_input')
```

**Apa itu Functional API?**
TensorFlow/Keras punya 3 cara membuat model:
1. **Sequential** → Layer ditumpuk linear (paling sederhana)
2. **Functional API** → Lebih fleksibel, bisa bercabang ← **YANG KITA PAKAI**
3. **Model Subclassing** → Paling fleksibel, tapi paling kompleks

Functional API dimulai dengan mendefinisikan `Input`, lalu merangkai layer-layer, dan diakhiri dengan `keras.Model(inputs, outputs)`.

```python
    # Layer awal: transformasi fitur
    x = keras.layers.Dense(128, kernel_initializer='he_normal')(inputs)
    x = keras.layers.BatchNormalization()(x)
    x = keras.layers.Activation('relu')(x)
    x = keras.layers.Dropout(0.2)(x)

    # Proyeksi ke 256 dimensi untuk residual blocks
    x = keras.layers.Dense(256, kernel_initializer='he_normal')(x)
    x = keras.layers.BatchNormalization()(x)
    x = keras.layers.Activation('relu')(x)

    # Custom Residual Dense Blocks
    x = ResidualDenseBlock(units=512, dropout_rate=0.3, name='res_block_1')(x)
    x = ResidualDenseBlock(units=512, dropout_rate=0.3, name='res_block_2')(x)

    # Layer akhir: menyempitkan ke output
    x = keras.layers.Dense(64, activation='relu')(x)
    x = keras.layers.Dropout(0.2)(x)
    x = keras.layers.Dense(32, activation='relu')(x)

    # Output: 1 neuron untuk prediksi Quantity of Food
    outputs = keras.layers.Dense(1, name='quantity_output')(x)

    model = keras.Model(inputs=inputs, outputs=outputs, name='FoodStockPredictor')
```

**Alur data (analogi):**
```
7 fitur → diperbesar ke 128 → diperbesar ke 256 → diproses ResBlock (512→256) ×2 
→ diperkecil ke 64 → diperkecil ke 32 → 1 output (prediksi)
```

**Kenapa bentuknya seperti kerucut terbalik lalu kerucut?**
- Awalnya dimensi diperbesar (128 → 256 → 512) agar model bisa belajar representasi yang kaya dan kompleks
- Lalu dikecilkan (64 → 32 → 1) untuk "merangkum" semua informasi menjadi satu prediksi

> **Kalau ditanya:** *"Kenapa pakai Functional API, bukan Sequential?"*
> Jawab: "Karena checklist capstone mengharuskan Functional API atau Model Subclassing. Selain itu, Functional API lebih fleksibel — bisa mendukung arsitektur dengan residual connection, multiple input/output, dan branching."

---

## Bagian 7: Training

```python
    custom_loss = HuberMAELoss(delta=1.0, alpha=0.7)
    optimizer = keras.optimizers.Adam(learning_rate=learning_rate)
```

**Penjelasan:**
- **Loss function** = HuberMAELoss (custom kita)
- **Optimizer** = Adam → algoritma optimasi yang paling populer, mengatur bagaimana bobot model diupdate
- **Learning rate** = 0.001 → seberapa besar langkah update bobot. Terlalu besar = tidak stabil, terlalu kecil = training terlalu lama

```python
    model.compile(
        optimizer=optimizer,
        loss=custom_loss,
        metrics=[
            keras.metrics.MeanAbsoluteError(name='mae'),
            keras.metrics.RootMeanSquaredError(name='rmse'),
        ]
    )
```

**Penjelasan `compile`:**
- "Menyiapkan" model untuk training dengan menentukan optimizer, loss, dan metrik evaluasi
- `mae` dan `rmse` hanya untuk monitoring, tidak mempengaruhi training (hanya loss yang mempengaruhi)

```python
    callbacks = [
        EarlyStoppingWithRestore(patience=20, min_delta=1e-4, verbose=1),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss', factor=0.5, patience=10, min_lr=1e-6),
    ]
```

**Penjelasan callbacks:**
1. `EarlyStoppingWithRestore` → Custom callback kita: stop jika 20 epoch tanpa perbaikan
2. `ReduceLROnPlateau` → Jika 10 epoch tanpa perbaikan, kurangi learning rate setengahnya. Ini seperti "jalan lebih pelan-pelan" agar tidak melewati titik optimal

```python
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=200, batch_size=32,
        callbacks=callbacks)
```

**Penjelasan `fit`:**
- Proses training sebenarnya dimulai di sini
- `epochs=200` → maksimal 200 kali iterasi seluruh data (tapi bisa berhenti lebih awal karena EarlyStopping)
- `batch_size=32` → setiap step, model melihat 32 data sekaligus (bukan satu per satu)

---

## Bagian 8: Evaluasi

```python
    y_pred_scaled = model.predict(X_test, verbose=0).flatten()
    y_pred = scaler_y.inverse_transform(y_pred_scaled.reshape(-1, 1)).flatten()
    y_true = scaler_y.inverse_transform(y_test.reshape(-1, 1)).flatten()
```

**Penjelasan:**
1. Model memprediksi data test → hasilnya masih dalam skala normalisasi
2. `inverse_transform` → kembalikan ke skala asli (280-500)
3. Bandingkan prediksi vs nilai asli untuk menghitung metrik

---

## Bagian 9: Save Model

```python
    model.save('food_waste_model.keras')
```

**Penjelasan:**
- Simpan seluruh model (arsitektur + bobot + optimizer) ke file `.keras`
- File ini bisa di-load kembali tanpa perlu training ulang
- Format `.keras` adalah format standar TensorFlow yang siap produksi

```python
    artifacts = {
        'feature_cols': feature_cols,
        'scaler_X_mean': scaler_X.mean_.tolist(),
        'scaler_X_scale': scaler_X.scale_.tolist(),
        'label_encoders': { col: list(le.classes_) ... }
    }
    with open('model_artifacts.json', 'w') as f:
        json.dump(artifacts, f, indent=2)
```

**Penjelasan:**
- Selain model, kita juga perlu menyimpan **konfigurasi preprocessing**
- Saat inference nanti, data input baru harus di-encode dan di-scale dengan cara yang **persis sama** seperti saat training
- File JSON ini menyimpan informasi scaler dan encoder agar bisa digunakan kembali

---

## Bagian 10: Inference (Prediksi Data Baru)

```python
def predict_food_quantity(model, artifacts, input_data):
    # 1. Ambil konfigurasi preprocessing
    feature_cols = artifacts['feature_cols']
    scaler_X_mean = np.array(artifacts['scaler_X_mean'])
    scaler_X_scale = np.array(artifacts['scaler_X_scale'])

    # 2. Encode fitur kategorikal (teks → angka)
    features = []
    for col in feature_cols:
        val = input_data[col]
        if col in cat_cols:
            classes = label_encoders[col]
            val = classes.index(val)  # "Meat" → 3
        features.append(float(val))

    # 3. Scale fitur (normalisasi)
    X = np.array([features], dtype=np.float32)
    X_scaled = (X - scaler_X_mean) / scaler_X_scale

    # 4. Prediksi (hasilnya masih ter-scale)
    y_pred_scaled = model.predict(X_scaled).flatten()[0]

    # 5. Kembalikan ke skala asli
    y_pred = y_pred_scaled * scaler_y_scale + scaler_y_mean

    return y_pred
```

**Alur inference:**
```
Input user (teks/angka) → Encode → Scale → Model prediksi → Inverse scale → Hasil
```

---

## FAQ — Pertanyaan yang Mungkin Ditanyakan

### Q: "Kenapa pakai Deep Learning? Kenapa tidak pakai model sederhana?"
**A:** Checklist capstone mengharuskan penggunaan Deep Learning dengan TensorFlow Functional API. Selain itu, deep learning mampu menangkap hubungan non-linear yang kompleks antar fitur, yang mungkin tidak bisa ditangkap model linear sederhana.

### Q: "Apa itu overfitting dan bagaimana cara mengatasinya?"
**A:** Overfitting adalah ketika model terlalu menghafal data training sehingga performanya buruk pada data baru. Saya mengatasinya dengan:
1. **Dropout** → Mematikan neuron secara acak saat training
2. **BatchNormalization** → Menormalkan output setiap layer
3. **EarlyStopping** → Menghentikan training jika model mulai overfitting
4. **Train/Val/Test split** → Memisahkan data evaluasi

### Q: "Kenapa akurasi model ~92%? Bisa lebih tinggi?"
**A:** Ini task regresi, bukan klasifikasi. MAPE 7.56% sudah cukup baik. Untuk meningkatkan performa, bisa dicoba:
- Menambah data training
- Feature engineering (membuat fitur baru)
- Hyperparameter tuning
- Menggunakan arsitektur model yang berbeda

### Q: "Apa itu `register_keras_serializable`?"
**A:** Ini adalah decorator yang mendaftarkan custom class kita ke sistem serialisasi Keras. Tanpa ini, model tidak bisa disimpan dan di-load kembali karena Keras tidak mengenali custom layer/loss kita.

### Q: "Kenapa pakai `he_normal` sebagai kernel_initializer?"
**A:** `he_normal` adalah teknik inisialisasi bobot yang dirancang khusus untuk aktivasi ReLU. Ini membantu model belajar lebih cepat di awal training dibanding inisialisasi random biasa.
