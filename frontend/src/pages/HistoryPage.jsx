import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Settings,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  TrendingUp,
  Package,
  BarChart2,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";

// ── Dummy Data ──
const historyData = [
  { id: "#FF-88219", date: "Oct 24, 2023", time: "09:14 AM", items: 142, range: "7 Days", status: "completed" },
  { id: "#FF-88218", date: "Oct 23, 2023", time: "02:45 PM", items: 89, range: "14 Days", status: "completed" },
  { id: "#FF-88217", date: "Oct 23, 2023", time: "11:20 AM", items: 215, range: "30 Days", status: "failed" },
  { id: "#FF-88216", date: "Oct 22, 2023", time: "08:30 AM", items: 12, range: "7 Days", status: "completed" },
  { id: "#FF-88215", date: "Oct 21, 2023", time: "04:12 PM", items: 312, range: "14 Days", status: "completed" },
  { id: "#FF-88214", date: "Oct 20, 2023", time: "09:00 AM", items: 54, range: "7 Days", status: "completed" },
];

const statusStyle = {
  completed: { bg: "bg-green-100 text-primary-700", label: "Completed", icon: <CheckCircle size={13} /> },
  failed: { bg: "bg-red-100 text-red-600", label: "Failed", icon: <XCircle size={13} /> },
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const filtered = historyData.filter((h) => {
    const matchSearch =
      h.id.toLowerCase().includes(search.toLowerCase()) ||
      h.items.toString().includes(search);
    const matchStatus =
      filterStatus === "All" ||
      (filterStatus === "Completed" && h.status === "completed") ||
      (filterStatus === "Failed" && h.status === "failed");
    return matchSearch && matchStatus;
  });

  return (
    <AppLayout>
      <div className="p-8">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">Prediction History</h1>
            <p className="text-gray-400 text-sm mt-0.5">View all past forecasting sessions</p>
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

        {/* ── Filter Bar ── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-64">
              <Search size={15} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search Session ID or Item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm text-gray-600 outline-none bg-transparent flex-1"
              />
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-sm text-gray-500 outline-none bg-transparent"
              />
              <span className="text-gray-300">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-sm text-gray-500 outline-none bg-transparent"
              />
            </div>

            {/* Status Filter */}
            {["All", "Completed", "Failed"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  filterStatus === s
                    ? "bg-primary-800 text-white"
                    : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Export */}
          <button className="flex items-center gap-2 text-sm text-primary-700 bg-primary-50 border border-primary-200 rounded-xl px-4 py-2 hover:bg-primary-100 transition-colors font-medium">
            <Download size={15} />
            Export Report
          </button>
        </div>

        {/* ── History Table ── */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          {/* Table Header */}
          <div className="grid grid-cols-7 px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
            <span className="col-span-1">Session ID</span>
            <span className="col-span-2">Date & Time</span>
            <span>Items Count</span>
            <span>Forecast Range</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <BarChart2 size={40} className="mb-3" />
              <p className="text-sm font-medium">No sessions found</p>
            </div>
          ) : (
            filtered.map((h, i) => (
              <div key={i}>
                <div className="grid grid-cols-7 px-6 py-4 items-center border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <span className="col-span-1 text-sm font-semibold text-primary-700">{h.id}</span>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-800">{h.date}</p>
                    <p className="text-xs text-gray-400">{h.time}</p>
                  </div>
                  <p className="text-sm text-gray-600">{h.items} Items</p>
                  <p className="text-sm text-gray-600">{h.range}</p>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${statusStyle[h.status].bg}`}>
                    {statusStyle[h.status].icon}
                    {statusStyle[h.status].label}
                  </span>
                  <div className="flex items-center gap-2">
                    {h.status === "completed" ? (
                      <button
                        onClick={() => setExpandedId(expandedId === h.id ? null : h.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:underline"
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                    ) : (
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:underline">
                        <RefreshCw size={14} />
                        Retry
                      </button>
                    )}
                    <button className="text-gray-300 hover:text-red-400 transition-colors ml-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Expanded Detail */}
                {expandedId === h.id && (
                  <div className="px-6 py-5 bg-primary-50 border-b border-primary-100">
                    <p className="text-xs font-semibold text-primary-700 uppercase tracking-widest mb-4">
                      Session Detail — {h.id}
                    </p>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: "Total Items Predicted", value: h.items },
                        { label: "Forecast Range", value: h.range },
                        { label: "Confidence Score", value: "94.2%" },
                        { label: "Waste Reduction Est.", value: "18.5%" },
                      ].map((d, j) => (
                        <div key={j} className="bg-white rounded-xl p-4">
                          <p className="text-xs text-gray-400 mb-1">{d.label}</p>
                          <p className="text-lg font-bold text-primary-800">{d.value}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate("/predictions")}
                      className="mt-4 text-xs font-semibold text-primary-700 hover:underline flex items-center gap-1"
                    >
                      <Eye size={13} />
                      View Full Prediction
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-xs text-gray-400">
              Showing 1–{filtered.length} of 124 sessions
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                    currentPage === n
                      ? "bg-primary-800 text-white"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="text-gray-300 text-xs px-1">...</span>
              <button className="w-7 h-7 rounded-lg text-xs font-semibold text-gray-400 hover:bg-gray-100">
                12
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(12, currentPage + 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom Stats ── */}
        <div className="grid grid-cols-2 gap-5">
          {/* Accuracy Trend */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Accuracy Trend
            </p>
            <div className="flex items-end gap-2 h-16 mb-3">
              {[65, 72, 68, 80, 75, 88, 85, 90, 88, 94].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary-100 rounded-t-sm"
                  style={{ height: `${h}%` }}
                >
                  <div
                    className="w-full bg-primary-700 rounded-t-sm"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <p className="text-3xl font-black text-primary-800">
              94.2%{" "}
              <span className="text-sm font-normal text-gray-400">
                Average Precision
              </span>
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-rows-2 gap-5">
            <div className="bg-primary-800 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
                <TrendingUp size={18} className="text-white" />
              </div>
              <div>
                <p className="text-primary-300 text-xs font-semibold uppercase tracking-widest">
                  Total Predictions
                </p>
                <p className="text-3xl font-black text-white">1,482</p>
              </div>
            </div>
            <div className="bg-primary-50 rounded-2xl p-5 flex items-center gap-4 border border-primary-100">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Package size={18} className="text-primary-700" />
              </div>
              <div>
                <p className="text-primary-500 text-xs font-semibold uppercase tracking-widest">
                  Waste Reduced
                </p>
                <p className="text-3xl font-black text-primary-800">12.4 Tons</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
