import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col">
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 pt-16">
        {/* Card with background image effect */}
        <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Background — dark overlay with warehouse/logistics vibe */}
          <div className="absolute inset-0 bg-primary-900 opacity-90" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center py-14 px-16">
            {/* 404 Number */}
            <h1 className="text-[100px] font-black text-white leading-none tracking-tight drop-shadow-lg">
              404
            </h1>

            {/* Headline */}
            <h2 className="text-3xl font-bold text-white mt-2 mb-4">
              Oops. This page got wasted
            </h2>

            {/* Subtext */}
            <p className="text-gray-300 text-base max-w-md leading-relaxed mb-10">
              This page may have been recycled or relocated. Try returning to
              the homepage or going to your dashboard.
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="border-2 border-white text-white font-semibold px-7 py-3 rounded-xl hover:bg-white hover:text-primary-900 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
