# Gunakan image Python yang ringan
FROM python:3.10-slim

# Set direktori kerja di dalam container
WORKDIR /app

# Salin file requirements.txt (berada di dalam folder api)
COPY api/requirements.txt .

# Install dependensi (termasuk FastAPI, TensorFlow, dll)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Salin semua direktori dan file dari folder `ai` (termasuk folder api, models, dan src)
COPY . .

# Hugging Face Spaces menggunakan port 7860 secara default
EXPOSE 7860

# Perintah untuk menjalankan FastAPI server
# `api.main:app` merujuk ke object `app` di dalam `api/main.py`
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "7860"]
