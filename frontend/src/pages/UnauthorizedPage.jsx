import { useNavigate } from "react-router-dom";
import "../styles.css";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-8xl mb-4">🚫</div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Access Denied
          </h1>
          <p className="text-xl text-gray-600 mb-2">Unauthorized Access</p>
          <p className="text-gray-600">
            You don't have permission to access this page. Please contact
            administrator.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate("/home")}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
          >
            Go to Home
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
