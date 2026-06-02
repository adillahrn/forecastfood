import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";
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
  CalendarDays,
  ChefHat,
  Users,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import api from "../services/api";

// ── Contoh riwayat prediksi terbaru (akan digantikan data real dari Supabase)


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
  const { user } = useAuth();

  console.log("Current User:", user);
  const [dateRange] = useState(new Date().toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  }));
  const [stats, setStats] = useState({
    totalPredictions: 0,
    eventsTracked: 0,
    avgWasteReduction: "18.5%",
    lastUpdated: "Baru saja",
  });

  const [recentPredictions, setRecentPredictions] = useState([]);

  const totalPredictions = recentPredictions.length;

  const eventCounts = recentPredictions.reduce((acc, item) => {
    acc[item.event_type] = (acc[item.event_type] || 0) + 1;
    return acc;
  }, {});

  const eventDistribution = Object.entries(eventCounts)
    .map(([name, count]) => ({
      name,
      value: Math.round((count / totalPredictions) * 100),
    }))
    .sort((a, b) => b.value - a.value);

  const foodStats = recentPredictions.reduce((acc, item) => {
    const food = item.type_of_food;

    if (!acc[food]) {
      acc[food] = {
        total: 0,
        count: 0,
      };
    }

    acc[food].total += Number(item.predicted_quantity || 0);
    acc[food].count += 1;

    return acc;
  }, {});

  const foodCategoryData = Object.entries(foodStats)
    .map(([category, data]) => ({
      category,
      avg_portions: Math.round(data.total / data.count),
    }))
    .sort((a, b) => b.avg_portions - a.avg_portions);

  const totalPortions = recentPredictions.reduce(
    (sum, item) => sum + Number(item.predicted_quantity || 0),
    0
  );

  const uniqueEvents = new Set(
    recentPredictions.map((item) => item.history_id)
  ).size;

  const latestPrediction = recentPredictions[0];

  let lastUpdated = "-";

  if (latestPrediction?.created_at) {
    const diffMs =
      new Date() - new Date(latestPrediction.created_at);

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      lastUpdated = `${hours} jam lalu`;
    } else {
      lastUpdated = `${minutes} menit lalu`;
    }
  }

  useEffect(() => {
    api.get("/health")
      .then((res) => console.log("✅ Backend connected:", res.data))
      .catch((err) => console.error("❌ Backend error:", err));
  }, []);
    useEffect(() => {
      if (!user) return;

      const fetchPredictions = async () => {
        const { data, error } = await supabase
          .from("predictions")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          console.error("SUPABASE ERROR:", error);
          return;
        }

        console.log("PREDICTIONS:", data);

        setRecentPredictions(
          data.sort(
            (a, b) =>
              new Date(b.created_at) -
              new Date(a.created_at)
          )
        );
      };

      fetchPredictions();
    }, [user]);

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
              value: totalPredictions,
            },
            {
              icon: <CalendarDays size={18} />,
              label: "Acara Tercatat",
              value: uniqueEvents,
            },
            {
              icon: <Leaf size={18} />,
              label: "Total Porsi Direkomendasikan",
              value: totalPortions.toLocaleString(),
              badge: "Real Data",
              badgeColor: "bg-green-100 text-green-700",
            },
            {
              icon: <RefreshCw size={18} />,
              label: "Terakhir Diperbarui",
              value: lastUpdated,
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

            {foodCategoryData.length > 0 ? (
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
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value) => [`${value} porsi`, "Rata-rata"]}
                  />
                  <Bar
                    dataKey="avg_portions"
                    radius={[4, 4, 0, 0]}
                    shape={<CustomBar />}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-center">
                <ChefHat size={32} className="text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">
                  Belum ada data prediksi
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Lakukan prediksi pertama untuk melihat statistik makanan
                </p>
              </div>
            )}
          </div>

          {/* Top Event Types */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-primary-900">
                Distribusi Tipe Acara
              </h2>
            </div>
            {eventDistribution.length > 0 ? (
              <div className="flex flex-col gap-4">
                {eventDistribution
                  .map((item, i) => ({
                    ...item,
                    color: [
                      "bg-primary-800",
                      "bg-primary-600",
                      "bg-primary-400",
                      "bg-primary-200",
                    ][i % 4],
                  }))
                  .map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm text-gray-700">
                          {item.name}
                        </p>

                        <p className="text-sm font-semibold text-primary-800">
                          {item.value}%
                        </p>
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
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-center">
                <CalendarDays size={32} className="text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">
                  Belum ada data acara
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Distribusi acara akan muncul setelah melakukan prediksi
                </p>
              </div>
            )}
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
    </AppLayout>
  );
}
