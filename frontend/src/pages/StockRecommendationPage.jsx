import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  CheckCircle,
  AlertTriangle,
  Archive,
  Filter,
  Download,
  RefreshCw,
  Bell,
  Settings,
  ArrowLeft,
  Package,
  ChevronDown,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";

const statusStyle = {
  low: { bg: "bg-red-100 text-red-600", label: "LOW STOCK" },
  safe: { bg: "bg-green-100 text-primary-700", label: "SAFE" },
  overstock: { bg: "bg-yellow-100 text-yellow-700", label: "OVERSTOCK" },
};

const categories = ["All Categories", "Produce", "Dairy", "Frozen", "Bakery", "Seafood"];
const statuses = ["All", "Safe", "Low Stock", "Overstock"];

export default function StockRecommendationPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/stocks");
      setData(res.data.data || []);
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = async (id, currentOrdered) => {
    try {
      await api.put(`/stocks/${id}/order`);
      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_ordered: !currentOrdered } : item
        )
      );
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const filtered = data.filter((d) => {
    const matchStatus =
      filterStatus === "All" ||
      (filterStatus === "Safe" && d.status === "safe") ||
      (filterStatus === "Low Stock" && d.status === "low") ||
      (filterStatus === "Overstock" && d.status === "overstock");
    const matchSearch = d.item_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const safeCount = data.filter((d) => d.status === "safe").length;
  const lowCount = data.filter((d) => d.status === "low").length;
  const overstockCount = data.filter((d) => d.status === "overstock").length;

  return (
    <AppLayout>
      <div className="p-8">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">Stock Recommendation</h1>
            <p className="text-gray-400 text-sm mt-0.5">Based on your latest prediction</p>
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

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          {[
            {
              icon: <CheckCircle size={22} className="text-primary-600" />,
              iconBg: "bg-green-100",
              label: "SAFE",
              value: safeCount,
              sub: "Optimal stock levels",
              border: "border-l-4 border-l-primary-600",
            },
            {
              icon: <AlertTriangle size={22} className="text-red-500" />,
              iconBg: "bg-red-100",
              label: "NEED RESTOCK",
              value: lowCount,
              sub: "Action required soon",
              border: "border-l-4 border-l-red-500",
            },
            {
              icon: <Archive size={22} className="text-yellow-600" />,
              iconBg: "bg-yellow-100",
              label: "OVERSTOCKED",
              value: overstockCount,
              sub: "Reduce future orders",
              border: "border-l-4 border-l-yellow-500",
            },
          ].map((c, i) => (
            <div key={i} className={`bg-white rounded-2xl p-6 shadow-sm flex items-center gap-5 ${c.border}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.iconBg}`}>
                {c.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">{c.label}</p>
                <p className="text-4xl font-black text-gray-800 leading-none">{c.value}</p>
                <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl shadow-sm">
          {/* Filter Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-8 py-2 text-sm text-gray-600 outline-none focus:border-primary-400 cursor-pointer"
                >
                  {statuses.map((s) => <option key={s}>{s}</option>)}
                </select>
                <Filter size={14} className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
              </div>
              <input
                type="text"
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-primary-400 w-48"
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>Last updated: {new Date().toLocaleDateString("id-ID")}</span>
              <button
                onClick={fetchStocks}
                className="flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
              >
                <RefreshCw size={13} />
                Refresh
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-6 px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-50">
            <span className="col-span-2">Item Name</span>
            <span>Current Stock</span>
            <span>Predicted Demand</span>
            <span>Recommended Order</span>
            <span>Status / Action</span>
          </div>

          {/* Table Rows */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium text-gray-400">Loading recommendations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <Package size={40} className="mb-3" />
              <p className="text-sm font-medium">No items found</p>
              <p className="text-xs text-gray-400 mt-1">Run a prediction first to get stock recommendations!</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="grid grid-cols-6 px-6 py-4 items-center border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Package size={16} className="text-primary-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.item_name}</p>
                    <p className="text-xs text-gray-400">{item.unit}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{item.current_stock} {item.unit}</p>
                <p className="text-sm text-gray-600">{item.predicted_demand} {item.unit}</p>
                <p className={`text-sm font-semibold ${item.recommended_order > 0 ? "text-red-500" : "text-gray-400"}`}>
                  {item.recommended_order > 0 ? `${item.recommended_order} ${item.unit}` : "—"}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyle[item.status]?.bg}`}>
                    {statusStyle[item.status]?.label}
                  </span>
                  {item.status === "low" && (
                    <button
                      onClick={() => toggleOrder(item.id, item.is_ordered)}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
                        item.is_ordered
                          ? "bg-primary-100 text-primary-700"
                          : "bg-primary-800 text-white hover:bg-primary-700"
                      }`}
                    >
                      {item.is_ordered ? "Ordered ✓" : "Order Now"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-5">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-xl px-5 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 text-sm text-primary-700 border border-primary-200 bg-primary-50 rounded-xl px-5 py-2.5 hover:bg-primary-100 transition-colors font-medium">
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}