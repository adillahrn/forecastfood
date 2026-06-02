import { useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password updated successfully!");
    navigate("/login");
  };

  useEffect(() => {
    const getSession = async () => {
        const { data } = await supabase.auth.getSession();
        console.log("SESSION:", data.session);
    };

    getSession();
    }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
      <form
        onSubmit={handleReset}
        className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6">
          Reset Password
        </h1>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 mb-4"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-800 text-white py-3 rounded-xl"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}