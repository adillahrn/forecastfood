# Persiapan Sesi Mandatory Mentoring (DBS Coding Camp 2026)

**Tim:** [Nama Tim Anda]  
**Proyek:** Food Stock Optimization & Waste Reduction (Capstone)  
**Tujuan Proyek:** Membangun AI untuk memprediksi stok makanan yang optimal berdasarkan karakteristik *event* guna meminimalisir *food waste* tanpa menyebabkan kehabisan stok.

---

## 1. Update Progres Saat Ini
Pengembangan model *Machine Learning* (Main Quest) sudah mencapai tahap akhir (siap produksi). 
- **Data Pipeline:** Preprocessing (Encoding & Normalization) sudah diimplementasikan dan disimpan dalam bentuk artefak (`model_artifacts.json` dan `scaler.pkl`) agar konsisten antara training dan *inference*.
- **Model Training:** Model Deep Learning telah berhasil dilatih dengan metrik yang sangat memuaskan (Akurasi/MAPE ~92%, Normalized MAE ~0.005).
- **Export Model:** Model telah disimpan dalam format standar industri terbaru, yaitu `food_waste_model.keras`.
- **Inference Sederhana:** Telah diujicobakan fungsi prediksi di *notebook* yang otomatis melabeli input, memproses *scaling*, memprediksi stok, dan memberikan rekomendasi teks.

## 2. Arsitektur & Pendekatan Teknis
Kami menggunakan pendekatan regresi dengan **TensorFlow Functional API** agar model dapat memproses fitur secara fleksibel. Kami telah mengimplementasikan beberapa komponen arsitektur *custom* tingkat lanjut:
- **Custom Layer (`ResidualDenseBlock`):** Kami membangun blok Dense dengan *skip connection* (Residual) layaknya arsitektur ResNet untuk mencegah *vanishing gradient* dan mempercepat konvergensi pada data tabular.
- **Custom Loss Function (`HuberMAELoss`):** Menggabungkan Huber Loss (tahan outlier) dan MAE untuk mendapatkan training yang stabil.
- **Custom Callback (`EarlyStoppingWithRestore`):** Untuk menjaga model dari *overfitting* dan selalu mengambil bobot (weights) terbaik secara otomatis.

## 3. Kendala (Blocker) & Langkah Selanjutnya
Secara arsitektur AI *Deep Learning*, kami sudah melewati rintangan utama. Namun, saat ini kami akan bersiap memasuki fase integrasi yang masih butuh pendalaman:
- **Deployment Backend (API):** Kami sedang mempelajari bagaimana cara menyajikan file `.keras` dan `.pkl` ini ke dalam sebuah *endpoint* (rencana menggunakan FastAPI / Flask) agar bisa menerima *request* HTTP.
- **Integrasi UI:** Menyambungkan Backend API ke Frontend agar pengguna dapat memasukkan data input secara visual.
- **Pengembangan Tambahan (Side Quest):** Kami berencana mengeksplorasi penggunaan API Generative AI (LLM) di masa mendatang, tapi saat ini prioritas utama adalah memastikan model dasar berhasil di-*deploy* ke aplikasi.

--- 
*Catatan untuk Tim: Dokumen ini bisa langsung dikirimkan atau dipresentasikan kepada Advisor untuk update Sesi Mentoring.*
