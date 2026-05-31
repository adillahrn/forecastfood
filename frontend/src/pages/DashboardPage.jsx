import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Leaf,
  RefreshCw,
  Bell,
  Settings,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ChefHat,
  Users,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import api from "../services/api";

// ── Ilustrasi distribusi porsi per kategori makanan (dari scaler_y_mean model)
const foodCategoryData = [
  { category: "Meat", avg_portions: 420 },
  { category: "Vegetables", avg_portions: 390 },
  { category: "Baked Goods", avg_portions: 375 },
  { category: "Dairy Products", avg_portions: 355 },
  { category: "Fruits", avg_portions: 340 },
];

// ── Contoh riwayat prediksi terbaru (akan digantikan data real dari Supabase)
const recentPredictions = [
  {
    event: "Corporate Event",
    food: "Meat",
    guests: 310,
    portions: 412,
    method: "Buffet",
    status: "completed",
  },
  {
    event: "Wedding",
    food: "Vegetables",
    guests: 250,
    portions: 378,
    method: "Sit-down Dinner",
    status: "completed",
  },
  {
    event: "Birthday",
    food: "Baked Goods",
    guests: 80,
    portions: 105,
    method: "Finger Food",
    status: "completed",
  },
  {
    event: "Social Gathering",
    food: "Fruits",
    guests: 150,
    portions: 192,
    method: "Buffet",
    status: "completed",
  },
];

const statusStyle = {
  completed: "bg-green-100 text-green-700",
  processing: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-600",
};

const CustomBar = (props) => {
  const { x, y, width, height, index } = props;
  const colors = ["#1B4332", "#2d6a4f", "#40916c", "#52b788", "#95d5b2"];
  return (
    <rect
      x={x} y={y} width={width} height={height}
      rx={4} ry={4}
      fill={colors[index % colors.length]}
    />
  );
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dateRange] = useState(new Date().toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  }));
  const [stats, setStats] = useState({
    totalPredictions: 0,
    eventsTracked: 0,
    avgWasteReduction: "18.5%",
    lastUpdated: "Baru saja",
  });

  useEffect(() => {
    api.get("/health")
      .then((res) => console.log("✅ Backend connected:", res.data))
      .catch((err) => console.error("❌ Backend error:", err));
  }, []);

  return (
    <AppLayout>
      <div className="p-8">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-primary-900">Dashboard</h1>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-500">
              <CalendarDays size={14} />
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
                U
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            {
              icon: <TrendingUp size={18} />,
              label: "Total Prediksi",
              value: "12,482",
              badge: "+12%",
              badgeColor: "bg-green-100 text-green-700",
            },
            {
              icon: <CalendarDays size={18} />,
              label: "Acara Tercatat",
              value: "1,240",
              badge: "Aktif",
              badgeColor: "bg-blue-100 text-blue-700",
            },
            {
              icon: <Leaf size={18} />,
              label: "Est. Waste Berkurang",
              value: "18.5%",
              badge: "+24%",
              badgeColor: "bg-green-100 text-green-700",
            },
            {
              icon: <RefreshCw size={18} />,
              label: "Terakhir Diperbarui",
              value: "14m lalu",
              badge: "Live",
              badgeColor: "bg-red-100 text-red-600",
            },
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
          {/* Rata-rata Porsi per Kategori Makanan */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-primary-900">
                Rata-rata Porsi per Kategori Makanan
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Berdasarkan hasil training model AI (scaler mean ≈ 411 porsi)
              </p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={foodCategoryData} barGap={4}>
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  formatter={(value) => [`${value} porsi`, "Rata-rata"]}
                />
                <Bar dataKey="avg_portions" radius={[4, 4, 0, 0]} shape={<CustomBar />} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Event Types */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-primary-900">
                Distribusi Tipe Acara
              </h2>
              <button className="text-gray-400 hover:text-primary-800">
                <Settings size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { name: "Wedding", value: 38, color: "bg-primary-800" },
                { name: "Corporate", value: 28, color: "bg-primary-600" },
                { name: "Social Gathering", value: 22, color: "bg-primary-400" },
                { name: "Birthday", value: 12, color: "bg-primary-200" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm text-gray-700">{item.name}</p>
                    <p className="text-sm font-semibold text-primary-800">{item.value}%</p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`${item.color} h-1.5 rounded-full transition-all`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Predictions Table ── */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-primary-900">Riwayat Prediksi Terbaru</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <input
                  type="text"
                  placeholder="Cari acara..."
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
          <div className="grid grid-cols-6 px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-50">
            <span className="col-span-2">Tipe Acara</span>
            <span>Jenis Makanan</span>
            <span>Jumlah Tamu</span>
            <span>Porsi Diprediksi</span>
            <span>Status</span>
          </div>

          {/* Table Rows */}
          {recentPredictions.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-6 px-6 py-4 items-center border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <div className="col-span-2 flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
                  <CalendarDays size={16} className="text-primary-700" />
                </div>
                <p className="text-sm font-medium text-gray-800">{item.event}</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <ChefHat size={13} className="text-gray-400" />
                {item.food}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users size={13} className="text-gray-400" />
                {item.guests}
              </div>
              <p className="text-sm font-bold text-primary-800">{item.portions} porsi</p>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${statusStyle[item.status]}`}>
                Selesai
              </span>
            </div>
          ))}

          {/* Table Footer */}
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-xs text-gray-400">Menampilkan 4 dari 1.240 prediksi</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  className={`w-7 h-7 rounded-lg text-xs font-medium ${
                    n === 1 ? "bg-primary-800 text-white" : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FAB */}
        <button
          id="fab-new-prediction"
          onClick={() => navigate("/input-data")}
          className="fixed bottom-8 right-8 w-12 h-12 bg-primary-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>
    </AppLayout>
  );
}
