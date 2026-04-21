import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserSession,
  getAllCars,
  createCar,
  deleteCar,
} from "../api/services.js";
import "../styles.css";

export default function AdminCarPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    carName: "",
    price: "",
    totalSeats: "",
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
      const data = await getAllCars();
      setCars(Array.isArray(data) ? data : data.cars || []);
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
      const response = await createCar(formData);
      if (response?.status || !response?.error) {
        setSuccess("Car added successfully!");
        setCars([...cars, response.car || formData]);
        setFormData({
          carName: "",
          price: "",
          totalSeats: "",
          description: "",
          url: "",
        });
        setShowForm(false);
      } else {
        setError(response?.message || "Failed to add car");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (carId) => {
    if (!confirm("Are you sure you want to delete this car?")) return;
    const response = await deleteCar(carId);
    if (response?.status || !response?.error) {
      setCars(cars.filter((c) => c._id !== carId && c.id !== carId));
      setSuccess("Car deleted successfully!");
    } else {
      setError("Failed to delete car");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-200 border-t-sky-600 rounded-full mb-4"></div>
          <p>Loading cars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            <i className="fas fa-car text-sky-600 mr-3"></i>Manage Cars
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg"
          >
            <i className="fas fa-plus mr-2"></i>Add New Car
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

        {/* Add Car Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Add New Car
            </h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="carName"
                placeholder="Car Name"
                value={formData.carName}
                onChange={handleChange}
                required
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
              <input
                type="number"
                name="price"
                placeholder="Daily Price (₹)"
                value={formData.price}
                onChange={handleChange}
                required
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
              <input
                type="number"
                name="totalSeats"
                placeholder="Number of Seats"
                value={formData.totalSeats}
                onChange={handleChange}
                required
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
              <input
                type="url"
                name="url"
                placeholder="Image URL"
                value={formData.url}
                onChange={handleChange}
                required
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                className="md:col-span-2 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 resize-none"
              ></textarea>
              <button
                type="submit"
                disabled={submitting}
                className="md:col-span-2 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-lg font-semibold disabled:opacity-70"
              >
                {submitting ? "Adding..." : "Add Car"}
              </button>
            </form>
          </div>
        )}

        {/* Cars List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div
              key={car._id || car.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <img
                src={car.url}
                alt={car.carName}
                className="w-full h-40 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {car.carName}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {car.description}
                </p>

                <div className="flex justify-between items-center mb-4 py-4 border-t border-b">
                  <div>
                    <p className="text-xs text-gray-600">Daily Rate</p>
                    <p className="text-lg font-bold text-sky-600">
                      ₹{car.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Seats</p>
                    <p className="text-lg font-bold text-indigo-600">
                      {car.totalSeats}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(car._id || car.id)}
                  className="w-full py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition"
                >
                  <i className="fas fa-trash mr-2"></i>Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {cars.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-inbox text-6xl text-gray-300 mb-4 block"></i>
            <p className="text-gray-500 text-lg">No cars added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
