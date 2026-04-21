import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserSession, getUserHistory } from "../api/services.js";
import "../styles.css";

export default function UserHistoryPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [carHistory, setCarHistory] = useState([]);
  const [packageHistory, setPackageHistory] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const session = await getUserSession();
      if (!session?.loggedIn || !session?.user?._id) {
        navigate("/login");
        return;
      }
      setUser(session.user);

      const history = await getUserHistory(session.user._id);
      setCarHistory(history?.carHistory || []);
      setPackageHistory(history?.packageHistory || []);
      setLoading(false);
    };
    loadData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-200 border-t-sky-600 rounded-full mb-4"></div>
          <p>Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Welcome + Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 fade-in">
          <div className="flex items-center justify-between gap-6 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center text-white text-3xl">
                {user?.userName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Welcome back,
                </h1>
                <div className="text-xl font-semibold text-slate-700">
                  {user?.userName || "Guest"}
                </div>
                <div className="text-sm text-gray-500">{user?.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-500">Total Bookings</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {carHistory.length + packageHistory.length}
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-500">Cars</div>
                <div className="text-2xl font-bold text-blue-600">
                  {carHistory.length}
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-500">Packages</div>
                <div className="text-2xl font-bold text-purple-600">
                  {packageHistory.length}
                </div>
              </div>
            </div>
          </div>
          <p className="text-gray-600">
            Here is a clear view of your recent bookings with filters and quick
            actions.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg font-semibold ${filterType === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("car")}
              className={`px-4 py-2 rounded-lg font-semibold ${filterType === "car" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              Cars
            </button>
            <button
              onClick={() => setFilterType("package")}
              className={`px-4 py-2 rounded-lg font-semibold ${filterType === "package" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              Packages
            </button>
          </div>

          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or date..."
              className="px-4 py-2 border rounded-lg w-64 focus:outline-none"
            />
          </div>
        </div>

        {/* Listings */}
        <div className="space-y-6">
          {(filterType === "all" || filterType === "car") && (
            <div className="bg-white rounded-2xl shadow-lg p-6 fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">🚗</div>
                <h3 className="text-xl font-bold">Car Bookings</h3>
              </div>

              {carHistory.filter(
                (b) =>
                  (b.carName || "")
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                  new Date(b.date).toLocaleDateString().includes(search),
              ).length > 0 ? (
                <div className="grid gap-4">
                  {carHistory
                    .filter(
                      (b) =>
                        (b.carName || "")
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        new Date(b.date).toLocaleDateString().includes(search),
                    )
                    .map((booking, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border shadow-sm hover:shadow-md transition bg-gradient-to-r from-white to-blue-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-lg font-semibold text-slate-800">
                              {booking.carName}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Pickup:{" "}
                              {new Date(booking.date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              Duration: {booking.duration} days
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Booked:{" "}
                              {new Date(booking.bookingDate).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-blue-600">
                              ₹{booking.price}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Per day
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <i className="fas fa-inbox text-4xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500">No car bookings found</p>
                </div>
              )}
            </div>
          )}

          {(filterType === "all" || filterType === "package") && (
            <div className="bg-white rounded-2xl shadow-lg p-6 fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">🧳</div>
                <h3 className="text-xl font-bold">Package Bookings</h3>
              </div>

              {packageHistory.filter(
                (b) =>
                  (b.packageName || "")
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                  new Date(b.arrivalDate).toLocaleDateString().includes(search),
              ).length > 0 ? (
                <div className="grid gap-4">
                  {packageHistory
                    .filter(
                      (b) =>
                        (b.packageName || "")
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        new Date(b.arrivalDate)
                          .toLocaleDateString()
                          .includes(search),
                    )
                    .map((booking, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border shadow-sm hover:shadow-md transition bg-gradient-to-r from-white to-purple-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-lg font-semibold text-slate-800">
                              {booking.packageName}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Guests: {booking.guestNo}
                            </div>
                            <div className="text-sm text-gray-500">
                              Arrival:{" "}
                              {new Date(
                                booking.arrivalDate,
                              ).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Booked:{" "}
                              {new Date(booking.bookingDate).toLocaleString()}
                            </div>
                            {booking.request && (
                              <div className="text-sm text-gray-500 mt-2">
                                Notes: {booking.request}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-purple-600">
                              ₹{booking.price}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Per person
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <i className="fas fa-inbox text-4xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500">No package bookings found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
