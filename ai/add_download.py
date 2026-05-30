import json

with open('notebooks/CC26_AI_Model_Final.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

download_cell = {
  "cell_type": "code",
  "execution_count": None,
  "metadata": {},
  "outputs": [],
  "source": [
    "# Jalankan cell ini khusus di Google Colab untuk mendownload file model otomatis\n",
    "try:\n",
    "    from google.colab import files\n",
    "    \n",
    "    print('Mengunduh model_artifacts.json...')\n",
    "    files.download('model_artifacts.json')\n",
    "    \n",
    "    print('Mengunduh food_waste_model.keras...')\n",
    "    files.download('food_waste_model.keras')\n",
    "    \n",
    "    print('Mengunduh scaler.pkl...')\n",
    "    files.download('scaler.pkl')\n",
    "except ImportError:\n",
    "    print('Anda tidak menjalankan ini di Google Colab. File sudah tersedia di lokal.')\n"
  ]
}

nb['cells'].append(download_cell)

with open('notebooks/CC26_AI_Model_Final.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2)

print("Berhasil menambahkan cell download di notebook.")
