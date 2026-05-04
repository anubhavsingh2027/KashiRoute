import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgetPassword, verifyForgotOTP, resendOTP } from "../api/services.js";
import "../styles.css";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: password
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
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

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await forgetPassword({ email });
      if (response?.status) {
        setSuccess("OTP sent to your email!");
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!otp || otp.trim().length === 0) {
        setError("Please enter the OTP");
        setLoading(false);
        return;
      }

      const response = await verifyForgotOTP({
        email,
        otp: otp.trim(),
        newPassword,
      });

      if (response?.status) {
        setSuccess("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(response?.message || "Invalid OTP or password");
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
      const response = await resendOTP({ email });
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
            <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
              <i className="fas fa-key text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-orange-600">
                Reset Password
              </h1>
              <p className="text-sm text-gray-600">Recover your account</p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-2">
            <div
              className={`h-2 flex-1 rounded ${
                step >= 1 ? "bg-orange-500" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`h-2 flex-1 rounded ${
                step >= 2 ? "bg-orange-500" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`h-2 flex-1 rounded ${
                step >= 3 ? "bg-orange-500" : "bg-gray-200"
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

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-70 transition-all text-sm"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  We've sent a 6-character OTP to {email}
                </p>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setError("");
                  }}
                  placeholder="e.g., A3xK9B"
                  maxLength="6"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-center text-lg font-mono tracking-widest"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter new password"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
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
                disabled={loading || !otp || !newPassword}
                className="w-full py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-70 transition-all text-sm"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              {/* Resend OTP */}
              <div className="text-center pt-2">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-sm text-orange-600 hover:underline font-semibold"
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

          <Link
            to="/login"
            className="block text-center text-orange-600 hover:underline text-sm font-semibold"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
