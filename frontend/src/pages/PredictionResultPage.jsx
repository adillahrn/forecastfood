import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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

const trendIcon = {
  up: <TrendingUp size={16} className="text-primary-600" />,
  down: <TrendingDown size={16} className="text-red-500" />,
  flat: <Minus size={16} className="text-gray-400" />,
};

const SPIKE_DAY_INDEX = 2;

const CustomBar = (props) => {
  const { x, y, width, height, index } = props;
  return (
    <rect
      x={x} y={y} width={width} height={height}
      rx={4} ry={4}
      fill={index === SPIKE_DAY_INDEX ? "#ef4444" : "#1B4332"}
      opacity={index === SPIKE_DAY_INDEX ? 1 : 0.85}
    />
  );
};

export default function PredictionResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = location.state?.sessionId;

  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpper, setShowUpper] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchPredictions();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const fetchPredictions = async () => {
    try {
      const res = await api.get(`/predictions/${sessionId}`);
      setPredictions(res.data.data.predictions || []);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate chart data dari predictions
  const chartData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
    const totalDemand = predictions.reduce((acc, p) => {
      const dayKey = `day_${i + 1}`;
      return acc + (parseFloat(p[dayKey]) || 0);
    }, 0);
    return {
      day,
      demand: Math.round(totalDemand),
      upper: Math.round(totalDemand * 1.15),
    };
  });

  return (
    <AppLayout>
      <div className="p-8">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">Prediction Results</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {sessionId ? `Session: #${sessionId.slice(0, 8).toUpperCase()}` : "Latest Forecast"}
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
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-primary-800 text-white">
                  {i < 2 ? <ShieldCheck size={14} /> : i + 1}
                </div>
                <span className="text-sm font-medium text-primary-800">{s}</span>
              </div>
              {i < 2 && <ChevronRight size={16} className="text-gray-300" />}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-300">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-gray-400">Loading prediction results...</p>
          </div>
        ) : !sessionId || predictions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-300">
            <ShieldCheck size={48} className="mb-4" />
            <p className="text-sm font-medium text-gray-500">No prediction data found</p>
            <p className="text-xs text-gray-400 mt-1 mb-6">Upload data and run a prediction first!</p>
            <button
              onClick={() => navigate("/input-data")}
              className="bg-primary-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-700 transition-colors"
            >
              Go to Input Data
            </button>
          </div>
        ) : (
          <>
            {/* ── Summary Row ── */}
            <div className="grid grid-cols-3 gap-5 mb-8">
              <div className="col-span-2 bg-primary-800 rounded-2xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
                    <ShieldCheck size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">Prediction Completed</p>
                    <p className="text-primary-200 text-sm mt-0.5 max-w-sm">
                      Successfully calculated {predictions.length} items for the next 7 days.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-6">
                  <p className="text-5xl font-black text-white">{predictions.length}</p>
                  <p className="text-primary-300 text-xs font-semibold uppercase tracking-widest mt-1">Items Predicted</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                    <AlertTriangle size={16} className="text-red-500" />
                  </div>
                  <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">ALERT</span>
                </div>
                <p className="text-gray-800 font-semibold text-sm mb-1">
                  {predictions.filter(p => p.trend === "up").length} items trending up
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Monitor these items closely for potential demand spikes.
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
                    Upper Bound
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barGap={6}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                  {showUpper && <Bar dataKey="upper" fill="#d1fae5" radius={[4, 4, 0, 0]} />}
                  <Bar dataKey="demand" radius={[4, 4, 0, 0]} shape={<CustomBar />} />
                </BarChart>
              </ResponsiveContainer>
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

              {predictions.map((item, i) => (
                <div key={i} className="grid grid-cols-10 px-6 py-4 items-center border-b border-gray-50 hover:bg-gray-50 transition-colors text-sm">
                  <span className="col-span-2 font-medium text-gray-800">{item.item_name}</span>
                  <span className="text-gray-500">{item.today_demand} {item.unit}</span>
                  <span className="text-gray-700">{item.day_1}</span>
                  <span className="text-gray-700">{item.day_2}</span>
                  <span className="text-gray-700">{item.day_3}</span>
                  <span className="text-gray-700">{item.day_4}</span>
                  <span className="text-gray-700">{item.day_5}</span>
                  <span className="text-gray-700">{item.day_6}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-700">{item.day_7}</span>
                    {trendIcon[item.trend]}
                  </div>
                </div>
              ))}

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
          </>
        )}
      </div>
    </AppLayout>
  );
}