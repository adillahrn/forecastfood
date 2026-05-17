import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Plus,
  Trash2,
  FileText,
  CheckCircle,
  XCircle,
  Loader,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Bell,
  Settings,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";

const unitOptions = ["Kilograms", "Grams", "Liters", "Pcs", "Portions", "Boxes"];

const recentFiles = [
  { name: "weekly_inventory_v4.csv", time: "Today, 09:42 AM", size: "1.2 MB", status: "processed" },
  { name: "supplier_manifest_june.xlsx", time: "Yesterday, 04:15 PM", size: "4.8 MB", status: "processed" },
  { name: "meat_department_log.csv", time: "Just now", size: "0.4 MB", status: "uploading" },
  { name: "corrupt_data_test.json", time: "Jun 12, 11:20 AM", size: "2.1 MB", status: "failed" },
];

const statusStyle = {
  processed: { color: "bg-green-100 text-green-700", label: "Processed" },
  uploading: { color: "bg-blue-100 text-blue-700", label: "Uploading" },
  failed: { color: "bg-red-100 text-red-600", label: "Failed" },
};

const statusIcon = {
  processed: <CheckCircle size={14} className="text-green-600" />,
  uploading: <Loader size={14} className="text-blue-600 animate-spin" />,
  failed: <XCircle size={14} className="text-red-500" />,
};

// Stepper
const steps = ["Data Import", "AI Processing", "View Results"];

export default function InputDataPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [manualEntries, setManualEntries] = useState([
    { id: 1, name: "", stock: "", unit: "Kilograms", date: "" },
  ]);

  const handleFile = (file) => {
    if (file) setUploadedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const addRow = () => {
    setManualEntries((prev) => [
      ...prev,
      { id: Date.now(), name: "", stock: "", unit: "Kilograms", date: "" },
    ]);
  };

  const removeRow = (id) => {
    setManualEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const updateRow = (id, field, value) => {
    setManualEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  return (
    <AppLayout>
      <div className="p-8">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">Input Data</h1>
            <p className="text-gray-400 text-sm mt-1">
              Upload your historical sales data or enter manually
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary-800 transition-colors">
              <Bell size={16} />
            </button>
            <button className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary-800 transition-colors">
              <Settings size={16} />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 text-xs font-bold">U</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* ── Left: Upload + Manual ── */}
          <div className="col-span-2 flex flex-col gap-6">
            {/* Bulk Upload */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Bulk Upload
                </p>
                <p className="text-xs text-gray-400">
                  Supported: .CSV, .XLSX, .JSON
                </p>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-200 hover:border-primary-400 hover:bg-gray-50"
                }`}
              >
                <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mb-3">
                  <Upload size={22} className="text-primary-700" />
                </div>
                {uploadedFile ? (
                  <>
                    <p className="text-sm font-semibold text-primary-800">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB — Click to change
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-600">
                      Drop files here or browse
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Maximum file size 25MB. Secure, encrypted transfer.
                    </p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.xlsx,.json"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
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

            {/* Manual Entry */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-5">
                Manual Entry
              </p>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                <span className="col-span-4">Product Name</span>
                <span className="col-span-2">Current Stock</span>
                <span className="col-span-2">Unit</span>
                <span className="col-span-3">Observation Date</span>
                <span className="col-span-1" />
              </div>

              {/* Rows */}
              <div className="flex flex-col gap-3">
                {manualEntries.map((entry) => (
                  <div key={entry.id} className="grid grid-cols-12 gap-3 items-center">
                    <input
                      type="text"
                      placeholder="e.g. Fresh Atlantic Salmon"
                      value={entry.name}
                      onChange={(e) => updateRow(entry.id, "name", e.target.value)}
                      className="col-span-4 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary-500 transition-colors"
                    />
                    <input
                      type="number"
                      placeholder="0"
                      value={entry.stock}
                      onChange={(e) => updateRow(entry.id, "stock", e.target.value)}
                      className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary-500 transition-colors"
                    />
                    <select
                      value={entry.unit}
                      onChange={(e) => updateRow(entry.id, "unit", e.target.value)}
                      className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary-500 transition-colors bg-white"
                    >
                      {unitOptions.map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={entry.date}
                      onChange={(e) => updateRow(entry.id, "date", e.target.value)}
                      className="col-span-3 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary-500 transition-colors"
                    />
                    <button
                      onClick={() => removeRow(entry.id)}
                      className="col-span-1 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Row */}
              <button
                onClick={addRow}
                className="mt-4 flex items-center gap-2 text-sm text-primary-700 font-medium border border-primary-200 rounded-xl px-4 py-2 hover:bg-primary-50 transition-colors"
              >
                <Plus size={16} />
                Add Entry
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-5">
                Recent Activity
              </p>
              <div className="grid grid-cols-4 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                <span className="col-span-2">Filename</span>
                <span>Timestamp</span>
                <span>Status</span>
              </div>
              <div className="flex flex-col gap-3">
                {recentFiles.map((f, i) => (
                  <div key={i} className="grid grid-cols-4 items-center py-2 border-b border-gray-50 last:border-0">
                    <div className="col-span-2 flex items-center gap-2">
                      {statusIcon[f.status]}
                      <div>
                        <p className="text-sm text-gray-700 font-medium">{f.name}</p>
                        <p className="text-xs text-gray-400">{f.size}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{f.time}</p>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${statusStyle[f.status].color}`}>
                      {statusStyle[f.status].label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Ready to Process + Info Cards ── */}
          <div className="flex flex-col gap-5">
            {/* Ready to Process */}
            <div className="bg-primary-800 rounded-2xl p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-300 mb-3">
                Ready to process?
              </p>
              <p className="text-sm text-primary-100 leading-relaxed mb-6">
                Our AI engine will analyze current inventory levels and supply
                chain trends to generate your next 7-day forecast.
              </p>
              <button
                onClick={() => navigate("/predictions")}
                className="w-full bg-white text-primary-800 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-50 transition-colors"
              >
                <Sparkles size={16} />
                Run Prediction
              </button>
            </div>

            {/* Info cards */}
            {[
              {
                icon: <FileText size={16} className="text-primary-700" />,
                title: "Data Validation",
                desc: "Ensure columns match our template for 99% accuracy in predictions.",
              },
              {
                icon: <RefreshCw size={16} className="text-primary-700" />,
                title: "Auto-Sync",
                desc: "Connect your ERP or POS system to automate data input daily.",
              },
              {
                icon: <ShieldCheck size={16} className="text-primary-700" />,
                title: "Privacy Protocol",
                desc: "Your data is anonymized and stored following Tier-3 security standards.",
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
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
