import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getUserSession, logoutUser } from "../api/services";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const session = await getUserSession();
      if (session?.loggedIn && session?.user) setUser(session.user);
    };
    loadSession();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    navigate("/login");
  };

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef();

  useEffect(() => {
    function handleOutside(e) {
      if (
        showUserMenu &&
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target)
      ) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showUserMenu]);

  const navLinks = [
    { label: "Home", to: "/home", icon: "fas fa-home" },
    { label: "About", to: "/about", icon: "fas fa-info-circle" },
    { label: "Cars", to: "/carDetails", icon: "fas fa-car" },
    { label: "Packages", to: "/packageDetails", icon: "fas fa-box" },
    { label: "Contact", to: "/contact", icon: "fas fa-envelope" },
  ];

  const userLinks = user
    ? [
        { label: "Book Car", to: "/carBook", icon: "fas fa-car" },
        { label: "Book Package", to: "/packageBook", icon: "fas fa-plane" },
        { label: "My History", to: "/history", icon: "fas fa-history" },
      ]
    : [];

  const adminLinks =
    user?.userType === "host"
      ? [
          { label: "Manage Cars", to: "/adminCarSet", icon: "fas fa-cogs" },
          {
            label: "Manage Packages",
            to: "/adminPackageSet",
            icon: "fas fa-cogs",
          },
          { label: "Manage Users", to: "/adminUsers", icon: "fas fa-users" },
          { label: "Bookings", to: "/adminHistory", icon: "fas fa-chart-bar" },
        ]
      : [];

  // decide which links to show based on auth + userType
  let displayLinks = [];
  if (!user) {
    // not logged in: show public nav only
    displayLinks = navLinks;
  } else if (user.userType === "host") {
    // host/admin: show Home + admin links only
    displayLinks = [navLinks[0], ...adminLinks];
  } else {
    // regular logged-in user: show public nav + user links
    displayLinks = [...navLinks, ...userLinks];
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <NavLink
            to="/"
            className="font-bold text-2xl text-sky-600 hover:text-sky-700"
          >
            <i className="fas fa-compass mr-2"></i>Kashi Route
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {displayLinks.map((link) => {
              const isAdmin = adminLinks.some((a) => a.to === link.to);
              const isUser = userLinks.some((a) => a.to === link.to);
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => {
                    let activeClass = "text-gray-700 hover:bg-gray-100";
                    if (isActive) {
                      if (isAdmin)
                        activeClass =
                          "bg-purple-100 text-purple-600 font-semibold";
                      else if (isUser)
                        activeClass =
                          "bg-emerald-100 text-emerald-600 font-semibold";
                      else
                        activeClass = "bg-sky-100 text-sky-600 font-semibold";
                    }
                    return `px-3 py-2 rounded-lg transition flex items-center gap-2 ${activeClass}`;
                  }}
                >
                  <i className={link.icon}></i>
                  <span className="ml-1">{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <NavLink
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
                >
                  Sign Up
                </NavLink>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu((s) => !s)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:shadow-md transition"
                    aria-label="User menu"
                  >
                    <i className="fas fa-user"></i>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {user.userName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">
                            {user.userName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 mb-3">
                        <div>
                          Phone:{" "}
                          <span className="font-medium">
                            {user.phone || "-"}
                          </span>
                        </div>
                        <div>
                          Car bookings:{" "}
                          <span className="font-medium">
                            {(user.carBooking || []).length}
                          </span>
                        </div>
                        <div>
                          Package bookings:{" "}
                          <span className="font-medium">
                            {(user.packageBook || []).length}
                          </span>
                        </div>
                      </div>

                      {user.userType === "host" && (
                        <button
                          to="/adminUsers"
                          className="block w-full text-center px-3 py-2 bg-purple-600 text-white rounded-md font-semibold mb-2"
                        >
                          Admin Access
                        </button>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-md text-sm text-red-600"
                      >
                        <i className="fas fa-sign-out-alt"></i> Logout
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-md bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition"
                  title="Logout"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <i className="fas fa-bars text-2xl"></i>
          </button>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <nav className="md:hidden mt-4 space-y-2 pb-4 border-t pt-4">
            {displayLinks.map((link) => {
              const isAdmin = adminLinks.some((a) => a.to === link.to);
              const isUser = userLinks.some((a) => a.to === link.to);
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setShowMobileMenu(false)}
                  className={({ isActive }) => {
                    let activeClass = "text-gray-700 hover:bg-gray-100";
                    if (isActive) {
                      if (isAdmin)
                        activeClass =
                          "bg-purple-100 text-purple-600 font-semibold";
                      else if (isUser)
                        activeClass =
                          "bg-emerald-100 text-emerald-600 font-semibold";
                      else
                        activeClass = "bg-sky-100 text-sky-600 font-semibold";
                    }
                    return `block px-4 py-2 rounded-lg transition ${activeClass}`;
                  }}
                >
                  <i className={`${link.icon} mr-2`}></i>
                  <span>{link.label}</span>
                </NavLink>
              );
            })}

            {user && (
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="font-semibold">{user.userName}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
                <div className="flex gap-3 mt-2 text-sm">
                  <div>
                    Cars: <strong>{(user.carBooking || []).length}</strong>
                  </div>
                  <div>
                    Packages: <strong>{(user.packageBook || []).length}</strong>
                  </div>
                </div>
                {user.userType === "host" && (
                  <NavLink
                    onClick={() => setShowMobileMenu(false)}
                    className="mt-3 block px-3 py-2 bg-purple-600 text-white rounded-md text-center"
                  >
                    Admin Access
                  </NavLink>
                )}
              </div>
            )}

            <div className="pt-2 border-t flex gap-2">
              {!user ? (
                <>
                  <NavLink
                    to="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex-1 text-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/signup"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex-1 text-center px-4 py-2 bg-sky-600 text-white rounded-lg"
                  >
                    Sign Up
                  </NavLink>
                </>
              ) : (
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Navbar;
