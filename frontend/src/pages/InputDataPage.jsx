import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Plus,
  Trash2,
  FileText,
  CheckCircle,
  XCircle,
  Bell,
  Settings,
  Sparkles,
  ChevronRight,
  Info,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import PredictionLoading from "../components/PredictionLoading";
import api from "../services/api";
import { useToast } from "../components/ui/Toast";

// ── Options sesuai model AI ──
const FOOD_TYPES = ["Meat", "Vegetables", "Fruits", "Dairy Products", "Baked Goods"];
const EVENT_TYPES = ["Wedding", "Corporate", "Birthday", "Social Gathering"];
const STORAGE_CONDITIONS = ["Refrigerated", "Room Temperature"];
const SEASONALITY = ["All Seasons", "Summer", "Winter"];
const PREP_METHODS = ["Buffet", "Sit-down Dinner", "Finger Food"];

const emptyEntry = {
  type_of_food: "",
  number_of_guests: "",
  event_type: "",
  storage_conditions: "",
  seasonality: "",
  preparation_method: "",
  wastage_food_amount: "",
};

const recentActivityKey = "ff_recent_activity";

export default function InputDataPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const { showToast, ToastComponent } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [entries, setEntries] = useState([{ ...emptyEntry }]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeTab, setActiveTab] = useState("manual"); // "manual" | "csv"

  // Load recent activity dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem(recentActivityKey);
    if (saved) setRecentActivity(JSON.parse(saved));
  }, []);

  const saveActivity = (name, status) => {
    const activity = {
      name,
      time: new Date().toLocaleString("id-ID"),
      status,
    };
    const updated = [activity, ...recentActivity].slice(0, 10);
    setRecentActivity(updated);
    localStorage.setItem(recentActivityKey, JSON.stringify(updated));
  };

  const handleFile = (file) => {
    if (file) {
      setUploadedFile(file);
      setActiveTab("csv");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const addEntry = () => setEntries([...entries, { ...emptyEntry }]);

  const removeEntry = (i) => {
    if (entries.length <= 1) return;
    setEntries(entries.filter((_, idx) => idx !== i));
  };

  const updateEntry = (i, field, value) => {
    const updated = [...entries];
    updated[i][field] = value;
    setEntries(updated);
  };

  // Validasi — semua field harus terisi
  const isManualValid = entries.every((e) =>
    e.type_of_food && e.number_of_guests && e.event_type &&
    e.storage_conditions && e.seasonality && e.preparation_method &&
    e.wastage_food_amount
  );

  const isCsvValid = uploadedFile !== null;

  const canRun = activeTab === "manual" ? isManualValid : isCsvValid;

  const handleRunPrediction = async () => {
    setIsLoading(true);
    try {
      let result;
      if (activeTab === "csv" && uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        result = await api.post("/predictions", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        saveActivity(uploadedFile.name, "processed");
      } else {
        const formData = new FormData();
        formData.append("items", JSON.stringify(entries));
        result = await api.post("/predictions", formData);
        saveActivity("manual_entry", "processed");
      }
      navigate("/predictions", { state: { sessionId: result.data.data.session_id } });
    } catch (error) {
      console.error("Prediction error:", error);
      const errMsg = error.response?.status === 503
        ? "AI service is currently unavailable. Please try again later. 🤖"
        : "Prediction failed. Please check your data and try again.";
      showToast(errMsg, "error");
      saveActivity(uploadedFile?.name || "manual_entry", "failed");
      setIsLoading(false);
    }
  };

  if (isLoading) return <PredictionLoading />;

  return (
    <>
      {ToastComponent}
      <AppLayout>
        <div className="p-8">
          {/* ── Top Bar ── */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-primary-900">Input Data</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Enter event details to predict food portion requirements
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary-800 transition-colors">
                <Bell size={16} />
              </button>
              <button
                onClick={() => navigate("/settings")}
                className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary-800 transition-colors"
              >
                <Settings size={16} />
              </button>
              <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 text-xs font-bold">U</div>
            </div>
          </div>

          {/* ── Stepper ── */}
          <div className="flex items-center gap-3 mb-8">
            {["Data Import", "AI Processing", "View Results"].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-primary-800 text-white" : "bg-gray-100 text-gray-400"}`}>
                    {i + 1}
                  </div>
                  <span className={`text-sm font-medium ${i === 0 ? "text-primary-800" : "text-gray-400"}`}>{s}</span>
                </div>
                {i < 2 && <ChevronRight size={16} className="text-gray-300" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* ── LEFT ── */}
            <div className="col-span-2 flex flex-col gap-6">

              {/* Tab Switch */}
              <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
                {[
                  { id: "manual", label: "Manual Entry" },
                  { id: "csv", label: "Upload CSV" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id ? "bg-white text-primary-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── MANUAL ENTRY ── */}
              {activeTab === "manual" && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Event Details</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <Info size={12} />
                      All fields required
                    </div>
                  </div>

                  {/* Table Header */}
                  <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-1">
                    <span>Food Type</span>
                    <span>Guests</span>
                    <span>Event Type</span>
                    <span>Storage</span>
                    <span>Season</span>
                    <span>Method</span>
                    <span>Wastage (kg)</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {entries.map((entry, i) => (
                      <div key={i} className="grid grid-cols-7 gap-2 items-center">
                        {/* Type of Food */}
                        <select
                          value={entry.type_of_food}
                          onChange={(e) => updateEntry(i, "type_of_food", e.target.value)}
                          className={`border rounded-xl px-2 py-2 text-xs text-gray-700 outline-none focus:border-primary-400 transition-colors bg-white ${!entry.type_of_food ? "border-gray-200" : "border-primary-300"}`}
                        >
                          <option value="">Select...</option>
                          {FOOD_TYPES.map((o) => <option key={o}>{o}</option>)}
                        </select>

                        {/* Number of Guests */}
                        <input
                          type="number"
                          placeholder="e.g. 300"
                          value={entry.number_of_guests}
                          onChange={(e) => updateEntry(i, "number_of_guests", e.target.value)}
                          className={`border rounded-xl px-2 py-2 text-xs text-gray-700 outline-none focus:border-primary-400 transition-colors ${!entry.number_of_guests ? "border-gray-200" : "border-primary-300"}`}
                          min="1"
                        />

                        {/* Event Type */}
                        <select
                          value={entry.event_type}
                          onChange={(e) => updateEntry(i, "event_type", e.target.value)}
                          className={`border rounded-xl px-2 py-2 text-xs text-gray-700 outline-none focus:border-primary-400 transition-colors bg-white ${!entry.event_type ? "border-gray-200" : "border-primary-300"}`}
                        >
                          <option value="">Select...</option>
                          {EVENT_TYPES.map((o) => <option key={o}>{o}</option>)}
                        </select>

                        {/* Storage Conditions */}
                        <select
                          value={entry.storage_conditions}
                          onChange={(e) => updateEntry(i, "storage_conditions", e.target.value)}
                          className={`border rounded-xl px-2 py-2 text-xs text-gray-700 outline-none focus:border-primary-400 transition-colors bg-white ${!entry.storage_conditions ? "border-gray-200" : "border-primary-300"}`}
                        >
                          <option value="">Select...</option>
                          {STORAGE_CONDITIONS.map((o) => <option key={o}>{o}</option>)}
                        </select>

                        {/* Seasonality */}
                        <select
                          value={entry.seasonality}
                          onChange={(e) => updateEntry(i, "seasonality", e.target.value)}
                          className={`border rounded-xl px-2 py-2 text-xs text-gray-700 outline-none focus:border-primary-400 transition-colors bg-white ${!entry.seasonality ? "border-gray-200" : "border-primary-300"}`}
                        >
                          <option value="">Select...</option>
                          {SEASONALITY.map((o) => <option key={o}>{o}</option>)}
                        </select>

                        {/* Preparation Method */}
                        <select
                          value={entry.preparation_method}
                          onChange={(e) => updateEntry(i, "preparation_method", e.target.value)}
                          className={`border rounded-xl px-2 py-2 text-xs text-gray-700 outline-none focus:border-primary-400 transition-colors bg-white ${!entry.preparation_method ? "border-gray-200" : "border-primary-300"}`}
                        >
                          <option value="">Select...</option>
                          {PREP_METHODS.map((o) => <option key={o}>{o}</option>)}
                        </select>

                        {/* Wastage + Delete */}
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            placeholder="e.g. 25"
                            value={entry.wastage_food_amount}
                            onChange={(e) => updateEntry(i, "wastage_food_amount", e.target.value)}
                            className={`flex-1 border rounded-xl px-2 py-2 text-xs text-gray-700 outline-none focus:border-primary-400 transition-colors ${!entry.wastage_food_amount ? "border-gray-200" : "border-primary-300"}`}
                            min="0"
                            step="0.1"
                          />
                          <button
                            onClick={() => removeEntry(i)}
                            disabled={entries.length <= 1}
                            className={`transition-colors ${entries.length <= 1 ? "text-gray-200 cursor-not-allowed" : "text-gray-300 hover:text-red-400"}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addEntry}
                    className="mt-4 flex items-center gap-2 text-sm text-primary-700 font-medium border border-primary-200 rounded-xl px-4 py-2 hover:bg-primary-50 transition-colors"
                  >
                    <Plus size={16} />
                    Add Event
                  </button>
                </div>
              )}

              {/* ── CSV UPLOAD ── */}
              {activeTab === "csv" && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Bulk Upload</p>
                    <p className="text-xs text-gray-400">Supported: .CSV</p>
                  </div>

                  {/* CSV Format Info */}
                  <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-primary-700 mb-2">Required CSV Columns:</p>
                    <code className="text-xs text-primary-600 block leading-relaxed">
                      type_of_food, number_of_guests, event_type, storage_conditions, seasonality, preparation_method, wastage_food_amount
                    </code>
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current.click()}
                    className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      dragOver ? "border-primary-600 bg-primary-50" :
                      uploadedFile ? "border-primary-400 bg-primary-50" :
                      "border-gray-200 hover:border-primary-400 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files[0])}
                    />
                    {uploadedFile ? (
                      <>
                        <CheckCircle size={36} className="text-primary-600 mb-3" />
                        <p className="text-primary-800 font-semibold text-sm">{uploadedFile.name}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          {(uploadedFile.size / 1024).toFixed(1)} KB — Click to change
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload size={36} className="text-primary-600 mb-3" />
                        <p className="text-gray-600 font-medium text-sm">Drop CSV file here or browse</p>
                        <p className="text-gray-400 text-xs mt-1">Maximum file size 25MB</p>
                      </>
                    )}
                  </div>

                  {uploadedFile && (
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="mt-3 text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Remove file
                    </button>
                  )}
                </div>
              )}

              {/* Recent Activity */}
              {recentActivity.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Recent Activity</p>
                  <div className="grid grid-cols-3 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    <span className="col-span-1">Filename</span>
                    <span>Time</span>
                    <span>Status</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {recentActivity.map((f, i) => (
                      <div key={i} className="grid grid-cols-3 items-center py-2 border-b border-gray-50 last:border-0">
                        <div className="col-span-1 flex items-center gap-2">
                          <FileText size={14} className="text-gray-400 shrink-0" />
                          <p className="text-sm text-gray-700 font-medium truncate">{f.name}</p>
                        </div>
                        <p className="text-xs text-gray-400">{f.time}</p>
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${
                          f.status === "processed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}>
                          {f.status === "processed"
                            ? <><CheckCircle size={12} /> Processed</>
                            : <><XCircle size={12} /> Failed</>
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT ── */}
            <div className="flex flex-col gap-5">
              {/* Ready to process */}
              <div className="bg-primary-800 rounded-2xl p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary-300 mb-3">
                  Ready to process?
                </p>
                <p className="text-sm text-primary-100 leading-relaxed mb-6">
                  Our AI model will analyze your event specifications and predict the optimal food portion quantities to minimize waste.
                </p>
                <button
                  onClick={handleRunPrediction}
                  disabled={!canRun}
                  className={`w-full flex items-center justify-center gap-2 font-semibold text-sm py-3 rounded-xl transition-colors ${
                    canRun
                      ? "bg-white text-primary-800 hover:bg-primary-50"
                      : "bg-primary-700 text-primary-400 cursor-not-allowed"
                  }`}
                >
                  <Sparkles size={16} />
                  Run Prediction
                </button>
                {!canRun && (
                  <p className="text-primary-400 text-xs text-center mt-2">
                    {activeTab === "manual"
                      ? "Fill in all fields to continue"
                      : "Upload a CSV file to continue"}
                  </p>
                )}
              </div>

              {/* Info Cards */}
              {[
                {
                  icon: "🍽️",
                  title: "Food Types",
                  desc: "Meat, Vegetables, Fruits, Dairy Products, Baked Goods",
                },
                {
                  icon: "🎉",
                  title: "Event Types",
                  desc: "Wedding, Corporate, Birthday, Social Gathering",
                },
                {
                  icon: "📊",
                  title: "AI Prediction",
                  desc: "Model predicts optimal portion quantity based on 7 event parameters.",
                },
              ].map((card, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm flex gap-4">
                  <span className="text-xl">{card.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">{card.title}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}