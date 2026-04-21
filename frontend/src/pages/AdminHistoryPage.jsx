import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserSession,
  getAllUsers,
  getAllCars,
  getAllPackages,
} from "../api/services.js";
import "../styles.css";
import HistoryAnalytics from "../components/HistoryAnalytics.jsx";

export default function AdminHistoryPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchEmail, setSearchEmail] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndLoad = async () => {
      const session = await getUserSession();
      if (!session?.loggedIn || session?.user?.userType !== "host") {
        navigate("/unauthorized");
        return;
      }
      setUser(session.user);

      const data = await getAllUsers();
      setUsers(data.users || data);
      setLoading(false);
    };
    checkAndLoad();
  }, [navigate]);

  const getFilteredUsers = () => {
    let filtered = users;
    if (searchEmail) {
      filtered = filtered.filter((u) =>
        u.email?.toLowerCase().includes(searchEmail.toLowerCase()),
      );
    }
    return filtered;
  };

  const sortBookingsByDate = (bookings, order) => {
    return bookings.sort((a, b) => {
      const dateA = new Date(a.bookingDate);
      const dateB = new Date(b.bookingDate);
      return order === "newest" ? dateB - dateA : dateA - dateB;
    });
  };

  const renderBookings = (type) => {
    const filteredUsers = getFilteredUsers();
    return filteredUsers.map((userData) => {
      const bookings =
        type === "package"
          ? sortBookingsByDate(userData.packageBook || [], sortOrder)
          : sortBookingsByDate(userData.carBooking || [], sortOrder);

      if (bookings.length === 0) return null;

      return (
        <div
          key={userData._id}
          className="bg-white rounded-lg p-6 mb-6 shadow-lg"
        >
          {/* User Header */}
          <div className="flex justify-between items-start mb-4 pb-4 border-b">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xl">
                <i className="fas fa-user-circle"></i>
              </div>
              <div>
                <h3 className="font-bold text-lg">{userData.userName}</h3>
                <p className="text-sm text-gray-600">
                  <i className="fas fa-envelope mr-2"></i>
                  {userData.email}
                  <span className="mx-3">•</span>
                  <i className="fas fa-phone mr-2"></i>
                  {userData.phone}
                </p>
              </div>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">
                {bookings.length}
              </div>
              <div className="text-xs text-gray-600">Bookings</div>
            </div>
          </div>

          {/* Bookings */}
          <div className="space-y-3">
            {bookings.map((booking, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg ${
                  type === "package"
                    ? "bg-purple-50 border-l-4 border-purple-500"
                    : "bg-blue-50 border-l-4 border-blue-500"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {type === "package"
                        ? booking.packageName
                        : booking.carName}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <i className="fas fa-calendar mr-2"></i>
                      Booked: {new Date(booking.bookingDate).toLocaleString()}
                    </p>
                    {type === "car" && (
                      <p className="text-sm text-gray-600">
                        <i className="fas fa-clock mr-2"></i>
                        {booking.duration} days
                      </p>
                    )}
                    {type === "package" && (
                      <p className="text-sm text-gray-600">
                        <i className="fas fa-users mr-2"></i>
                        {booking.guestNo} guests
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">
                      ₹{booking.price}
                    </p>
                    <p className="text-xs text-gray-500">Confirmed</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full mb-4"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-12 text-center">
          <i className="fas fa-history text-blue-600 mr-3"></i>Booking History
        </h1>

        {/* Analytics */}
        <HistoryAnalytics users={users} />

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    filterType === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType("package")}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    filterType === "package"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Packages
                </button>
                <button
                  onClick={() => setFilterType("car")}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    filterType === "car"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Cars
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Email
              </label>
              <input
                type="text"
                placeholder="Search by email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div>
          {filterType === "all" || filterType === "package" ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                <i className="fas fa-box text-purple-600 mr-3"></i>Package
                Bookings
              </h2>
              {renderBookings("package").length > 0 ? (
                renderBookings("package")
              ) : (
                <div className="bg-white rounded-lg p-8 text-center">
                  <i className="fas fa-inbox text-6xl text-gray-300 mb-4 block"></i>
                  <p className="text-gray-500">No package bookings found</p>
                </div>
              )}
            </div>
          ) : null}

          {filterType === "all" ? <div className="my-8"></div> : null}

          {filterType === "all" || filterType === "car" ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                <i className="fas fa-car text-blue-600 mr-3"></i>Car Bookings
              </h2>
              {renderBookings("car").length > 0 ? (
                renderBookings("car")
              ) : (
                <div className="bg-white rounded-lg p-8 text-center">
                  <i className="fas fa-inbox text-6xl text-gray-300 mb-4 block"></i>
                  <p className="text-gray-500">No car bookings found</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
