import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Package,
  Leaf,
  RefreshCw,
  Bell,
  Settings,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";

// ── Dummy Data ──
const demandData = [
  { day: "Mon", forecast: 320, actual: 280 },
  { day: "Tue", forecast: 380, actual: 350 },
  { day: "Wed", forecast: 290, actual: 310 },
  { day: "Thu", forecast: 450, actual: 420 },
  { day: "Fri", forecast: 400, actual: 390 },
  { day: "Sat", forecast: 500, actual: 480 },
  { day: "Sun", forecast: 340, actual: 300 },
];

const topItems = [
  { name: "Organic Avocados", value: 840, max: 840 },
  { name: "Whole Milk (1L)", value: 720, max: 840 },
  { name: "Sourdough Loaf", value: 645, max: 840 },
  { name: "Cherry Tomatoes", value: 590, max: 840 },
  { name: "Greek Yogurt", value: 412, max: 840 },
];

const inventoryData = [
  { name: "Organic Avocados", predicted: "840 units", stock: "210 units", status: "low", action: "Restock Now" },
  { name: "Whole Milk (1L)", predicted: "720 units", stock: "750 units", status: "safe", action: "Details" },
  { name: "Sourdough Loaf", predicted: "645 units", stock: "890 units", status: "overstock", action: "Adjust Order" },
  { name: "Cherry Tomatoes", predicted: "590 units", stock: "580 units", status: "safe", action: "Details" },
];

const statusStyle = {
  low: "bg-red-100 text-red-600",
  safe: "bg-green-100 text-primary-700",
  overstock: "bg-yellow-100 text-yellow-700",
};

const statusLabel = {
  low: "Low Stock",
  safe: "Safe",
  overstock: "Overstock",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dateRange] = useState("Oct 24, 2023 - Oct 31, 2023");

  return (
    <AppLayout>
      <div className="p-8">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-primary-900">Dashboard</h1>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-500">
              <span>{dateRange}</span>
              <ChevronLeft size={14} />
              <ChevronRight size={14} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary-800 transition-colors">
              <Bell size={16} />
            </button>
            <button className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary-800 transition-colors">
              <Settings size={16} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 text-xs font-bold">
                E
              </div>
              <div className="leading-tight">
                <p className="text-gray-800 text-sm font-medium">Elena Rodriguez</p>
                <p className="text-gray-400 text-xs">Operations Lead</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { icon: <TrendingUp size={18} />, label: "Total Predictions", value: "12,482", badge: "+12%", badgeColor: "bg-green-100 text-green-700" },
            { icon: <Package size={18} />, label: "Items Tracked", value: "1,240", badge: "Active", badgeColor: "bg-blue-100 text-blue-700" },
            { icon: <Leaf size={18} />, label: "Est. Waste Reduced %", value: "18.5%", badge: "+24%", badgeColor: "bg-green-100 text-green-700" },
            { icon: <RefreshCw size={18} />, label: "Last Updated", value: "14m ago", badge: "Live", badgeColor: "bg-red-100 text-red-600" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary-700">
                  {s.icon}
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.badgeColor}`}>
                  {s.badge}
                </span>
              </div>
              <p className="text-2xl font-bold text-primary-900 mb-1">{s.value}</p>
              <p className="text-gray-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-2 gap-5 mb-8">
          {/* Demand Forecast Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-primary-900">Demand Forecast vs Actual</h2>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-primary-800 inline-block rounded" /> Forecast
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-gray-300 inline-block rounded" /> Actual
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={demandData} barGap={4}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  labelStyle={{ fontWeight: 600, color: "#1B4332" }}
                />
                <Bar dataKey="forecast" fill="#1B4332" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="#d1fae5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Items */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-primary-900">Top Items by Demand</h2>
              <button className="text-gray-400 hover:text-primary-800">
                <Settings size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {topItems.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm text-gray-700">{item.name}</p>
                    <p className="text-sm font-semibold text-primary-800">{item.value} units</p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-primary-800 h-1.5 rounded-full"
                      style={{ width: `${(item.value / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Inventory Table ── */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-primary-900">Inventory Status Predictions</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <input
                  type="text"
                  placeholder="Search items..."
                  className="text-sm text-gray-500 bg-transparent outline-none w-32"
                />
              </div>
              <button className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-100">
                <Filter size={14} />
                Filter
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-5 px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-50">
            <span className="col-span-2">Item Name</span>
            <span>Predicted Demand</span>
            <span>Current Stock</span>
            <span>Status / Action</span>
          </div>

          {/* Table Rows */}
          {inventoryData.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-5 px-6 py-4 items-center border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <div className="col-span-2 flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Package size={16} className="text-primary-700" />
                </div>
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
              </div>
              <p className="text-sm text-gray-600">{item.predicted}</p>
              <p className="text-sm text-gray-600">{item.stock}</p>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[item.status]}`}>
                  {statusLabel[item.status]}
                </span>
                <button
                  onClick={() => navigate("/stock-recommendation")}
                  className="text-xs text-primary-700 font-medium hover:underline"
                >
                  {item.action}
                </button>
              </div>
            </div>
          ))}

          {/* Table Footer */}
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-xs text-gray-400">Showing 4 of 1,240 items</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  className={`w-7 h-7 rounded-lg text-xs font-medium ${
                    n === 1
                      ? "bg-primary-800 text-white"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Storage Limit */}
        <div className="mt-5 bg-white rounded-2xl p-5 shadow-sm w-56">
          <p className="text-xs font-semibold text-gray-700 mb-2">Storage Limit</p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
            <div className="bg-primary-700 h-1.5 rounded-full" style={{ width: "72%" }} />
          </div>
          <p className="text-xs text-gray-400">72% Capacity Reached</p>
        </div>

        {/* FAB */}
        <button
          onClick={() => navigate("/input-data")}
          className="fixed bottom-8 right-8 w-12 h-12 bg-primary-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>
    </AppLayout>
  );
}
