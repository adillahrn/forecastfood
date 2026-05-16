import { useNavigate } from "react-router-dom";
import {
  Radio,
  Package,
  BarChart2,
  Upload,
  Sparkles,
  CheckCircle,
  TrendingDown,
} from "lucide-react";
import LandingLayout from "../components/layout/LandingLayout";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <LandingLayout>
      {/* ── HERO SECTION ── */}
      <section className="min-h-screen bg-[#f5f5f0] flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <p className="text-primary-700 text-sm font-semibold tracking-widest uppercase mb-4">
              Eco-Logistics AI
            </p>
            <h1 className="text-5xl font-bold text-primary-900 leading-tight mb-6">
              Predict Smarter,
              <br />
              Waste Less
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
              Harness the power of AI-powered demand forecasting to optimize
              your F&B logistics. Reduce operational waste by up to 30% with
              precision data analytics.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-primary-800 text-white font-semibold px-7 py-3 rounded-xl hover:bg-primary-700 transition-colors"
              >
                Start Forecasting
              </button>
              <button
                onClick={() => navigate("/about")}
                className="border border-primary-800 text-primary-800 font-semibold px-7 py-3 rounded-xl hover:bg-primary-50 transition-colors"
              >
                See Demo
              </button>
            </div>
          </div>

          {/* Right — Dashboard mockup */}
          <div className="relative">
            <div className="bg-primary-900 rounded-2xl p-6 shadow-2xl">
              {/* Fake dashboard header */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-white text-xs font-semibold">ForecastFood Dashboard</p>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
              </div>
              {/* Fake chart bars */}
              <div className="flex items-end gap-2 h-28 mb-4 pt-2">
                {[60, 80, 55, 90, 70, 85, 65, 95, 75, 88].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-primary-600 opacity-80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              {/* Fake stats row */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: "12,482", label: "Predictions" },
                  { val: "1,240", label: "Items" },
                  { val: "18.5%", label: "Waste ↓" },
                ].map((s, i) => (
                  <div key={i} className="bg-primary-800 rounded-lg p-2 text-center">
                    <p className="text-white text-sm font-bold">{s.val}</p>
                    <p className="text-primary-300 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge — digeser ke bawah lebih */}
            <div className="absolute -bottom-8 -left-4 bg-white rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-gray-800 text-xs font-bold">Waste Reduction</p>
                <p className="text-primary-700 text-sm font-bold">-24%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-primary-900 mb-3">
              Eco-Logistics Solutions
            </h2>
            <p className="text-gray-500">
              Built for professional kitchens and global suppliers.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {[
              {
                icon: <Radio className="w-5 h-5 text-white" />,
                title: "AI-Powered Prediction",
                desc: "Our neural networks analyze historical sales, seasonal trends, and local events to generate highly accurate demand curves.",
              },
              {
                icon: <Package className="w-5 h-5 text-white" />,
                title: "Stock Optimization",
                desc: "Dynamic inventory thresholds that adjust in real-time to prevent overstocking and costly ingredient spoilage.",
              },
              {
                icon: <BarChart2 className="w-5 h-5 text-white" />,
                title: "Waste Reduction Dashboard",
                desc: "Track your carbon footprint and financial savings side-by-side with our comprehensive sustainability metrics.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-[#f5f5f0] rounded-2xl p-7 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-primary-900 font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-[#f5f5f0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-primary-900 mb-3">
              The Path to Efficiency
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-8 relative">
            <div className="absolute top-10 left-[28%] right-[28%] h-0.5 bg-primary-200" />
            {[
              {
                num: "1",
                icon: <Upload className="w-6 h-6 text-primary-700" />,
                title: "Upload Data",
                desc: "Connect your POS or ERP system to securely sync historical inventory data.",
              },
              {
                num: "2",
                icon: <Sparkles className="w-6 h-6 text-primary-700" />,
                title: "Get Prediction",
                desc: "Our AI engine processes the data and generates a forecast for the upcoming cycle.",
              },
              {
                num: "3",
                icon: <CheckCircle className="w-6 h-6 text-primary-700" />,
                title: "Optimize Stock",
                desc: "Order precisely what you need, reducing food waste and boosting profit margins.",
              },
            ].map((s, i) => (
              <div key={i} className="text-center relative">
                <div className="relative inline-block mb-5">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                    {s.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-800 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{s.num}</span>
                  </div>
                </div>
                <h3 className="text-primary-900 font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-20 bg-primary-800">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Ready to transform your logistics?
            </h2>
            <p className="text-primary-200 text-sm">
              Join the network of professional kitchens and food suppliers who
              are leading the way in operational efficiency and sustainability.
            </p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="bg-primary-300 text-primary-900 font-semibold px-8 py-3 rounded-xl hover:bg-primary-200 transition-colors whitespace-nowrap"
          >
            Launch Platform
          </button>
        </div>
      </section>
    </LandingLayout>
  );
}
