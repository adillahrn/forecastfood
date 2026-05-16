import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isLanding = location.pathname === "/";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="ForecastFood Logo" className="w-8 h-8 rounded-lg" />
          <div className="leading-tight">
            <p className="text-primary-800 font-bold text-sm">ForecastFood</p>
            <p className="text-primary-600 text-xs">ECO-LOGISTICS AI</p>
          </div>
        </Link>

        {/* Nav Links + CTA — semua align right */}
        {isLanding && (
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-primary-800 border-b-2 border-primary-800 pb-0.5"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-primary-800 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-gray-600 hover:text-primary-800 transition-colors"
            >
              About
            </Link>
            <button
              onClick={() => navigate("/login")}
              className="bg-primary-800 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
