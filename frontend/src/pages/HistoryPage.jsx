import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
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

const statusStyle = {
  completed: { bg: "bg-green-100 text-primary-700", label: "Completed", icon: <CheckCircle size={13} /> },
  failed: { bg: "bg-red-100 text-red-600", label: "Failed", icon: <XCircle size={13} /> },
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/history");

        console.log(res.data.data);
        
        setHistoryData(res.data.data.sessions || []);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, dateFrom, dateTo]);

  const handleDelete = async (id) => {
    if (!confirm("Hapus sesi prediksi ini?")) return;
    try {
      await api.delete(`/history/${id}`);
      setHistoryData((prev) => prev.filter((h) => h.id !== id));
    } catch (error) {
      console.error("Error deleting history:", error);
    }
  };

  const filtered = historyData.filter((h) => {
    const matchSearch =
      h.id?.toLowerCase().includes(search.toLowerCase()) ||
      h.total_items?.toString().includes(search) ||
      h.file_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "All" ||
      (filterStatus === "Completed" && h.status === "completed") ||
      (filterStatus === "Failed" && h.status === "failed");
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(
    filtered.length / ITEMS_PER_PAGE
  );

  console.log("TOTAL DATABASE:", historyData.length);
  console.log("FILTERED:", filtered.length);
  console.log("PAGES:", totalPages);

  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  console.log("Total History:", historyData.length);
  console.log("Filtered:", filtered.length);
  console.log("Total Pages:", totalPages);

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pages;
  };

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
            <button
              onClick={() => navigate("/settings")}
              className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary-800 transition-colors"
            >
              <Settings size={16} />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 text-xs font-bold">U</div>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-64">
              <Search size={15} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search Session ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm text-gray-600 outline-none bg-transparent flex-1"
              />
            </div>
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
        </div>

        {/* ── History Table ── */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="grid grid-cols-7 px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
            <span className="col-span-1">Session ID</span>
            <span className="col-span-2">Date & Time</span>
            <span>Items Count</span>
            <span>File Name</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium text-gray-400">Loading history...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <BarChart2 size={40} className="mb-3" />
              <p className="text-sm font-medium">No sessions found</p>
              <p className="text-xs text-gray-400 mt-1">Upload data and run a prediction to get started!</p>
            </div>
          ) : (
            paginatedData.map((h) => (
              <div key={h.id}>
                <div className="grid grid-cols-7 px-6 py-4 items-center border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <span className="col-span-1 text-sm font-semibold text-primary-700">
                    #{h.id?.slice(0, 8).toUpperCase()}
                  </span>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(h.created_at).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(h.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">{h.total_items} Items</p>
                  <p className="text-sm text-gray-600 truncate pr-2">{h.file_name || "—"}</p>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${statusStyle[h.status]?.bg}`}>
                    {statusStyle[h.status]?.icon}
                    {statusStyle[h.status]?.label}
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
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors ml-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Expanded Detail */}
                {expandedId === h.id && (
                  <div className="px-6 py-5 bg-primary-50 border-b border-primary-100">
                    <p className="text-xs font-semibold text-primary-700 uppercase tracking-widest mb-4">
                      Session Detail — #{h.id?.slice(0, 8).toUpperCase()}
                    </p>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: "Total Items Predicted", value: h.total_items },
                        { label: "File Name", value: h.file_name || "—" },
                        { label: "Status", value: h.status },
                        { label: "Created At", value: new Date(h.created_at).toLocaleString("id-ID") },
                      ].map((d, j) => (
                        <div key={j} className="bg-white rounded-xl p-4">
                          <p className="text-xs text-gray-400 mb-1">{d.label}</p>
                          <p className="text-sm font-bold text-primary-800">{d.value}</p>
                        </div>
                      ))}
                    </div>
                    <button
                    onClick={() => navigate(`/predictions/${h.id}`)}
                  
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
              Showing {paginatedData.length} of {filtered.length} sessions
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronLeft size={14} />
                </button>

                {getPageNumbers().map((n, i) =>
                  n === "..." ? (
                    <span
                      key={i}
                      className="w-7 h-7 flex items-center justify-center text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setCurrentPage(n)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                        currentPage === n
                          ? "bg-primary-800 text-white"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {n}
                    </button>
                  )
                )}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Stats ── */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Accuracy Trend
            </p>
            <div className="flex items-end gap-2 h-16 mb-3">
              {[65, 72, 68, 80, 75, 88, 85, 90, 88, 94].map((h, i) => (
                <div key={i} className="flex-1 bg-primary-700 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
            <p className="text-3xl font-black text-primary-800">
              94.2%{" "}
              <span className="text-sm font-normal text-gray-400">Average Precision</span>
            </p>
          </div>

          <div className="grid grid-rows-2 gap-5">
            <div className="bg-primary-800 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
                <TrendingUp size={18} className="text-white" />
              </div>
              <div>
                <p className="text-primary-300 text-xs font-semibold uppercase tracking-widest">Total Sessions</p>
                <p className="text-3xl font-black text-white">{historyData.length}</p>
              </div>
            </div>
            <div className="bg-primary-50 rounded-2xl p-5 flex items-center gap-4 border border-primary-100">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Package size={18} className="text-primary-700" />
              </div>
              <div>
                <p className="text-primary-500 text-xs font-semibold uppercase tracking-widest">Total Items Predicted</p>
                <p className="text-3xl font-black text-primary-800">
                  {historyData.reduce((acc, h) => acc + (h.total_items || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
