import { runPrediction } from "../services/predictionService";
import { useState } from "react";
import PredictionLoading from "../components/PredictionLoading";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  Info,
  Bell,
  Settings,
  ChefHat,
  Users,
  CalendarDays,
  Thermometer,
  Sun,
  UtensilsCrossed,
  Trash2,
  Plus,
  Upload,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";

// ── Opsi Dropdown sesuai model AI ──
const FOOD_TYPES = ["Baked Goods", "Dairy Products", "Fruits", "Meat", "Vegetables"];
const EVENT_TYPES = ["Birthday", "Corporate", "Social Gathering", "Wedding"];
const STORAGE_CONDITIONS = ["Refrigerated", "Room Temperature"];
const SEASONALITY = ["All Seasons", "Summer", "Winter"];
const PREPARATION_METHODS = ["Buffet", "Finger Food", "Sit-down Dinner"];

const FIELD_ICONS = {
  type_of_food: <ChefHat size={16} className="text-primary-600" />,
  event_type: <CalendarDays size={16} className="text-primary-600" />,
  storage_conditions: <Thermometer size={16} className="text-primary-600" />,
  seasonality: <Sun size={16} className="text-primary-600" />,
  preparation_method: <UtensilsCrossed size={16} className="text-primary-600" />,
};

const defaultEntry = () => ({
  id: Date.now(),
  type_of_food: "Meat",
  number_of_guests: "",
  event_type: "Corporate",
  storage_conditions: "Refrigerated",
  seasonality: "All Seasons",
  preparation_method: "Buffet",
  wastage_food_amount: "",
});

// ── Komponen Select ──
function SelectField({ label, icon, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
        {icon} {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Komponen Number Input ──
function NumberField({ label, icon, value, onChange, placeholder, min, max }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
        {icon} {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
      />
    </div>
  );
}

export default function InputDataPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [mode, setMode] = useState("single"); // "single" | "batch"
  const [singleEntry, setSingleEntry] = useState(defaultEntry());
  const [batchEntries, setBatchEntries] = useState([defaultEntry()]);
  const [error, setError] = useState(null);

  const updateSingle = (field, value) =>
    setSingleEntry((prev) => ({ ...prev, [field]: value }));

  const updateBatch = (id, field, value) =>
    setBatchEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );

  const addBatchRow = () =>
    setBatchEntries((prev) => [...prev, defaultEntry()]);

  const removeBatchRow = (id) =>
    setBatchEntries((prev) => prev.filter((e) => e.id !== id));

  const validateEntry = (entry) =>
    entry.number_of_guests > 0 &&
    entry.number_of_guests <= 1000 &&
    entry.wastage_food_amount >= 0 &&
    entry.wastage_food_amount <= 100;

  const handleRunPrediction = async () => {
    setError(null);
    const payload =
      mode === "single"
        ? {
            ...singleEntry,
            number_of_guests: parseInt(singleEntry.number_of_guests),
            wastage_food_amount: parseFloat(singleEntry.wastage_food_amount),
          }
        : batchEntries.map((e) => ({
            ...e,
            number_of_guests: parseInt(e.number_of_guests),
            wastage_food_amount: parseFloat(e.wastage_food_amount),
          }));

    const toValidate = mode === "single" ? [payload] : payload;
    if (toValidate.some((e) => !validateEntry(e))) {
      setError(
        "Pastikan Jumlah Tamu diisi (1–1000) dan Estimasi Sisa Makanan (0–100)."
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await runPrediction(
        mode === "single" ? payload : { items: payload }
      );
      navigate("/predictions", {
        state: {
          predictionData: result.data,
          mode,
          input: payload,
        },
      });
    } catch (err) {
      console.error("Prediction error:", err);
      setError("Gagal menghubungi server prediksi. Pastikan backend berjalan.");
      setIsLoading(false);
    }
  };

  if (isLoading)
    return (
      <PredictionLoading
        onComplete={() => {}}
      />
    );

  return (
    <AppLayout>
      <div className="p-8">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">Input Data Acara</h1>
            <p className="text-gray-400 text-sm mt-1">
              Masukkan detail acara untuk mendapatkan prediksi porsi makanan optimal
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary-800 transition-colors">
              <Bell size={16} />
            </button>
            <button className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary-800 transition-colors">
              <Settings size={16} />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 text-xs font-bold">
              U
            </div>
          </div>
        </div>

        {/* ── Mode Toggle ── */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setMode("single")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === "single"
                ? "bg-primary-800 text-white shadow"
                : "bg-white text-gray-500 border border-gray-200 hover:border-primary-300"
            }`}
          >
            Input Satu Acara
          </button>
          <button
            onClick={() => setMode("batch")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === "batch"
                ? "bg-primary-800 text-white shadow"
                : "bg-white text-gray-500 border border-gray-200 hover:border-primary-300"
            }`}
          >
            Input Banyak Acara
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* ── Left: Form ── */}
          <div className="col-span-2 flex flex-col gap-6">

            {/* ── Single Event Form ── */}
            {mode === "single" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-5">
                  Detail Acara
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Jenis Makanan"
                    icon={FIELD_ICONS.type_of_food}
                    value={singleEntry.type_of_food}
                    onChange={(v) => updateSingle("type_of_food", v)}
                    options={FOOD_TYPES}
                  />
                  <NumberField
                    label="Jumlah Tamu"
                    icon={<Users size={16} className="text-primary-600" />}
                    value={singleEntry.number_of_guests}
                    onChange={(v) => updateSingle("number_of_guests", v)}
                    placeholder="cth. 300"
                    min={1}
                    max={1000}
                  />
                  <SelectField
                    label="Tipe Acara"
                    icon={FIELD_ICONS.event_type}
                    value={singleEntry.event_type}
                    onChange={(v) => updateSingle("event_type", v)}
                    options={EVENT_TYPES}
                  />
                  <SelectField
                    label="Kondisi Penyimpanan"
                    icon={FIELD_ICONS.storage_conditions}
                    value={singleEntry.storage_conditions}
                    onChange={(v) => updateSingle("storage_conditions", v)}
                    options={STORAGE_CONDITIONS}
                  />
                  <SelectField
                    label="Musim / Seasonality"
                    icon={FIELD_ICONS.seasonality}
                    value={singleEntry.seasonality}
                    onChange={(v) => updateSingle("seasonality", v)}
                    options={SEASONALITY}
                  />
                  <SelectField
                    label="Metode Penyajian"
                    icon={FIELD_ICONS.preparation_method}
                    value={singleEntry.preparation_method}
                    onChange={(v) => updateSingle("preparation_method", v)}
                    options={PREPARATION_METHODS}
                  />
                  <div className="col-span-2">
                    <NumberField
                      label="Estimasi Sisa Makanan (porsi)"
                      icon={<Trash2 size={16} className="text-primary-600" />}
                      value={singleEntry.wastage_food_amount}
                      onChange={(v) => updateSingle("wastage_food_amount", v)}
                      placeholder="cth. 25"
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Batch Form ── */}
            {mode === "batch" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-5">
                  Daftar Acara
                </p>
                <div className="flex flex-col gap-6">
                  {batchEntries.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="border border-gray-100 rounded-2xl p-4 relative"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-primary-700 uppercase tracking-widest">
                          Acara #{idx + 1}
                        </span>
                        {batchEntries.length > 1 && (
                          <button
                            onClick={() => removeBatchRow(entry.id)}
                            className="text-gray-300 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <SelectField
                          label="Jenis Makanan"
                          icon={FIELD_ICONS.type_of_food}
                          value={entry.type_of_food}
                          onChange={(v) => updateBatch(entry.id, "type_of_food", v)}
                          options={FOOD_TYPES}
                        />
                        <NumberField
                          label="Jumlah Tamu"
                          icon={<Users size={16} className="text-primary-600" />}
                          value={entry.number_of_guests}
                          onChange={(v) => updateBatch(entry.id, "number_of_guests", v)}
                          placeholder="cth. 300"
                          min={1}
                          max={1000}
                        />
                        <SelectField
                          label="Tipe Acara"
                          icon={FIELD_ICONS.event_type}
                          value={entry.event_type}
                          onChange={(v) => updateBatch(entry.id, "event_type", v)}
                          options={EVENT_TYPES}
                        />
                        <SelectField
                          label="Kondisi Penyimpanan"
                          icon={FIELD_ICONS.storage_conditions}
                          value={entry.storage_conditions}
                          onChange={(v) => updateBatch(entry.id, "storage_conditions", v)}
                          options={STORAGE_CONDITIONS}
                        />
                        <SelectField
                          label="Musim / Seasonality"
                          icon={FIELD_ICONS.seasonality}
                          value={entry.seasonality}
                          onChange={(v) => updateBatch(entry.id, "seasonality", v)}
                          options={SEASONALITY}
                        />
                        <SelectField
                          label="Metode Penyajian"
                          icon={FIELD_ICONS.preparation_method}
                          value={entry.preparation_method}
                          onChange={(v) => updateBatch(entry.id, "preparation_method", v)}
                          options={PREPARATION_METHODS}
                        />
                        <div className="col-span-2">
                          <NumberField
                            label="Estimasi Sisa Makanan (porsi)"
                            icon={<Trash2 size={16} className="text-primary-600" />}
                            value={entry.wastage_food_amount}
                            onChange={(v) => updateBatch(entry.id, "wastage_food_amount", v)}
                            placeholder="cth. 25"
                            min={0}
                            max={100}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addBatchRow}
                    className="flex items-center gap-2 text-sm text-primary-700 font-medium border border-primary-200 rounded-xl px-4 py-2.5 hover:bg-primary-50 transition-colors w-fit"
                  >
                    <Plus size={16} />
                    Tambah Acara
                  </button>
                </div>
              </div>
            )}

            {/* ── Error Message ── */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <Info size={16} className="text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* ── Right: Action Panel ── */}
          <div className="flex flex-col gap-5">
            {/* Ready to Process */}
            <div className="bg-primary-800 rounded-2xl p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-300 mb-3">
                Siap Diprediksi?
              </p>
              <p className="text-sm text-primary-100 leading-relaxed mb-6">
                Model AI kami akan menghitung estimasi porsi makanan optimal berdasarkan
                detail acara yang kamu masukkan untuk meminimalkan food waste.
              </p>
              <button
                id="run-prediction-btn"
                onClick={handleRunPrediction}
                className="w-full bg-white text-primary-800 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-50 transition-colors"
              >
                <Sparkles size={16} />
                Jalankan Prediksi
              </button>
            </div>

            {/* Info cards */}
            {[
              {
                icon: <ShieldCheck size={16} className="text-primary-700" />,
                title: "Model Terlatih",
                desc: "Dilatih menggunakan dataset acara katering dengan berbagai tipe makanan dan kondisi penyimpanan.",
              },
              {
                icon: <ChefHat size={16} className="text-primary-700" />,
                title: "5 Kategori Makanan",
                desc: "Baked Goods, Dairy, Fruits, Meat, dan Vegetables — semua didukung model AI.",
              },
              {
                icon: <Users size={16} className="text-primary-700" />,
                title: "1 – 1.000 Tamu",
                desc: "Model dapat memprediksi untuk berbagai skala acara dari kecil hingga besar.",
              },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm flex gap-4">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  {card.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">{card.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}

            {/* Format CSV hint */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Upload size={15} className="text-amber-600" />
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                  Format CSV Batch
                </p>
              </div>
              <p className="text-xs text-amber-600 leading-relaxed">
                Kolom yang diperlukan:{" "}
                <span className="font-mono bg-amber-100 px-1 rounded">type_of_food</span>,{" "}
                <span className="font-mono bg-amber-100 px-1 rounded">number_of_guests</span>,{" "}
                <span className="font-mono bg-amber-100 px-1 rounded">event_type</span>,{" "}
                <span className="font-mono bg-amber-100 px-1 rounded">storage_conditions</span>,{" "}
                <span className="font-mono bg-amber-100 px-1 rounded">seasonality</span>,{" "}
                <span className="font-mono bg-amber-100 px-1 rounded">preparation_method</span>,{" "}
                <span className="font-mono bg-amber-100 px-1 rounded">wastage_food_amount</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}