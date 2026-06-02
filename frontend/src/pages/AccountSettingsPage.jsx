import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Lock,
  Building2,
  Bell,
  Settings,
  Camera,
  ChevronDown,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import { supabase } from "../services/supabase";
import { useToast } from "../components/ui/Toast";

// ── Tab Config ──
const tabs = [
  { id: "profile", label: "Profile Information", icon: <User size={16} /> },
  { id: "security", label: "Security & Password", icon: <Lock size={16} /> },
];

// ── Toggle Component ──
function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-primary-700" : "bg-gray-200"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

// ── Password Strength ──
function PasswordStrength({ password }) {
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const labels = ["", "Weak", "Medium", "Strong"];
  const colors = ["", "bg-red-400", "bg-yellow-400", "bg-primary-600"];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${strength >= i ? colors[strength] : "bg-gray-200"}`} />
        ))}
      </div>
      {password.length > 0 && (
        <p className={`text-xs font-medium ${strength === 1 ? "text-red-500" : strength === 2 ? "text-yellow-500" : "text-primary-600"}`}>
          Strength: {labels[strength]}
        </p>
      )}
    </div>
  );
}

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const fileRef = useRef();

  const [activeTab, setActiveTab] = useState("profile");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Ambil data real dari Supabase session
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Profile state — pre-filled dari data Supabase
  const [profile, setProfile] = useState({
    name: displayName,
    email: user?.email || "",
    phone: user?.user_metadata?.phone || "",
    role: user?.user_metadata?.role || "",
    bio: user?.user_metadata?.bio || "",
  });

  // Business state
  const [business, setBusiness] = useState({
    name:
      user?.user_metadata?.business_name ||
      "",
      
    type:
      user?.user_metadata?.business_type ||
      "Supplier",

    location:
      user?.user_metadata?.business_location ||
      "",

    staff:
      user?.user_metadata?.business_staff ||
      "",
  });

  // Preferences state
  const [prefs, setPrefs] = useState({
    language: "English",
    currency: "USD ($)",
    dateFormat: "MM/DD/YYYY",
    defaultView: "Dashboard",
    theme: "Light",
  });

  const handlePhoto = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    let avatarUrl = user?.user_metadata?.avatar_url;

    if (photoFile) {
      const fileExt = photoFile.name.split(".").pop();

      const fileName =
        `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(fileName, photoFile);

      if (uploadError) {
        console.log(uploadError);
        showToast(uploadError.message, "error");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      avatarUrl = publicUrl;
    }

    const { error } =
      await supabase.auth.updateUser({
        data: {
          full_name: profile.name,
          phone: profile.phone,
          role: profile.role,
          bio: profile.bio,
          avatar_url: avatarUrl,
        },
      });

    if (error) {
      showToast(error.message, "error");
      return;
    }

    showToast("Profile updated successfully! 🎉", "success");

    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handleSaveBusiness = async () => {
      const { error } =
        await supabase.auth.updateUser({
          data: {
            business_name: business.name,
            business_type: business.type,
            business_location: business.location,
            business_staff: business.staff,
          },
        });

      if (error) {
        showToast(error.message, "error");
        return;
      }

      showToast(
        "Business information updated! 🏢",
        "success"
      );
    };

  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      showToast("Please enter a new password", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast(
        "Password must be at least 6 characters",
        "error"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      showToast(error.message, "error");
      return;
    }

    showToast(
      "Password updated successfully! 🔒",
      "success"
    );

    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <>
      {ToastComponent}
    <AppLayout>
      <div className="p-8">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">Account Settings</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage your profile and preferences</p>
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className="grid grid-cols-4 gap-6">
          {/* LEFT — Tab Nav */}
          <div className="col-span-1">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-medium transition-colors border-l-4 ${
                    activeTab === tab.id
                      ? "border-l-primary-800 bg-primary-50 text-primary-800"
                      : "border-l-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Content */}
          <div className="col-span-3">

            {/* ── PROFILE TAB ── */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-xl font-bold text-primary-900 mb-6">Profile Information</h2>

                {/* Avatar */}
                <div className="flex items-center gap-5 mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-primary-200 flex items-center justify-center overflow-hidden">
                      {photoPreview || user?.user_metadata?.avatar_url ? (
                        <img
                          src={
                            photoPreview ||
                            user?.user_metadata?.avatar_url
                          }
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-primary-800 text-2xl font-bold">
                          {initials}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => fileRef.current.click()}
                      className="absolute bottom-0 right-0 w-6 h-6 bg-primary-800 rounded-full flex items-center justify-center"
                    >
                      <Camera size={12} className="text-white" />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => fileRef.current.click()}
                      className="bg-primary-800 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors"
                    >
                      Upload Photo
                    </button>
                    {(photoPreview || user?.user_metadata?.avatar_url) && (
                      <button
                        onClick={() => setPhotoPreview(null)}
                        className="text-sm text-red-500 font-medium hover:underline"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed pr-24"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        ✓ VERIFIED
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Phone Number</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          phone: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Role / Job Title</label>
                    <input
                      type="text"
                      value={profile.role}
                      onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>
                </div>
                <div className="mb-8">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Bio / About</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Brief description of your role and responsibilities..."
                    rows={4}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-primary-400 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-primary-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === "security" && (
              <div className="flex flex-col gap-5">
                <div className="bg-white rounded-2xl shadow-sm p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-primary-900">Security & Password</h2>
                  </div>

                  <div className="mb-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Current Password</label>
                    <input
                      type="password"
                      value="••••••••••••"
                      disabled
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-primary-400 transition-colors pr-10"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <PasswordStrength password={newPassword} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-primary-400 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleUpdatePassword}
                    className="mt-4 bg-primary-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {/* ── PREFERENCES TAB ── */}
            {activeTab === "preferences" && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-xl font-bold text-primary-900 mb-6">App Preferences</h2>

                <div className="grid grid-cols-2 gap-5 mb-5">
                  {[
                    { label: "Language", key: "language", options: ["English", "Indonesian"] },
                    { label: "Currency", key: "currency", options: ["USD ($)", "IDR (Rp)", "EUR (€)"] },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{f.label}</label>
                      <div className="relative">
                        <select
                          value={prefs[f.key]}
                          onChange={(e) => setPrefs({ ...prefs, [f.key]: e.target.value })}
                          className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-primary-400 transition-colors bg-white pr-8"
                        >
                          {f.options.map((o) => <option key={o}>{o}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Theme Toggle */}
                <div className="mb-8">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Theme</label>
                  <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
                    {["Light", "Dark"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setPrefs({ ...prefs, theme: t })}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                          prefs.theme === t ? "bg-white text-primary-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="bg-primary-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
    </>
  );
}
