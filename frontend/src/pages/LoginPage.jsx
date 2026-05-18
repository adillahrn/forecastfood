import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail } from "lucide-react";
import logo from "../assets/logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* ── LEFT PANEL ── */}
      <div className="bg-primary-900 flex flex-col p-10 relative overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="ForecastFood" className="w-8 h-8 rounded-lg" />
          <div>
            <p className="text-white font-bold text-sm">ForecastFood</p>
            <p className="text-primary-400 text-xs">Eco-Logistics AI Powering Sustainable Supply Chains</p>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center gap-8">
          {/* Headline */}
          <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-3">
              Smarter Forecasting,
              <br />
              <span className="text-primary-400">Less Waste.</span>
            </h2>
            <p className="text-primary-300 text-sm leading-relaxed">
              Join thousands of F&B businesses using AI to reduce food waste and optimize their supply chain.
            </p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "2,400+", label: "Businesses" },
              { value: "34%", label: "Avg Waste Reduced" },
              { value: "98%", label: "Prediction Accuracy" },
              { value: "7-Day", label: "Forecast Range" },
            ].map((s, i) => (
              <div key={i} className="bg-primary-800 rounded-xl p-4">
                <p className="text-white text-2xl font-black">{s.value}</p>
                <p className="text-primary-400 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Dashboard mockup */}
          <div className="bg-primary-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-primary-300 text-xs font-semibold uppercase tracking-widest">Weekly Demand</p>
              <span className="text-green-400 text-xs font-bold">↑ +18.5%</span>
            </div>
            <div className="flex items-end gap-1.5 h-20">
              {[40, 65, 50, 80, 60, 90, 75, 95, 70, 85, 65, 100].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${h}%`,
                    background: i === 11 ? "#4ade80" : "#166534",
                    opacity: i === 11 ? 1 : 0.7,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <span key={d} className="text-primary-500 text-xs">{d}</span>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-base">★</span>
              ))}
            </div>
            <p className="text-white text-sm font-semibold leading-snug mb-2">
              "Reduced our food waste by 32% in the first month."
            </p>
            <p className="text-white text-xs font-bold">Marcus Chen</p>
            <p className="text-primary-400 text-xs">Head of Operations</p>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-800 rounded-full opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-700 rounded-full opacity-20 translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="bg-[#f5f5f0] flex items-center justify-center px-16">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-8">Sign in to your ForecastFood account</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary-400 transition-colors pr-10"
                  required
                />
                <Mail size={16} className="absolute right-3 top-3.5 text-gray-300" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-600">Password</label>
                <button type="button" className="text-sm text-primary-700 font-medium hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary-400 transition-colors pr-10"
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
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-primary-800 text-white font-semibold py-3.5 rounded-xl hover:bg-primary-700 transition-colors text-sm"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
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
            Sign in with Google
          </button>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-700 font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
