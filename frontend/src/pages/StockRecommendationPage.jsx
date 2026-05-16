import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

// ── Dummy Data ──
const stockData = [
  { name: "Organic Kale Bundles", category: "Produce", current: 12, predicted: 45, recommended: 35, unit: "units", status: "low", ordered: false },
  { name: "Whole Milk (Gallon)", category: "Dairy", current: 85, predicted: 78, recommended: 0, unit: "units", status: "safe", ordered: false },
  { name: "Frozen Acai Bowls", category: "Frozen", current: 120, predicted: 40, recommended: 0, unit: "units", status: "overstock", ordered: false },
  { name: "Avocados (Hass)", category: "Produce", current: 30, predicted: 95, recommended: 65, unit: "units", status: "low", ordered: false },
  { name: "Sourdough Loaf", category: "Bakery", current: 60, predicted: 90, recommended: 30, unit: "units", status: "low", ordered: false },
  { name: "Greek Yogurt", category: "Dairy", current: 200, predicted: 80, recommended: 0, unit: "units", status: "overstock", ordered: false },
  { name: "Cherry Tomatoes", category: "Produce", current: 45, predicted: 50, recommended: 5, unit: "units", status: "safe", ordered: false },
  { name: "Salmon Fillet", category: "Seafood", current: 20, predicted: 60, recommended: 40, unit: "kg", status: "low", ordered: false },
];

const statusStyle = {
  low: { bg: "bg-red-100 text-red-600", label: "LOW STOCK" },
  safe: { bg: "bg-green-100 text-primary-700", label: "SAFE" },
  overstock: { bg: "bg-yellow-100 text-yellow-700", label: "OVERSTOCK" },
};

const categories = ["All Categories", "Produce", "Dairy", "Frozen", "Bakery", "Seafood"];
const statuses = ["All", "Safe", "Low Stock", "Overstock"];

export default function StockRecommendationPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(stockData);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [search, setSearch] = useState("");

  const toggleOrder = (i) => {
    const updated = [...data];
    updated[i].ordered = !updated[i].ordered;
    setData(updated);
  };

  const processAll = () => {
    setData(data.map((d) => ({ ...d, ordered: d.status === "low" ? true : d.ordered })));
  };

  const filtered = data.filter((d) => {
    const matchStatus =
      filterStatus === "All" ||
      (filterStatus === "Safe" && d.status === "safe") ||
      (filterStatus === "Low Stock" && d.status === "low") ||
      (filterStatus === "Overstock" && d.status === "overstock");
    const matchCategory = filterCategory === "All Categories" || d.category === filterCategory;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchCategory && matchSearch;
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
            <button className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary-800 transition-colors">
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
              bg: "bg-green-50 border-green-200",
              iconBg: "bg-green-100",
              label: "SAFE",
              value: safeCount,
              sub: "Optimal stock levels",
              border: "border-l-4 border-l-primary-600",
            },
            {
              icon: <AlertTriangle size={22} className="text-red-500" />,
              bg: "bg-red-50 border-red-200",
              iconBg: "bg-red-100",
              label: "NEED RESTOCK",
              value: lowCount,
              sub: "Action required soon",
              border: "border-l-4 border-l-red-500",
            },
            {
              icon: <Archive size={22} className="text-yellow-600" />,
              bg: "bg-yellow-50 border-yellow-200",
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
              {/* Status Filter */}
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

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-600 outline-none focus:border-primary-400 cursor-pointer"
                >
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-primary-400 w-48"
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>Last updated: Today, 08:42 AM</span>
              <button className="flex items-center gap-1.5 text-primary-700 font-semibold hover:underline">
                <RefreshCw size={13} />
                Refresh Predictions
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
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <Package size={40} className="mb-3" />
              <p className="text-sm font-medium">No items found</p>
            </div>
          ) : (
            filtered.map((item, i) => (
              <div key={i} className="grid grid-cols-6 px-6 py-4 items-center border-b border-gray-50 hover:bg-gray-50 transition-colors">
                {/* Item Name */}
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Package size={16} className="text-primary-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-400">Category: {item.category}</p>
                  </div>
                </div>

                {/* Current Stock */}
                <p className="text-sm text-gray-600">{item.current} {item.unit}</p>

                {/* Predicted Demand */}
                <p className="text-sm text-gray-600">{item.predicted} {item.unit}</p>

                {/* Recommended Order */}
                <p className={`text-sm font-semibold ${item.recommended > 0 ? "text-red-500" : "text-gray-400"}`}>
                  {item.recommended > 0 ? `${item.recommended} ${item.unit}` : "—"}
                </p>

                {/* Status + Action */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyle[item.status].bg}`}>
                    {statusStyle[item.status].label}
                  </span>
                  {item.status === "low" && (
                    <button
                      onClick={() => toggleOrder(i)}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
                        item.ordered
                          ? "bg-primary-100 text-primary-700"
                          : "bg-primary-800 text-white hover:bg-primary-700"
                      }`}
                    >
                      {item.ordered ? "Ordered ✓" : "Order Now"}
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
              <button
                onClick={processAll}
                className="flex items-center gap-2 text-sm text-white bg-primary-800 rounded-xl px-5 py-2.5 hover:bg-primary-700 transition-colors font-semibold"
              >
                <CheckCircle size={16} />
                Process All Recommendations
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
