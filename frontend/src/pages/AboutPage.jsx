import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Bell,
  Settings,
  LayoutDashboard,
  FileText,
  Database,
  Brain,
  ArrowRight,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import LandingLayout from "../components/layout/LandingLayout";

const team = [
  { name: "Evi Novita Gultom", role: "Data Scientist", initials: "EG" },
  { name: "Adillah Ridwan", role: "AI Engineer", initials: "AR" },
  { name: "Nailah Adianti Hermawan", role: "Full-Stack Web Dev", initials: "NH" },
  { name: "Nando Febriano Seva", role: "Data Scientist", initials: "NS" },
  { name: "Tesalonika Natalie Sofi S.", role: "AI Engineer", initials: "TS" },
  { name: "Rafael Daniel Lumban T.", role: "Full-Stack Web Dev", initials: "RT" },
];

const techStack = [
  { name: "React", color: "bg-blue-100 text-blue-700", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Node.js", color: "bg-green-100 text-primary-700", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "TensorFlow", color: "bg-orange-100 text-orange-700", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg" },
  { name: "Python", color: "bg-yellow-100 text-yellow-700", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  { name: "Supabase", color: "bg-emerald-100 text-emerald-700", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg" },
  { name: "Express.js", color: "bg-gray-100 text-gray-700", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
];

const cycle = [
  {
    num: "1",
    icon: <Database size={22} className="text-white" />,
    title: "Data Ingestion",
    desc: "Synchronize your existing POS and inventory systems to feed our AI with historical consumption data.",
  },
  {
    num: "2",
    icon: <Brain size={22} className="text-white" />,
    title: "AI Processing",
    desc: "Our TensorFlow-driven models run complex regressions to predict future demand with up to 94% accuracy.",
  },
  {
    num: "3",
    icon: <LayoutDashboard size={22} className="text-white" />,
    title: "Dynamic Strategy",
    desc: "Generates automated stock recommendations and early warnings to prevent overstocking and stock shortages.",
  },
];

export default function AboutPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const isLoggedIn = !loading && !!user;

  // Tunggu sampai auth state selesai dicek supaya layout tidak salah
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-300 border-t-primary-800 rounded-full animate-spin" />
      </div>
    );
  }

  const content = (
    <div className="p-8">
      {/* ── Top Bar — hanya tampil kalau sudah login ── */}
      {isLoggedIn && (
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">About This System</h1>
          </div>
        </div>
      )}

      {/* ── Kalau belum login, tambah padding top buat navbar ── */}
      {!isLoggedIn && <div className="pt-16" />}

      {/* ── Mission Section ── */}
      <div className="bg-white rounded-2xl p-8 shadow-sm mb-6 grid grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-bold text-primary-700 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full">
            The Mission
          </span>
          <h2 className="text-4xl font-black text-primary-900 leading-tight mt-4 mb-5">
            Combatting food waste through predictive intelligence.
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            ForecastFood is an advanced Eco-Logistics AI platform designed to bridge the gap between supply chain volatility and kitchen efficiency.

            By analyzing historical consumption patterns, seasonal trends, and local event data, the system delivers precise inventory recommendations that help reduce operational costs and minimize environmental impact.
          </p>
          <div className="flex items-center gap-3">
            <button
              id="about-cta-btn"
              onClick={() => navigate(isLoggedIn ? "/dashboard" : "/login")}
              className="flex items-center gap-2 bg-primary-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors"
            >
              {isLoggedIn ? "View Dashboard" : "Get Started"}
              <ArrowRight size={16} />
            </button>
            <a
              href="https://github.com/nailahhermawan/forecastfood"
              target="_blank"
              rel="noopener noreferrer"
              className="
                px-4 py-2
                bg-white
                text-primary-800
                border border-primary-800
                rounded-xl
                transition-all duration-200
                hover:bg-primary-800
                hover:text-white
              "
            >
              Documentation
            </a>
          </div>
        </div>

        {/* Right — decorative card */}
        <div className="w-full h-64 bg-primary-100 rounded-2xl overflow-hidden">
          <img
            src="src/assets/about-ff.png"
            alt="ForecastFood Eco-Logistics AI"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ── Predictive Cycle ── */}
      <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-2">The Predictive Cycle</h2>
          <p className="text-gray-400 text-sm">Simple integration, powerful results in three core steps.</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {cycle.map((c, i) => (
            <div key={i} className={`rounded-2xl p-6 ${i === 1 ? "bg-primary-800" : "bg-[#f5f5f0]"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${i === 1 ? "bg-primary-700" : "bg-primary-800"}`}>
                {c.icon}
              </div>
              <p className={`text-lg font-bold mb-2 ${i === 1 ? "text-white" : "text-primary-900"}`}>
                {c.num}. {c.title}
              </p>
              <p className={`text-sm leading-relaxed ${i === 1 ? "text-primary-200" : "text-gray-500"}`}>
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tech Stack ── */}
      <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-primary-900 mb-1">Powered by Industry-Leading Tech</h2>
        </div>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {techStack.map((t, i) => (
            <div key={i} className={`flex items-center gap-2.5 text-sm font-semibold px-4 py-2.5 rounded-xl ${t.color}`}>
              <img src={t.logo} alt={t.name} className="w-5 h-5 object-contain" />
              {t.name}
            </div>
          ))}
        </div>
      </div>

      {/* ── Team ── */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-2">Meet the Innovators</h2>
          <p className="text-gray-400 text-sm">Tim CC26-PSU403 — Coding Camp 2026 powered by DBS Foundation</p>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {team.map((member, i) => (
            <div key={i} className="flex items-center gap-4 bg-[#f5f5f0] rounded-2xl p-4">
              <div className="w-12 h-12 rounded-full bg-primary-800 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {member.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{member.name}</p>
                <p className="text-xs text-gray-400">{member.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center leading-relaxed max-w-2xl mx-auto">
            DISCLAIMER: ForecastFood predictions are based on statistical probability models. While we strive
            for maximum accuracy, forecasts may vary due to unforeseen environmental factors, market shifts,
            or inaccurate input data. This system is designed as a decision-support tool and should be used
            in conjunction with professional managerial judgment. © 2026 ForecastFood Eco-Logistics AI.
          </p>
        </div>
      </div>
    </div>
  );

  // Kalau sudah login → pakai AppLayout (ada sidebar)
  if (isLoggedIn) {
    return <AppLayout>{content}</AppLayout>;
  }
  return <LandingLayout>{content}</LandingLayout>;
}