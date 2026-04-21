import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserSession,
  getAllUsers,
  changeUserType,
} from "../api/services.js";
import "../styles.css";

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleTypeChange = async (userId, newType) => {
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const response = await changeUserType({ userId, userType: newType });
      if (response?.status || !response?.error) {
        setUsers(
          users.map((u) =>
            u._id === userId ? { ...u, userType: newType } : u,
          ),
        );
        setSuccess(`User type updated to ${newType}!`);
      } else {
        setError(response?.message || "Failed to update user type");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(searchEmail.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full mb-4"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          <i className="fas fa-users text-indigo-600 mr-3"></i>Manage Users
        </h1>

        {error && (
          <div className="success-box error-box mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}
        {success && (
          <div className="success-box mb-6">
            <strong>Success:</strong> {success}
          </div>
        )}

        {/* Stats (summary) */}
        <div className="grid md:grid-cols-3 gap-6 mb-6 fade-in">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {users.length}
            </div>
            <p className="text-gray-600">Total Users</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {users.filter((u) => u.userType === "host").length}
            </div>
            <p className="text-gray-600">Hosts/Admins</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {users.filter((u) => u.userType !== "host").length}
            </div>
            <p className="text-gray-600">Regular Users</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2">
            <i className="fas fa-search text-gray-400 text-xl"></i>
            <input
              type="text"
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full px-4 py-3 border-0 focus:ring-0 bg-transparent"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {u.userName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-semibold text-gray-800">
                          {u.userName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-gray-600">{u.phone}</td>
                    <td className="px-6 py-4 text-gray-600">{u.location}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          u.userType === "host"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {u.userType || "guest"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {u.userType !== "host" && (
                          <button
                            onClick={() => handleTypeChange(u._id, "host")}
                            disabled={updating}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-200 disabled:opacity-70"
                          >
                            Make Host
                          </button>
                        )}
                        {u.userType === "host" && (
                          <button
                            onClick={() => handleTypeChange(u._id, "guest")}
                            disabled={updating}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 disabled:opacity-70"
                          >
                            Make User
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-inbox text-6xl text-gray-300 mb-4 block"></i>
              <p className="text-gray-500 text-lg">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
