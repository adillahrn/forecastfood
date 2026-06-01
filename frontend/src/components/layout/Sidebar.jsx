import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileInput,
  Radio,
  Package,
  History,
  Info,
  LogOut,
  Settings,
} from "lucide-react";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { to: "/input-data", icon: <FileInput size={18} />, label: "Input Data" },
  { to: "/predictions", icon: <Radio size={18} />, label: "Predictions" },
  { to: "/history", icon: <History size={18} />, label: "History" },
  { to: "/about", icon: <Info size={18} />, label: "About" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Ambil nama dari metadata Supabase, fallback ke email, lalu "User"
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const displayEmail = user?.email || "";

  // Inisial avatar dari huruf pertama nama
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await signOut();   // ← benar-benar hapus session Supabase
    navigate("/");     // ← kembali ke halaman home
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-white border-r border-gray-100 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <img src={logo} alt="ForecastFood" className="w-8 h-8 rounded-lg" />
          <div className="leading-tight">
            <p className="text-primary-800 font-bold text-sm">ForecastFood</p>
            <p className="text-primary-600 text-xs">ECO-LOGISTICS AI</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary-800 text-white"
                  : "text-gray-500 hover:bg-primary-50 hover:text-primary-800"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        {/* User info — tampilkan data real dari Supabase */}
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer mb-1"
          onClick={() => navigate("/settings")}
        >
          <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-gray-800 text-sm font-medium truncate">{displayName}</p>
            <p className="text-gray-400 text-xs truncate">{displayEmail}</p>
          </div>
        </div>

        {/* Settings */}
        <button
          onClick={() => navigate("/settings")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-primary-800 transition-all mb-1"
        >
          <Settings size={18} />
          Settings
        </button>

        {/* Logout — memanggil signOut() Supabase secara nyata */}
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
