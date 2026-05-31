import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Download,
  ArrowLeft,
  ChefHat,
  Users,
  CalendarDays,
  Thermometer,
  Sun,
  UtensilsCrossed,
  Trash2,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";

// ── Label Mapping ──
const FOOD_TYPE_LABELS = {
  "Baked Goods": "🥐 Baked Goods",
  "Dairy Products": "🥛 Dairy Products",
  Fruits: "🍎 Fruits",
  Meat: "🥩 Meat",
  Vegetables: "🥦 Vegetables",
};

const EVENT_TYPE_LABELS = {
  Birthday: "🎂 Birthday",
  Corporate: "💼 Corporate",
  "Social Gathering": "🎉 Social Gathering",
  Wedding: "💍 Wedding",
};

const METHOD_LABELS = {
  Buffet: "🍽️ Buffet",
  "Finger Food": "🤏 Finger Food",
  "Sit-down Dinner": "🪑 Sit-down Dinner",
};

const STORAGE_LABELS = {
  Refrigerated: "❄️ Refrigerated",
  "Room Temperature": "🌡️ Room Temperature",
};

const SEASON_LABELS = {
  "All Seasons": "🌍 All Seasons",
  Summer: "☀️ Summer",
  Winter: "❄️ Winter",
};

// ── Helper ──
function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="text-xs font-semibold text-gray-800">{value}</span>
    </div>
  );
}

// ── Download CSV ──
function downloadCSV(predictions, inputs) {
  const isBatch = Array.isArray(inputs);
  const rows = isBatch
    ? predictions.map((p, i) => ({
        ...inputs[i],
        predicted_quantity: p.predicted_quantity,
      }))
    : [{ ...inputs, predicted_quantity: predictions[0]?.predicted_quantity ?? predictions }];

  const headers = [
    "type_of_food",
    "number_of_guests",
    "event_type",
    "storage_conditions",
    "seasonality",
    "preparation_method",
    "wastage_food_amount",
    "predicted_quantity",
  ];
  const csvContent =
    headers.join(",") +
    "\n" +
    rows
      .map((r) => headers.map((h) => `"${r[h] ?? ""}"`).join(","))
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "forecastfood_predictions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function PredictionResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { predictionData, mode, input } = location.state || {};
  const [showAll, setShowAll] = useState(false);

  const isBatch = mode === "batch";

  // Normalise data
  const predictions = isBatch
    ? predictionData?.predictions ?? []
    : predictionData
    ? [{ predicted_quantity: predictionData.predicted_quantity, input_summary: input }]
    : [];

  const totalPortions = predictions.reduce(
    (acc, p) => acc + (p.predicted_quantity ?? 0),
    0
  );

  const displayed = showAll ? predictions : predictions.slice(0, 5);

  // No data state
  if (!predictionData) {
    return (
      <AppLayout>
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
          <ShieldCheck size={48} className="text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium text-sm mb-1">
            Belum ada data prediksi
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Masukkan data acara terlebih dahulu untuk mendapatkan prediksi.
          </p>
          <button
            id="go-to-input-btn"
            onClick={() => navigate("/input-data")}
            className="bg-primary-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-700 transition-colors"
          >
            Input Data Acara
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">Hasil Prediksi</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {isBatch
                ? `${predictions.length} acara berhasil diprediksi`
                : "Prediksi porsi makanan untuk 1 acara"}
            </p>
          </div>
          <button
            id="download-csv-btn"
            onClick={() => downloadCSV(predictions, input)}
            className="flex items-center gap-2 text-sm text-primary-700 bg-primary-50 border border-primary-200 rounded-xl px-4 py-2.5 hover:bg-primary-100 transition-colors font-semibold"
          >
            <Download size={15} />
            Unduh CSV
          </button>
        </div>

        {/* ── Stepper ── */}
        <div className="flex items-center gap-3 mb-8">
          {["Input Acara", "AI Processing", "Lihat Hasil"].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-primary-800 text-white">
                  {i < 2 ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className="text-sm font-medium text-primary-800">{s}</span>
              </div>
              {i < 2 && <ChevronRight size={16} className="text-gray-300" />}
            </div>
          ))}
        </div>

        {/* ── Hero Result Card ── */}
        {!isBatch ? (
          <div className="bg-primary-800 rounded-2xl p-8 mb-6 text-white flex items-center gap-8">
            <div className="w-24 h-24 rounded-2xl bg-primary-700 flex flex-col items-center justify-center shrink-0">
              <Sparkles size={28} className="text-primary-300 mb-1" />
              <span className="text-3xl font-black text-white">
                {Math.round(predictions[0]?.predicted_quantity ?? 0)}
              </span>
              <span className="text-primary-300 text-xs font-semibold mt-0.5">
                Porsi
              </span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-300 mb-2">
                Prediksi Selesai
              </p>
              <p className="text-xl font-bold text-white mb-1">
                Siapkan{" "}
                <span className="text-primary-200">
                  {Math.round(predictions[0]?.predicted_quantity ?? 0)} porsi
                </span>{" "}
                {FOOD_TYPE_LABELS[input?.type_of_food] ?? input?.type_of_food}
              </p>
              <p className="text-primary-200 text-sm leading-relaxed">
                Untuk acara{" "}
                <strong className="text-white">
                  {EVENT_TYPE_LABELS[input?.event_type] ?? input?.event_type}
                </strong>{" "}
                dengan {input?.number_of_guests} tamu menggunakan metode{" "}
                <strong className="text-white">
                  {METHOD_LABELS[input?.preparation_method] ?? input?.preparation_method}
                </strong>
                .
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-primary-800 rounded-2xl p-6 mb-6 text-white flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-300 mb-1">
                Total Prediksi Batch
              </p>
              <p className="text-xl font-bold text-white">
                {predictions.length} acara · {Math.round(totalPortions)} porsi total
              </p>
            </div>
            <div className="text-right shrink-0 ml-6">
              <p className="text-5xl font-black text-white">
                {Math.round(totalPortions)}
              </p>
              <p className="text-primary-300 text-xs font-semibold uppercase tracking-widest mt-1">
                Total Porsi
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* ── Prediction Cards ── */}
          <div className="col-span-2 flex flex-col gap-4">
            {displayed.map((pred, i) => {
              const ev = isBatch ? input?.[i] : input;
              const qty = Math.round(pred.predicted_quantity ?? 0);
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-5 hover:shadow-md transition-shadow"
                >
                  {/* Quantity badge */}
                  <div className="w-16 h-16 rounded-2xl bg-primary-50 flex flex-col items-center justify-center shrink-0">
                    <span className="text-2xl font-black text-primary-800">{qty}</span>
                    <span className="text-primary-400 text-xs font-semibold">porsi</span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-800 text-sm">
                        {FOOD_TYPE_LABELS[ev?.type_of_food] ?? ev?.type_of_food}
                      </span>
                      {isBatch && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          Acara #{i + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <CalendarDays size={11} />{" "}
                        {EVENT_TYPE_LABELS[ev?.event_type] ?? ev?.event_type}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Users size={11} /> {ev?.number_of_guests} tamu
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <UtensilsCrossed size={11} />{" "}
                        {METHOD_LABELS[ev?.preparation_method] ?? ev?.preparation_method}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Thermometer size={11} />{" "}
                        {STORAGE_LABELS[ev?.storage_conditions] ?? ev?.storage_conditions}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Sun size={11} />{" "}
                        {SEASON_LABELS[ev?.seasonality] ?? ev?.seasonality}
                      </span>
                    </div>
                  </div>

                  {/* Wastage hint */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">Est. Sisa</p>
                    <p className="text-sm font-bold text-amber-600">
                      {ev?.wastage_food_amount} porsi
                    </p>
                  </div>
                </div>
              );
            })}

            {predictions.length > 5 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="text-sm text-primary-700 font-semibold text-center py-3 bg-white rounded-2xl border border-primary-200 hover:bg-primary-50 transition-colors"
              >
                {showAll
                  ? "Tampilkan Lebih Sedikit"
                  : `Tampilkan Semua (${predictions.length})`}
              </button>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-2">
              <button
                id="back-to-input-btn"
                onClick={() => navigate("/input-data")}
                className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-xl px-5 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={16} />
                Kembali
              </button>
              <button
                id="new-prediction-btn"
                onClick={() => navigate("/input-data")}
                className="flex items-center gap-2 text-sm text-white bg-primary-800 rounded-xl px-5 py-2.5 hover:bg-primary-700 transition-colors font-semibold"
              >
                <Sparkles size={16} />
                Prediksi Baru
              </button>
            </div>
          </div>

          {/* ── Right: Input Summary ── */}
          {!isBatch && (
            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                  Ringkasan Input
                </p>
                <DetailRow
                  icon={<ChefHat size={14} />}
                  label="Jenis Makanan"
                  value={input?.type_of_food}
                />
                <DetailRow
                  icon={<Users size={14} />}
                  label="Jumlah Tamu"
                  value={`${input?.number_of_guests} orang`}
                />
                <DetailRow
                  icon={<CalendarDays size={14} />}
                  label="Tipe Acara"
                  value={input?.event_type}
                />
                <DetailRow
                  icon={<Thermometer size={14} />}
                  label="Penyimpanan"
                  value={input?.storage_conditions}
                />
                <DetailRow
                  icon={<Sun size={14} />}
                  label="Musim"
                  value={input?.seasonality}
                />
                <DetailRow
                  icon={<UtensilsCrossed size={14} />}
                  label="Metode Sajian"
                  value={input?.preparation_method}
                />
                <DetailRow
                  icon={<Trash2 size={14} />}
                  label="Est. Sisa"
                  value={`${input?.wastage_food_amount} porsi`}
                />
              </div>

              {/* Accuracy note */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={14} className="text-green-600" />
                  <p className="text-xs font-bold text-green-700">Model Terverifikasi</p>
                </div>
                <p className="text-xs text-green-600 leading-relaxed">
                  Prediksi dihasilkan oleh model deep learning yang telah dilatih
                  dengan dataset katering event nyata.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}