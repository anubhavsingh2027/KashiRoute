import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

function Layout() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full"
        />
        <p className="mt-4 text-slate-600">Loading session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />
      <motion.main
        className="flex-1 min-h-screen"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Outlet />
      </motion.main>
      <motion.footer
        className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-slate-200 border-t border-slate-800/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-white">Kashi Route</h3>
              <p className="text-sm text-slate-400">
                Experience sacred journeys with premium travel services across
                Varanasi.
              </p>
              <div className="flex gap-3 pt-2">
                <a
                  href="https://facebook.com"
                  className="text-slate-400 hover:text-sky-400 transition-colors"
                >
                  <i className="fab fa-facebook text-lg"></i>
                </a>
                <a
                  href="https://twitter.com"
                  className="text-slate-400 hover:text-sky-400 transition-colors"
                >
                  <i className="fab fa-twitter text-lg"></i>
                </a>
                <a
                  href="https://instagram.com"
                  className="text-slate-400 hover:text-sky-400 transition-colors"
                >
                  <i className="fab fa-instagram text-lg"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/home"
                    className="text-slate-400 hover:text-sky-400 transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    className="text-slate-400 hover:text-sky-400 transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="/packageDetails"
                    className="text-slate-400 hover:text-sky-400 transition-colors"
                  >
                    Packages
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="text-slate-400 hover:text-sky-400 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">
                Services
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/carDetails"
                    className="text-slate-400 hover:text-sky-400 transition-colors"
                  >
                    Car Rental
                  </a>
                </li>
                <li>
                  <a
                    href="/packageDetails"
                    className="text-slate-400 hover:text-sky-400 transition-colors"
                  >
                    Packages
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-sky-400 transition-colors"
                  >
                    Tours
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-sky-400 transition-colors"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <i className="fas fa-phone text-sky-400 mt-1"></i>
                  <a
                    href="tel:+917355026966"
                    className="text-slate-400 hover:text-sky-400 transition-colors"
                  >
                    +91 7355026966
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-envelope text-sky-400 mt-1"></i>
                  <a
                    href="mailto:support@kashiroute.com"
                    className="text-slate-400 hover:text-sky-400 transition-colors"
                  >
                    support@kashiroute.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-map-marker-alt text-sky-400 mt-1"></i>
                  <span className="text-slate-400">Varanasi, India</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800/50 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
              <span>© 2026 Kashi Route. All rights reserved.</span>
              <div className="flex gap-6">
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default Layout;
