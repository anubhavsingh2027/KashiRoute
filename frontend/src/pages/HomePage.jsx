import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getAllPackages, getAllCars } from "../api/services";

function HomePage() {
  const [packages, setPackages] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [packagesData, carsData] = await Promise.all([
          getAllPackages(),
          getAllCars(),
        ]);
        setPackages(packagesData);
        setCars(carsData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const typewriterText = "Your Journey, Our Commitment";
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < typewriterText.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + typewriterText.charAt(currentIndex));
        setCurrentIndex((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url('https://wallpapercave.com/wp/wp6759674.jpg')",
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70"></div>

        {/* Background Animation Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-orange-400/20 rounded-full blur-3xl animate-blob"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 text-center text-white">
          <div className="fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-lg">
              Discover the
              <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Sacred City
              </span>
              <br />
              of Varanasi
            </h1>

            <p className="text-xl md:text-2xl opacity-90 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Embark on a spiritual journey through ancient temples, sacred
              ghats, and timeless traditions. Experience the mystical charm of
              Varanasi with our curated packages and expert guidance.
            </p>

            {/* Enhanced Stats */}
            <div className="flex flex-wrap justify-center items-center gap-6 mb-12 text-white">
              <div className="flex items-center space-x-3 glass-effect px-6 py-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20">
                <i className="fas fa-star text-yellow-400 text-xl"></i>
                <span className="font-semibold">From 2,000+ reviews</span>
              </div>
              <div className="flex items-center space-x-3 glass-effect px-6 py-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20">
                <i className="fas fa-shield-alt text-blue-400 text-xl"></i>
                <span className="font-semibold">Verified Services</span>
              </div>
              <div className="flex items-center space-x-3 glass-effect px-6 py-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20">
                <i className="fas fa-landmark text-orange-400 text-xl"></i>
                <span className="font-semibold">Ancient Heritage</span>
              </div>
              <div className="flex items-center space-x-3 glass-effect px-6 py-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20">
                <i className="fas fa-clock text-purple-400 text-xl"></i>
                <span className="font-semibold">24/7 Available</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#special-packages"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl transform hover:scale-105 transition-transform duration-300"
              >
                <span className="flex items-center space-x-3">
                  <i className="fas fa-play"></i>
                  <span>Explore Packages</span>
                </span>
              </a>
              <a href="tel:+917355026966">
                <button className="backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:-translate-y-1">
                  <span className="flex items-center space-x-3">
                    <i className="fas fa-phone"></i>
                    <span>Call Now</span>
                  </span>
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Special Travel Packages Section */}
      <section id="special-packages" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Special Travel Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our handpicked selection of spiritual journeys and
              cultural experiences in the holy city of Varanasi.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <Skeleton height={240} />
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Skeleton width={80} height={24} />
                      <Skeleton width={100} height={24} />
                    </div>
                    <Skeleton count={2} className="mb-4" />
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <Skeleton width={80} height={16} className="mb-1" />
                        <Skeleton width={60} height={24} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton width={32} height={32} circle />
                        <Skeleton width={80} height={32} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {(Array.isArray(packages) ? packages : packages?.packages || [])
                .slice(0, 6)
                .map((pkg) => (
                  <motion.article
                    key={pkg._id}
                    variants={cardVariants}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group hover:-translate-y-1 enhanced-card"
                  >
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img
                        src={pkg.url}
                        alt={pkg.packageName}
                        className="w-full h-full object-cover transform transition duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium">
                        <i className="fas fa-fire text-amber-400"></i> Popular
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {pkg.packageName}
                        </h3>
                        <p className="text-white/90 flex items-center gap-2 text-sm">
                          <i className="fas fa-map-marker-alt text-rose-400"></i>{" "}
                          {pkg.place}
                        </p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-sm">
                          <i className="fas fa-clock"></i> {pkg.packageDuration}{" "}
                          Days
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-sm">
                          <i className="fas fa-user-group"></i> Group Tour
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                        {pkg.description}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-sm text-slate-500 mb-1">
                            Starting from
                          </p>
                          <div className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                            ₹{pkg.price}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/package-details/${pkg._id}`}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors group"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <Link
                            to={`/package-book?id=${pkg._id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-sky-100 transition-all duration-300"
                          >
                            Book Now
                            <i className="fas fa-arrow-right text-sm transition-transform group-hover:translate-x-1"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Available Cars Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Available Vehicles
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our fleet of comfortable and well-maintained vehicles
              for your spiritual journey.
            </p>
          </div>

          {(Array.isArray(cars) ? cars : cars?.cars || []).slice(0, 6).length >
            0 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {(Array.isArray(cars) ? cars : cars?.cars || [])
                .slice(0, 6)
                .map((car) => (
                  <motion.article
                    key={car._id}
                    variants={cardVariants}
                    className="bg-gradient-to-br from-white to-slate-50/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group hover:-translate-y-1 enhanced-card"
                  >
                    <div className="relative overflow-hidden aspect-[5/3]">
                      <img
                        src={car.url}
                        alt={car.carName}
                        className="w-full h-full object-cover transform transition duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                        <i className="fas fa-check"></i> Available Now
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-sky-600 transition-colors">
                        {car.carName}
                      </h3>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 bg-sky-50 rounded-lg p-2">
                          <i className="fas fa-snowflake text-sky-500"></i>
                          <span className="text-sm text-slate-600">
                            AC Vehicle
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-indigo-50 rounded-lg p-2">
                          <i className="fas fa-user-group text-indigo-500"></i>
                          <span className="text-sm text-slate-600">
                            {car.totalSeats} Seats
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-50 rounded-lg p-2">
                          <i className="fas fa-route text-emerald-500"></i>
                          <span className="text-sm text-slate-600">
                            City Tours
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-amber-50 rounded-lg p-2">
                          <i className="fas fa-shield-check text-amber-500"></i>
                          <span className="text-sm text-slate-600">
                            Verified
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                        {car.description}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Per Day</p>
                          <div className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                            ₹{car.price}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/car-details/${car._id}`}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors group"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <Link
                            to={`/car-book?id=${car._id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-sky-100 transition-all duration-300"
                          >
                            Book Now
                            <i className="fas fa-arrow-right text-sm transition-transform group-hover:translate-x-1"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Typewriter Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            {displayText}
            <span className="animate-pulse">|</span>
          </h2>
          <p className="text-xl opacity-90">
            We are committed to providing you with the best spiritual travel
            experience in Varanasi.
          </p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
