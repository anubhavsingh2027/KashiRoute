import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getAllPackages } from "../api/services.js";
// Removed local sample data import — initialize empty and rely on API
import "../styles.css";

export default function PackageDetailsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const packageId = id || searchParams.get("id");
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPackages = async () => {
      const data = await getAllPackages();
      if (data && !data.error) {
        const pkgList = Array.isArray(data.packages) ? data.packages : data;
        setPackages(pkgList);
      }
      setLoading(false);
    };
    loadPackages();
  }, []);

  useEffect(() => {
    if (packages.length > 0) {
      const pkg = packages.find(
        (p) => p._id === packageId || p.id === packageId,
      );
      setSelectedPackage(pkg || packages[0]);
    }
  }, [packages, packageId]);

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
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
          <i className="fas fa-box text-purple-600 mr-3"></i>Travel Packages
        </h1>

        <AnimatePresence>
          {modalOpen && selectedPackage && (
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
                    layoutId={`pkg-image-${selectedPackage._id || selectedPackage.id}`}
                  >
                    <img
                      src={selectedPackage.url}
                      alt={selectedPackage.packageName}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          {selectedPackage.packageName}
                        </h2>
                        <p className="text-sm text-purple-600 mt-2">
                          <i className="fas fa-map-marker-alt mr-2" />
                          {selectedPackage.place}
                        </p>
                        <p className="text-sm text-gray-600 mt-3">
                          {selectedPackage.description}
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
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Duration</p>
                        <p className="text-xl font-bold text-purple-600">
                          {selectedPackage.packageDuration} Days
                        </p>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Price/Person</p>
                        <p className="text-xl font-bold text-emerald-600">
                          ₹{selectedPackage.price}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <a
                        href={`/packageBook?id=${selectedPackage._id || selectedPackage.id}`}
                        className="ml-auto py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold"
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

        {/* All Packages Grid */}
        <h3 className="text-2xl font-bold mb-8 text-gray-800">All Packages</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <motion.div
              key={pkg._id || pkg.id}
              layout
              whileHover={{ scale: 1.02 }}
              className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                selectedPackage?._id === pkg._id ||
                selectedPackage?.id === pkg.id
                  ? "ring-2 ring-purple-600"
                  : ""
              }`}
            >
              <motion.div layoutId={`pkg-image-${pkg._id || pkg.id}`}>
                <img
                  src={pkg.url}
                  alt={pkg.packageName}
                  className="w-full h-48 object-cover"
                />
              </motion.div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1">
                  {pkg.packageName}
                </h3>
                <p className="text-xs text-purple-600 mb-2">
                  <i className="fas fa-map-marker-alt mr-1"></i>
                  {pkg.place}
                </p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {pkg.description}
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">
                      {pkg.packageDuration} Days
                    </p>
                    <p className="text-lg font-bold text-purple-600">
                      ₹{pkg.price}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setModalOpen(true);
                      }}
                      className="px-3 py-1 bg-purple-100 text-purple-600 rounded text-sm font-semibold hover:bg-purple-200"
                    >
                      View
                    </motion.button>
                    <a
                      href={`/packageBook?id=${pkg._id || pkg.id}`}
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
