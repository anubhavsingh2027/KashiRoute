import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getAllCars } from "../api/services.js";
// Removed local sample data import — initialize empty and rely on API
import "../styles.css";

export default function CarDetailsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const carId = id || searchParams.get("id");
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCars = async () => {
      const data = await getAllCars();
      if (data && !data.error) {
        const carList = Array.isArray(data.cars) ? data.cars : data;
        setCars(carList);
      }
      setLoading(false);
    };
    loadCars();
  }, []);

  useEffect(() => {
    if (cars.length > 0) {
      const car = cars.find((c) => c._id === carId || c.id === carId);
      setSelectedCar(car || cars[0]);
    }
  }, [cars, carId]);

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
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
          <i className="fas fa-car text-sky-600 mr-3"></i>Available Cars
        </h1>

        {/* Modal popup for selected car details */}
        <AnimatePresence>
          {modalOpen && selectedCar && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/40"
                onClick={() => setModalOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              <motion.div
                className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-3xl w-full mx-4"
                initial={{ scale: 0.95, y: 12, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.98, y: 8, opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex items-start gap-6">
                  <motion.div
                    className="w-1/2 bg-gray-100 rounded-lg overflow-hidden h-56"
                    layoutId={`car-image-${selectedCar._id || selectedCar.id}`}
                  >
                    <img
                      src={selectedCar.url}
                      alt={selectedCar.carName}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          {selectedCar.carName}
                        </h2>
                        <p className="text-sm text-gray-600 mt-2">
                          {selectedCar.description}
                        </p>
                      </div>
                      <button
                        onClick={() => setModalOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="bg-sky-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Seats</p>
                        <p className="text-xl font-bold text-sky-600">
                          {selectedCar.totalSeats}
                        </p>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Daily Rate</p>
                        <p className="text-xl font-bold text-emerald-600">
                          ₹{selectedCar.price}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <a
                        href={`/carBook?id=${selectedCar._id || selectedCar.id}`}
                        className="ml-auto py-2 px-4 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-lg font-semibold"
                      >
                        Book Now
                      </a>
                      <button
                        onClick={() => setModalOpen(false)}
                        className="py-2 px-4 border rounded-lg"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All Cars Grid */}
        <h3 className="text-2xl font-bold mb-8 text-gray-800">
          All Available Cars
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {cars.map((car) => (
            <motion.div
              key={car._id || car.id}
              layout
              whileHover={{ scale: 1.02 }}
              className={`bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all hover:shadow-xl ${
                selectedCar?._id === car._id || selectedCar?.id === car.id
                  ? "ring-2 ring-sky-600"
                  : ""
              }`}
            >
              <motion.div layoutId={`car-image-${car._id || car.id}`}>
                <img
                  src={car.url}
                  alt={car.carName}
                  className="w-full h-48 object-cover"
                />
              </motion.div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  {car.carName}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {car.description}
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Per Day</p>
                    <p className="text-lg font-bold text-sky-600">
                      ₹{car.price}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setSelectedCar(car);
                        setModalOpen(true);
                      }}
                      className="px-3 py-1 bg-sky-100 text-sky-600 rounded text-sm font-semibold hover:bg-sky-200"
                    >
                      View
                    </motion.button>
                    <a
                      href={`/carBook?id=${car._id || car.id}`}
                      className="px-3 py-1 bg-emerald-500 text-white rounded text-sm font-semibold hover:brightness-95"
                    >
                      Book
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
