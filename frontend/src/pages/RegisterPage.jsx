import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, TrendingUp } from "lucide-react";
import logo from "../assets/logo.png";

function PasswordStrength({ password }) {
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const labels = ["", "Weak strength", "Medium strength", "Strong strength"];
  const colors = ["", "bg-red-400", "bg-yellow-400", "bg-primary-600"];
  const textColors = ["", "text-red-500", "text-yellow-500", "text-primary-600"];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${strength >= i ? colors[strength] : "bg-gray-200"}`} />
        ))}
      </div>
      {password.length > 0 && (
        <p className={`text-xs font-medium ${textColors[strength]}`}>{labels[strength]}</p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!agreed) return alert("Please agree to the Terms of Service.");
    if (form.password !== form.confirm) return alert("Passwords do not match.");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* ── LEFT PANEL ── */}
      <div className="bg-primary-900 flex flex-col p-10 relative overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <img src={logo} alt="ForecastFood" className="w-8 h-8 rounded-lg" />
          <div>
            <p className="text-white font-bold text-sm">ForecastFood</p>
            <p className="text-primary-400 text-xs">Eco-Logistics AI Powering Sustainable Supply Chains</p>
          </div>
        </div>

        {/* Headline */}
        <div className="mb-8">
          <h2 className="text-4xl font-black text-primary-400 leading-tight mb-4">
            Eco-Logistics AI
          </h2>
          <p className="text-primary-200 text-sm leading-relaxed">
            Join 2,000+ F&B businesses reducing food waste with AI-powered
            forecasting. Streamline your supply chain and embrace sustainable growth.
          </p>
        </div>

        {/* Dashboard Mockup Card */}
        <div className="bg-primary-800 rounded-2xl p-5 shadow-xl mb-8">
          <div className="h-36 flex items-end gap-0.5 mb-4 relative">
            <svg viewBox="0 0 300 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <polyline
                points="0,80 30,65 60,70 90,45 120,55 150,35 180,40 210,25 240,30 270,15 300,20"
                fill="none" stroke="#4ade80" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              />
              <polyline
                points="0,90 30,80 60,85 90,70 120,75 150,60 180,65 210,50 240,55 270,40 300,45"
                fill="none" stroke="#166534" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.6"
              />
              <polygon
                points="0,80 30,65 60,70 90,45 120,55 150,35 180,40 210,25 240,30 270,15 300,20 300,100 0,100"
                fill="url(#gradient)" opacity="0.2"
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-400 text-xs font-semibold uppercase tracking-widest">Weekly Waste Reduction</p>
              <p className="text-white text-2xl font-black mt-0.5">+34.2%</p>
            </div>
            <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
              <TrendingUp size={18} className="text-primary-300" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "2,400+", label: "Businesses" },
            { value: "98%", label: "Accuracy" },
          ].map((s, i) => (
            <div key={i} className="bg-primary-800 rounded-xl p-3">
              <p className="text-white text-xl font-black">{s.value}</p>
              <p className="text-primary-400 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-800 rounded-full opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-700 rounded-full opacity-20 translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="bg-white flex items-center justify-center px-16 py-10">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-400 text-sm mb-8">Start forecasting smarter today</p>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* Full Name */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary-400 transition-colors"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Email</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary-400 transition-colors"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary-400 transition-colors pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary-400 transition-colors"
                required
              />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-primary-800 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-500 cursor-pointer">
                I agree to the{" "}
                <span className="text-primary-700 font-medium hover:underline cursor-pointer">Terms of Service</span>
                {" "}and{" "}
                <span className="text-primary-700 font-medium hover:underline cursor-pointer">Privacy Policy</span>.
              </label>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              className="w-full bg-primary-800 text-white font-semibold py-3.5 rounded-xl hover:bg-primary-700 transition-colors text-sm mt-1"
            >
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Button */}
          <button className="w-full bg-white border border-gray-200 rounded-xl py-3.5 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Sign up with Google
          </button>

          {/* Login Link — tambah padding bawah */}
          <p className="text-center text-sm text-gray-500 mt-6 mb-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-700 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
