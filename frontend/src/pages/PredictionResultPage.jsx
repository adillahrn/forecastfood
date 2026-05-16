import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Filter,
  Bell,
  Settings,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";

// ── Dummy Data ──
const chartData = [
  { day: "Mon", demand: 320, upper: 360 },
  { day: "Tue", demand: 380, upper: 420 },
  { day: "Wed", demand: 550, upper: 600 },
  { day: "Thu", demand: 290, upper: 330 },
  { day: "Fri", demand: 410, upper: 450 },
  { day: "Sat", demand: 460, upper: 500 },
  { day: "Sun", demand: 350, upper: 390 },
];

const tableData = [
  { name: "Avocados (Hass)", today: "120kg", d1: 115, d2: 118, d3: 165, d4: 120, d5: 125, d6: 130, d7: 110, trend: "up" },
  { name: "Salmon Fillet", today: "45kg", d1: 42, d2: 40, d3: 48, d4: 55, d5: 60, d6: 65, d7: 50, trend: "up" },
  { name: "Spring Onions", today: "30 units", d1: 32, d2: 35, d3: 55, d4: 30, d5: 28, d6: 25, d7: 22, trend: "down" },
  { name: "Sourdough Loaf", today: "80 units", d1: 82, d2: 85, d3: 90, d4: 88, d5: 85, d6: 95, d7: 105, trend: "up" },
  { name: "Greek Yogurt", today: "60 units", d1: 58, d2: 60, d3: 62, d4: 61, d5: 59, d6: 60, d7: 61, trend: "flat" },
];

const trendIcon = {
  up: <TrendingUp size={16} className="text-primary-600" />,
  down: <TrendingDown size={16} className="text-red-500" />,
  flat: <Minus size={16} className="text-gray-400" />,
};

const SPIKE_DAY = 2; // Wed index

const CustomBar = (props) => {
  const { x, y, width, height, index } = props;
  const isSpike = index === SPIKE_DAY;
  return (
    <rect
      x={x} y={y} width={width} height={height}
      rx={4} ry={4}
      fill={isSpike ? "#ef4444" : "#1B4332"}
      opacity={isSpike ? 1 : 0.85}
    />
  );
};

export default function PredictionResultPage() {
  const navigate = useNavigate();
  const [showUpper, setShowUpper] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <AppLayout>
      <div className="p-8">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">Prediction Results</h1>
            <p className="text-gray-400 text-sm mt-0.5">Forecast Range: Oct 24, 2023 – Oct 30, 2023</p>
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

        {/* ── Stepper ── */}
        <div className="flex items-center gap-3 mb-8">
          {["Data Import", "AI Processing", "View Results"].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i <= 2 ? "bg-primary-800 text-white" : "bg-gray-100 text-gray-400"}`}>
                  {i < 2 ? <ShieldCheck size={14} /> : i + 1}
                </div>
                <span className={`text-sm font-medium ${i <= 2 ? "text-primary-800" : "text-gray-400"}`}>{s}</span>
              </div>
              {i < 2 && <ChevronRight size={16} className="text-gray-300" />}
            </div>
          ))}
        </div>

        {/* ── Summary Row ── */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          {/* Prediction Completed */}
          <div className="col-span-2 bg-primary-800 rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">Prediction Completed</p>
                <p className="text-primary-200 text-sm mt-0.5 max-w-sm">
                  The AI engine has successfully calculated next week's requirements based on historical data, weather patterns, and local events.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-6">
              <p className="text-5xl font-black text-white">98%</p>
              <p className="text-primary-300 text-xs font-semibold uppercase tracking-widest mt-1">Confidence Score</p>
            </div>
          </div>

          {/* Alert Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertTriangle size={16} className="text-red-500" />
              </div>
              <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">URGENT ALERT</span>
            </div>
            <p className="text-gray-800 font-semibold text-sm mb-1">
              3 items predicted to spike on Day 3
            </p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Anticipate higher demand for fresh produce due to local festival.
            </p>
          </div>
        </div>

        {/* ── Chart ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Visualization</p>
              <h2 className="text-lg font-bold text-primary-900">Predicted Demand (Next 7 Days)</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUpper(!showUpper)}
                className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${showUpper ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-gray-50 border-gray-200 text-gray-400"}`}
              >
                <span className="w-2 h-2 rounded-full bg-primary-300 inline-block" />
                Expected
              </button>
              <button
                onClick={() => setShowUpper(!showUpper)}
                className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${!showUpper ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-gray-50 border-gray-200 text-gray-400"}`}
              >
                <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                Upper Bound
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={6}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val, i) => {
                  if (i === SPIKE_DAY) return val;
                  return val;
                }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                labelStyle={{ fontWeight: 600, color: "#1B4332" }}
              />
              {showUpper && (
                <Bar dataKey="upper" fill="#d1fae5" radius={[4, 4, 0, 0]} />
              )}
              <Bar dataKey="demand" radius={[4, 4, 0, 0]} shape={<CustomBar />} />
            </BarChart>
          </ResponsiveContainer>

          {/* X-axis spike label */}
          <p className="text-center text-xs text-red-500 font-semibold -mt-2">
            ↑ Wed — Demand Spike
          </p>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-primary-900">Item Forecast Breakdown</h2>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-100 transition-colors">
                <Filter size={14} />
                Filter
              </button>
              <button className="flex items-center gap-2 text-sm text-primary-700 bg-primary-50 border border-primary-200 rounded-lg px-3 py-1.5 hover:bg-primary-100 transition-colors font-medium">
                <Download size={14} />
                Download CSV
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-10 px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-50">
            <span className="col-span-2">Item Name</span>
            <span>Today</span>
            <span>Day 1</span>
            <span>Day 2</span>
            <span>Day 3</span>
            <span>Day 4</span>
            <span>Day 5</span>
            <span>Day 6</span>
            <span>Day 7 / Trend</span>
          </div>

          {/* Table Rows */}
          {tableData.map((item, i) => (
            <div key={i} className="grid grid-cols-10 px-6 py-4 items-center border-b border-gray-50 hover:bg-gray-50 transition-colors text-sm">
              <span className="col-span-2 font-medium text-gray-800">{item.name}</span>
              <span className="text-gray-500">{item.today}</span>
              <span className="text-gray-700">{item.d1}</span>
              <span className="text-gray-700">{item.d2}</span>
              <span className={`font-bold ${item.d3 > 100 ? "text-red-500" : "text-gray-700"}`}>{item.d3}</span>
              <span className="text-gray-700">{item.d4}</span>
              <span className="text-gray-700">{item.d5}</span>
              <span className="text-gray-700">{item.d6}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-700">{item.d7}</span>
                {trendIcon[item.trend]}
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex items-center justify-between px-6 py-5">
            <button
              onClick={() => navigate("/input-data")}
              className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-xl px-5 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Data Input
            </button>
            <button
              onClick={() => navigate("/stock-recommendation")}
              className="flex items-center gap-2 text-sm text-white bg-primary-800 rounded-xl px-5 py-2.5 hover:bg-primary-700 transition-colors font-semibold"
            >
              Go to Stock Recommendation
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
