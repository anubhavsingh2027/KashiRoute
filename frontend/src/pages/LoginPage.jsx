import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, logoutUser } from "../api/services.js";
import { useAuth } from "../contexts/AuthContext";
import "../styles.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await loginUser(formData);
      if (response?.status && response?.user) {
        // Store user in auth context
        login(response.user);
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => navigate("/home"), 1500);
      } else {
        setError(response?.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check for logout request
  const params = new URLSearchParams(window.location.search);
  const isLogout = params.get("logoutRequest") === "true";

  if (isLogout) {
    logoutUser();
    logout();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-white via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-100/60 via-transparent to-transparent"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-100/60 via-transparent to-transparent"></div>
      <div className="fixed inset-0 backdrop-blur-[2px]"></div>

      <div className="max-w-5xl w-full grid md:grid-cols-[1.2fr,0.8fr] gap-12 items-start relative z-10">
        {/* Left Section - Form */}
        <div className="w-full bg-white/90 rounded-2xl shadow-2xl p-8 space-y-6 animate-slide-up backdrop-blur-xl ring-1 ring-white relative overflow-hidden group hover:shadow-indigo-500/10 transition-all duration-500 mt-12">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-indigo-50 opacity-50"></div>
          <div className="absolute inset-0 bg-grid-slate-100/[0.03]"></div>
          <div className="absolute -left-4 -top-4 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-700"></div>

          {/* Form Header */}
          <div className="relative flex items-center gap-6 mb-8">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg transform hover:scale-105 transition-transform duration-300 group-hover:shadow-indigo-500/30">
              <i className="fas fa-user text-white text-2xl animate-pulse"></i>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-sm text-gray-600">
                Sign in to continue your journey with Kashi Route
              </p>
            </div>
          </div>

          {error && (
            <div className="success-box error-box">
              <strong>Error:</strong> {error}
            </div>
          )}
          {success && (
            <div className="success-box">
              <strong>Success:</strong> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700 flex items-center gap-2"
              >
                <i className="fas fa-envelope text-slate-400"></i>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="abc@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 placeholder-gray-400 text-gray-600 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700 flex items-center gap-2"
              >
                <i className="fas fa-lock text-slate-400"></i>
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 placeholder-gray-400 text-gray-600 backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <i
                    className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  ></i>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm pt-2">
              <Link
                to="/forgot-password"
                className="text-indigo-600 hover:text-purple-500 transition-colors flex items-center gap-2 group px-3 py-1 rounded-lg hover:bg-indigo-50"
              >
                <i className="fas fa-key text-xs group-hover:rotate-12 transition-transform"></i>
                <span className="border-b border-indigo-200 group-hover:border-purple-300">
                  Forgot password?
                </span>
              </Link>
              <Link
                to="/signup"
                className="text-gray-600 hover:text-indigo-500 transition-colors flex items-center gap-2 group px-3 py-1 rounded-lg hover:bg-indigo-50"
              >
                <span className="border-b border-gray-200 group-hover:border-indigo-300">
                  Create account
                </span>
                <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all duration-500 transform hover:scale-[1.02] focus:scale-[0.98] flex items-center justify-center gap-3 group shadow-lg shadow-indigo-500/30 hover:shadow-purple-500/30 disabled:opacity-70"
            >
              <span className="inline-flex items-center gap-2">
                <i
                  className={`fas fa-sign-in-alt ${!loading ? "group-hover:translate-x-1" : ""} transition-transform`}
                ></i>
                {loading ? "Signing in..." : "Sign in"}
              </span>
            </button>
          </form>
        </div>

        {/* Right Section - Features */}
        <div className="hidden md:flex flex-col items-center justify-start h-full pt-6 space-y-12">
          {/* Logo Container */}
          <div className="relative w-full flex justify-center items-center py-4">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl opacity-60"></div>
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>

            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
              <div className="h-28 w-28 relative rounded-3xl shadow-xl ring-2 ring-white transform hover:scale-110 transition-all duration-500 group-hover:shadow-indigo-500/50 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">KR</span>
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="text-center space-y-8 mt-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Explore Amazing Destinations
            </h2>
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-white/80 backdrop-blur-md ring-1 ring-white shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-indigo-500/10 group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <i className="fas fa-route text-indigo-600"></i>
                  </div>
                  <h3 className="font-semibold text-slate-800">Guided Tours</h3>
                </div>
                <p className="text-slate-600 text-sm">
                  Experience Varanasi with expert local guides
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white/80 backdrop-blur-md ring-1 ring-white shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-indigo-500/10 group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <i className="fas fa-car text-purple-600"></i>
                  </div>
                  <h3 className="font-semibold text-slate-800">Car Rentals</h3>
                </div>
                <p className="text-slate-600 text-sm">
                  Comfortable vehicles for your journey
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white/80 backdrop-blur-md ring-1 ring-white shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-indigo-500/10 group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-2 bg-sky-100 rounded-lg">
                    <i className="fas fa-hotel text-sky-600"></i>
                  </div>
                  <h3 className="font-semibold text-slate-800">
                    Premium Stays
                  </h3>
                </div>
                <p className="text-slate-600 text-sm">
                  Luxury accommodations near sacred sites
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
