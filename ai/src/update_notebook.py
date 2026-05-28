import json
import pickle

with open('CC26_AI_Model (2).ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

custom_components_code = """@keras.utils.register_keras_serializable(package="FoodWaste")
class ResidualDenseBlock(keras.layers.Layer):
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

    def call(self, inputs, training=False):
        x = self.dense1(inputs)
        x = self.bn1(x, training=training)
        x = tf.nn.relu(x)
        x = self.dropout(x, training=training)
        x = self.dense2(x)
        x = self.bn2(x, training=training)
        return tf.nn.relu(x + inputs)

    def get_config(self):
        config = super().get_config()
        config.update({'units': self.units, 'dropout_rate': self.dropout_rate})
        return config

@keras.utils.register_keras_serializable(package="FoodWaste")
class HuberMAELoss(keras.losses.Loss):
    def __init__(self, delta=1.0, alpha=0.7, **kwargs):
        super().__init__(**kwargs)
        self.delta = delta
        self.alpha = alpha

    def call(self, y_true, y_pred):
        huber = tf.keras.losses.huber(y_true, y_pred, delta=self.delta)
        mae = tf.reduce_mean(tf.abs(y_true - y_pred))
        return self.alpha * huber + (1.0 - self.alpha) * mae

    def get_config(self):
        config = super().get_config()
        config.update({'delta': self.delta, 'alpha': self.alpha})
        return config

class EarlyStoppingWithRestore(keras.callbacks.Callback):
    def __init__(self, patience=20, min_delta=1e-4, verbose=1):
        super().__init__()
        self.patience = patience
        self.min_delta = min_delta
        self.verbose = verbose
        self.wait = 0
        self.best_loss = np.inf
        self.best_weights = None

    def on_train_begin(self, logs=None):
        self.wait = 0
        self.best_loss = np.inf

    def on_epoch_end(self, epoch, logs=None):
        current_loss = logs.get('val_loss')
        if current_loss is None:
            return

        if current_loss < self.best_loss - self.min_delta:
            self.best_loss = current_loss
            self.best_weights = self.model.get_weights()
            self.wait = 0
        else:
            self.wait += 1
            if self.wait >= self.patience:
                self.model.stop_training = True
                if self.verbose > 0:
                    print(f'\\nEpoch {epoch+1}: early stopping, restoring best weights.')
                if self.best_weights is not None:
                    self.model.set_weights(self.best_weights)
"""
nb['cells'][10]['source'] = ['## STEP 5 — Custom Components (Layer, Loss, Callback)\n', '\n', 'Memenuhi syarat MVP Capstone: minimal ada 1 komponen custom. Di sini kita membuat 3 sekaligus:\n', '- `ResidualDenseBlock`: Custom Layer\n', '- `HuberMAELoss`: Custom Loss\n', '- `EarlyStoppingWithRestore`: Custom Callback']
nb['cells'][11]['source'] = [line + '\n' for line in custom_components_code.split('\n')]

arch_code = """inputs = keras.Input(shape=(7,), name='features_input')
x = keras.layers.Dense(128, kernel_initializer='he_normal')(inputs)
x = keras.layers.BatchNormalization()(x)
x = keras.layers.Activation('relu')(x)
x = keras.layers.Dropout(0.2)(x)
x = keras.layers.Dense(256, kernel_initializer='he_normal')(x)
x = keras.layers.BatchNormalization()(x)
x = keras.layers.Activation('relu')(x)

x = ResidualDenseBlock(units=512, dropout_rate=0.3, name='res_block_1')(x)
x = ResidualDenseBlock(units=512, dropout_rate=0.3, name='res_block_2')(x)

x = keras.layers.Dense(64, activation='relu')(x)
x = keras.layers.Dropout(0.2)(x)
x = keras.layers.Dense(32, activation='relu')(x)

outputs = keras.layers.Dense(1, name='quantity_output')(x)

model = keras.Model(inputs=inputs, outputs=outputs, name='FoodStockPredictor')

optimizer = keras.optimizers.Adam(learning_rate=0.001)
model.compile(optimizer=optimizer, loss=HuberMAELoss(delta=1.0, alpha=0.7), metrics=['mae'])
model.summary()
"""
nb['cells'][13]['source'] = [line + '\n' for line in arch_code.split('\n')]

train_code = """callbacks_list = [
    EarlyStoppingWithRestore(patience=20, min_delta=1e-4, verbose=1),
    keras.callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=10, min_lr=1e-6, verbose=1)
]

history = model.fit(
    X_train, y_train,
    validation_split=0.2,
    epochs=200,
    batch_size=32,
    callbacks=callbacks_list,
    verbose=1
)
print('Training selesai')
"""
nb['cells'][15]['source'] = [line + '\n' for line in train_code.split('\n')]

save_code = """import json
import pickle

model.save('food_waste_model.keras')

artifacts = {
    'feature_cols': categorical_cols + ['Number of Guests', 'Wastage Food Amount'],
    'label_encoders': {col: list(le.classes_) for col, le in encoders.items()}
}
with open('model_artifacts.json', 'w') as f:
    json.dump(artifacts, f, indent=2)

with open('scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)
print('Model dan artifacts disimpan!')
"""
nb['cells'][21]['source'] = [line + '\n' for line in save_code.split('\n')]

inference_code = """import json
import pickle

# Jika perlu, load model kembali
# loaded_model = keras.models.load_model('food_waste_model.keras')

with open('model_artifacts.json', 'r') as f:
    artifacts = json.load(f)
loaded_encoders = artifacts['label_encoders']

with open('scaler.pkl', 'rb') as f:
    loaded_scaler = pickle.load(f)

def predict_optimal_stock(type_of_food, num_guests, event_type,
                           storage_conditions, seasonality,
                           preparation_method, wastage_food_amount):
                           
    input_data = {
        'Type of Food': type_of_food,
        'Number of Guests': num_guests,
        'Event Type': event_type,
        'Storage Conditions': storage_conditions,
        'Seasonality': seasonality,
        'Preparation Method': preparation_method,
        'Wastage Food Amount': wastage_food_amount
    }
    
    # Label encoding
    for col in loaded_encoders.keys():
        if input_data[col] in loaded_encoders[col]:
            input_data[col] = loaded_encoders[col].index(input_data[col])
        else:
            input_data[col] = 0
            
    input_df = pd.DataFrame([input_data])
    
    # Pastikan urutan fitur sama persis dengan saat training
    feature_cols = artifacts['feature_cols']
    input_df = input_df[feature_cols]
    
    input_scaled = loaded_scaler.transform(input_df)
    predicted = model.predict(input_scaled, verbose=0)[0][0]
    predicted_qty = max(0, round(predicted))

    waste_ratio = (wastage_food_amount / predicted_qty) * 100 if predicted_qty > 0 else 0

    if waste_ratio > 15:
        recommendation = 'Waste ratio TINGGI — pertimbangkan kurangi order'
        detail = (f'Dari {predicted_qty} porsi yang disiapkan, sekitar {wastage_food_amount} porsi '
                  f'({waste_ratio:.1f}%) diprediksi terbuang. '
                  f'Coba kurangi stok atau ubah metode penyajian.')
    elif waste_ratio < 5:
        recommendation = 'Waste ratio RENDAH — stok sudah sangat efisien'
        detail = (f'Dari {predicted_qty} porsi yang disiapkan, hanya {wastage_food_amount} porsi '
                  f'({waste_ratio:.1f}%) yang diprediksi terbuang. '
                  f'Stok kamu sudah optimal!')
    else:
        recommendation = 'Waste ratio NORMAL — stok sudah efisien'
        detail = (f'Dari {predicted_qty} porsi yang disiapkan, sekitar {wastage_food_amount} porsi '
                  f'({waste_ratio:.1f}%) diprediksi terbuang. '
                  f'Masih dalam batas wajar, bisa tambah buffer 5% jika perlu.')

    return predicted_qty, waste_ratio, recommendation, detail

qty, waste_ratio, rec, detail = predict_optimal_stock(
    type_of_food        = 'Vegetables',
    num_guests          = 450,
    event_type          = 'Birthday',
    storage_conditions  = 'Room Temperature',
    seasonality         = 'Summer',
    preparation_method  = 'Buffet',
    wastage_food_amount = 50
)

print('HASIL PREDIKSI')
print(f'Stok Optimal : {qty} porsi')
print(f'Waste Ratio  : {waste_ratio:.1f}%')
print(f'Rekomendasi  : {rec}')
print(f'Detail       : {detail}')
"""
nb['cells'][23]['source'] = [line + '\n' for line in inference_code.split('\n')]

with open('CC26_AI_Model_Final.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2)

print("Notebook berhasil diupdate sebagai CC26_AI_Model_Final.ipynb")
