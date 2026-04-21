import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserSession,
  getAllPackages,
  createPackage,
  deletePackage,
} from "../api/services.js";
import "../styles.css";

export default function AdminPackagePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [packages, setPackages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    packageName: "",
    price: "",
    packageDuration: "",
    place: "",
    description: "",
    url: "",
  });

  useEffect(() => {
    const checkAndLoad = async () => {
      const session = await getUserSession();
      if (!session?.loggedIn || session?.user?.userType !== "host") {
        navigate("/unauthorized");
        return;
      }
      setUser(session.user);
      const data = await getAllPackages();
      setPackages(Array.isArray(data) ? data : data.packages || []);
      setLoading(false);
    };
    checkAndLoad();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await createPackage(formData);
      if (response?.status || !response?.error) {
        setSuccess("Package added successfully!");
        setPackages([...packages, response.package || formData]);
        setFormData({
          packageName: "",
          price: "",
          packageDuration: "",
          place: "",
          description: "",
          url: "",
        });
        setShowForm(false);
      } else {
        setError(response?.message || "Failed to add package");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (packageId) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    const response = await deletePackage(packageId);
    if (response?.status || !response?.error) {
      setPackages(
        packages.filter((p) => p._id !== packageId && p.id !== packageId),
      );
      setSuccess("Package deleted successfully!");
    } else {
      setError("Failed to delete package");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full mb-4"></div>
          <p>Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            <i className="fas fa-box text-purple-600 mr-3"></i>Manage Packages
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg"
          >
            <i className="fas fa-plus mr-2"></i>Add New Package
          </button>
        </div>

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

        {/* Add Package Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Add New Package
            </h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="packageName"
                placeholder="Package Name"
                value={formData.packageName}
                onChange={handleChange}
                required
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="number"
                name="price"
                placeholder="Price per Person (₹)"
                value={formData.price}
                onChange={handleChange}
                required
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="number"
                name="packageDuration"
                placeholder="Duration (days)"
                value={formData.packageDuration}
                onChange={handleChange}
                required
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                name="place"
                placeholder="Destination/Place"
                value={formData.place}
                onChange={handleChange}
                required
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="url"
                name="url"
                placeholder="Image URL"
                value={formData.url}
                onChange={handleChange}
                required
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                className="md:col-span-2 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
              ></textarea>
              <button
                type="submit"
                disabled={submitting}
                className="md:col-span-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold disabled:opacity-70"
              >
                {submitting ? "Adding..." : "Add Package"}
              </button>
            </form>
          </div>
        )}

        {/* Packages List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg._id || pkg.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <img
                src={pkg.url}
                alt={pkg.packageName}
                className="w-full h-40 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {pkg.packageName}
                </h3>
                <p className="text-sm text-purple-600 mb-2">
                  <i className="fas fa-map-marker-alt mr-1"></i>
                  {pkg.place}
                </p>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {pkg.description}
                </p>

                <div className="flex justify-between items-center mb-4 py-4 border-t border-b">
                  <div>
                    <p className="text-xs text-gray-600">Duration</p>
                    <p className="text-lg font-bold text-purple-600">
                      {pkg.packageDuration}d
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Price</p>
                    <p className="text-lg font-bold text-emerald-600">
                      ₹{pkg.price}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(pkg._id || pkg.id)}
                  className="w-full py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition"
                >
                  <i className="fas fa-trash mr-2"></i>Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {packages.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-inbox text-6xl text-gray-300 mb-4 block"></i>
            <p className="text-gray-500 text-lg">No packages added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
