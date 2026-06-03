import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={logo} alt="ForecastFood Logo" className="w-8 h-8 rounded-lg" />
              <p className="text-primary-800 font-bold text-sm">ForecastFood</p>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Empowering event organizers and food providers with intelligent forecasting to reduce waste and optimize food planning.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <p className="text-gray-800 font-semibold text-sm mb-4">Product</p>
            <div className="flex flex-col gap-2">
              <Link to="/predictions" className="text-gray-500 text-sm hover:text-primary-800 transition-colors">
                Predictions
              </Link>
              <Link to="/stock-recommendation" className="text-gray-500 text-sm hover:text-primary-800 transition-colors">
                Stock Recommendation
              </Link>
              <Link to="/dashboard" className="text-gray-500 text-sm hover:text-primary-800 transition-colors">
                Dashboard
              </Link>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <p className="text-gray-800 font-semibold text-sm mb-4">Company</p>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="text-gray-500 text-sm hover:text-primary-800 transition-colors">
                About Us
              </Link>
              <Link to="/about" className="text-gray-500 text-sm hover:text-primary-800 transition-colors">
                Sustainability Report
              </Link>
              <a href="#" className="text-gray-500 text-sm hover:text-primary-800 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-10 pt-6 flex items-center justify-between">
          <p className="text-gray-400 text-xs">
            © 2026 ForecastFood Eco-Logistics AI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 text-xs hover:text-primary-800 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 text-xs hover:text-primary-800 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
