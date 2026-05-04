import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, verifySignupOTP, resendOTP } from "../api/services.js";
import { useAuth } from "../contexts/AuthContext";
import "../styles.css";

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1: registration form, 2: OTP verification
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    phone: "",
    location: "",
  });
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // OTP Timer Effect
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    } else if (otpTimer === 0 && step === 2) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [otpTimer, step]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await registerUser(formData);
      if (response?.status) {
        setSuccess("OTP sent to your email!");
        setUserId(response.userId);
        setStep(2);
        setOtpTimer(420); // 7 minutes
        setCanResend(false);
      } else {
        setError(response?.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!otp || otp.trim().length === 0) {
        setError("Please enter the OTP");
        setLoading(false);
        return;
      }

      const response = await verifySignupOTP({ userId, otp: otp.trim() });
      if (response?.status) {
        setSuccess("Account created successfully! Redirecting...");
        // Auto-login the user
        if (login) {
          login(response.user);
        }
        setTimeout(() => navigate("/"), 1500);
      } else {
        setError(response?.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setLoading(true);
    setError("");

    try {
      const response = await resendOTP({ userId });
      if (response?.status) {
        setSuccess("OTP resent to your email!");
        setOtp("");
        setOtpTimer(420);
        setCanResend(false);
      } else {
        setError(response?.message || "Failed to resend OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
              <i className="fas fa-user-plus text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-600">
                Create Account
              </h1>
              <p className="text-sm text-gray-600">
                {step === 1 ? "Join Kashi Route" : "Verify your email"}
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-2">
            <div
              className={`h-2 flex-1 rounded ${
                step >= 1 ? "bg-emerald-500" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`h-2 flex-1 rounded ${
                step >= 2 ? "bg-emerald-500" : "bg-gray-200"
              }`}
            ></div>
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

          {step === 1 ? (
            <form onSubmit={handleSubmitRegistration} className="space-y-3">
              <input
                type="text"
                name="userName"
                placeholder="Full Name"
                value={formData.userName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
              />

              <input
                type="text"
                name="location"
                placeholder="Location / City"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-70 transition-all text-sm"
              >
                {loading ? "Sending OTP..." : "Continue"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  We've sent a 6-character OTP to {formData.email}
                </p>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="e.g., A3xK9B"
                  maxLength="6"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-center text-lg font-mono tracking-widest"
                />
              </div>

              {/* Timer */}
              <div className="text-center">
                {otpTimer > 0 ? (
                  <p className="text-sm text-gray-600">
                    OTP expires in{" "}
                    <span className="font-bold text-orange-600">
                      {Math.floor(otpTimer / 60)}:
                      {String(otpTimer % 60).padStart(2, "0")}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-red-600">
                    OTP expired. Please request a new one.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !otp}
                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-70 transition-all text-sm"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              {/* Resend OTP */}
              <div className="text-center pt-2">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-sm text-emerald-600 hover:underline font-semibold"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <p className="text-xs text-gray-500">
                    Resend available in {otpTimer}s
                  </p>
                )}
              </div>

              {/* Back button */}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all text-sm"
              >
                Back
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-600 hover:underline font-semibold"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
