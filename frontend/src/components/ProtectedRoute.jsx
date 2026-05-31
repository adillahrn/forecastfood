import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Tampilkan loading spinner saat cek auth
  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-primary-300 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Kalau belum login, redirect ke home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
