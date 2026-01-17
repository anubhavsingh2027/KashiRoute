import { getUserSession } from "./services.js";

const navbar = document.getElementById("navbar");


const TEMPORARY_LINKS = [
  { name: "Home", href: "/home" },
  { name: "About", href: "/about" },
  { name: "Packages", href: "/packageDetails" },
  { name: "Cars", href: "/carDetails" },
  { name: "Contact", href: "contact" },
  { name: "Sign In", href: "/login" },
];

function buildSkeletonLoader() {
  const skeletonItems = Array(6)
    .fill(0)
    .map(
      () => `
      <div class="skeleton rounded-lg h-10 w-20 flex-shrink-0"></div>
    `,
    )
    .join("");

  return `
    <div class="w-full bg-gradient-to-r from-white/95 via-gray-50/95 to-white/95 text-black backdrop-blur-2xl supports-[backdrop-filter]:bg-opacity-95 shadow-2xl shadow-black/20 border-b border-gradient relative overflow-hidden">
      <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-blue-500/5 to-purple-600/5 animate-gradient-x"></div>
      </div>

      <div class="relative flex items-center justify-between h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Logo Skeleton -->
        <div class="flex-shrink-0">
          <div class="flex items-center gap-4">
            <div class="skeleton rounded-full h-12 w-12"></div>
            <div class="hidden md:block">
              <div class="skeleton rounded h-6 w-24 mb-2"></div>
              <div class="skeleton rounded h-3 w-16"></div>
            </div>
          </div>
        </div>

        <!-- Navigation Skeleton -->
        <div class="hidden md:flex md:items-center">
          <div class="nav-container relative bg-white/80 backdrop-blur-2xl rounded-3xl p-3 shadow-2xl border border-white/50 overflow-hidden flex items-center gap-2">
            ${skeletonItems}
          </div>
        </div>

        <!-- Mobile Menu Button Skeleton -->
        <div class="flex md:hidden">
          <div class="skeleton rounded-xl p-3 w-12 h-12"></div>
        </div>
      </div>
    </div>
  `;
}

function showLoadingState() {
  navbar.innerHTML = buildSkeletonLoader();
}

function buildLinkHtml(link, isActive) {
  const iconMap = {
    Home: "fa-home",
    About: "fa-info-circle",
    Packages: "fa-box-open",
    Cars: "fa-car",
    Contact: "fa-envelope",
    "Sign In": "fa-sign-in-alt",
    "Sign Out": "fa-sign-out-alt",
    "Book Package": "fa-shopping-cart",
    "Book Car": "fa-car-side",
    History: "fa-history",
    "Admin Cars": "fa-car-alt",
    "Admin Packages": "fa-boxes",
    Bookings: "fa-calendar-check",
    Users: "fa-users",
  };

  const icon = iconMap[link.name] || "fa-link";

  return `
    <a href="${link.href}"
       class="nav-link group relative px-2 py-1.5 rounded-lg text-[12px] font-medium tracking-wide transition-all duration-500 overflow-hidden transform hover:scale-105 ${
         isActive
           ? "active-gradient text-black shadow-lg ring-1 ring-white/30"
           : "bg-white/90 text-gray-700 hover:bg-white/95 hover:shadow-md backdrop-blur-xl"
       }"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/50 via-blue-500/50 to-purple-600/50 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

      <span class="relative z-20 flex items-center gap-1.5">
        <div class="relative">
          <div class="absolute inset-0 bg-gradient-to-r from-cyan-400/40 via-blue-500/40 to-purple-600/40 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-150"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-500/30 rounded-full blur-sm opacity-0 group-hover:opacity-100 animate-ping"></div>
          <i class="fas ${icon} ${
            isActive ? "animate-pulse-glow" : "group-hover:animate-float-nav"
          } text-xs relative z-10 transform group-hover:scale-110 transition-all duration-300 text-gradient"></i>
        </div>

        <span class="relative font-bold overflow-hidden">
          <span class="block transform group-hover:translate-y-[-2px] transition-transform duration-300">
            ${link.name}
          </span>
          <div class="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
        </span>
      </span>

      <div class="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
      </div>

      ${
        isActive
          ? `
        <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-purple-600/10 animate-pulse-slow"></div>
      `
          : ""
      }
    </a>
  `;
}

async function loadNavbar() {
  try {
    // Show skeleton loader and temporary links immediately while API call is in progress
    showLoadingState();

    // Then make the API call
    const session = await getUserSession();
    const { loggedIn: LoggedIn, user } = session || {};
    const userType = user?.userType || null;

    let links = [];

    if (!LoggedIn) {
      links = [
        { name: "Home", href: "/home" },
        { name: "About", href: "/about" },
        { name: "Packages", href: "/packageDetails" },
        { name: "Cars", href: "/carDetails" },
        { name: "Contact", href: "contact" },
        { name: "Sign In", href: "/login" },
      ];
    } else if (LoggedIn && userType === "guest") {
      links = [
        { name: "Home", href: "/home" },
        { name: "About", href: "/about" },
        { name: "Packages", href: "/packageDetails" },
        { name: "Cars", href: "/carDetails" },
        { name: "Book Package", href: "/packageBook" },
        { name: "Book Car", href: "/carBook" },
        { name: "History", href: "/history" },
        { name: "Contact", href: "contact" },
        { name: "Sign Out", href: "/login?logoutRequest=true" },
      ];
    } else if (LoggedIn && userType === "host") {
      links = [
        { name: "Home", href: "/home" },
        { name: "Packages", href: "/packageDetails" },
        { name: "Cars", href: "/carDetails" },
        { name: "Admin Cars", href: "/CarAdd" },
        { name: "Admin Packages", href: "/PackageAdd" },
        { name: "Bookings", href: "/userHistory" },
        { name: "Users", href: "/typeChange" },
        { name: "Sign Out", href: "/login?logoutRequest=true" },
      ];
    }

    const current = window.location.pathname.split("/home").pop() || "/home";

    // Render the final navbar with loaded data
    renderNavbar(links, current);
  } catch (error) {
    console.error("Error loading navbar:", error);
    // Show temporary links on error
    renderNavbar(
      TEMPORARY_LINKS,
      window.location.pathname.split("/home").pop() || "/home",
    );
  }
}

function renderNavbar(links, current) {
  const navHTML = `
      <div class="w-full bg-gradient-to-r from-white/95 via-gray-50/95 to-white/95 text-black backdrop-blur-2xl supports-[backdrop-filter]:bg-opacity-95 animate-nav-slide-down shadow-2xl shadow-black/20 border-b border-gradient relative overflow-hidden">
        <!-- Advanced animated background -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <!-- Flowing gradient waves -->
          <div class="absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-blue-500/5 to-purple-600/5 animate-gradient-x"></div>

          <!-- Floating orbs with complex animations -->
          <div class="floating-orb orb-1"></div>
          <div class="floating-orb orb-2"></div>
          <div class="floating-orb orb-3"></div>
          <div class="floating-orb orb-4"></div>

          <!-- Animated mesh gradient -->
          <div class="absolute inset-0 opacity-30">
            <div class="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-300/20 to-transparent rounded-full blur-3xl animate-float-slow"></div>
            <div class="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-300/20 to-transparent rounded-full blur-3xl animate-float-reverse"></div>
            <div class="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-tr from-blue-300/20 to-transparent rounded-full blur-3xl animate-float-slow animation-delay-1000"></div>
          </div>

          <!-- Particle grid -->
          <div class="absolute inset-0 bg-dots-pattern opacity-20 animate-pulse-slow"></div>

          <!-- Scanning line effect -->
          <div class="scanning-line"></div>
        </div>

        <div class="relative flex items-center justify-between h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Ultra-enhanced Logo -->
          <div class="flex-shrink-0">
            <a href="/home" class="logo-container group flex items-center gap-4 hover:opacity-95 transition-all duration-500">
              <div class="relative">
                <!-- Multiple glow layers -->
                <div class="absolute inset-0 bg-gradient-to-r from-cyan-400/40 via-blue-500/40 to-purple-600/40 rounded-full blur-2xl transform group-hover:scale-150 transition-all duration-700 animate-pulse-glow"></div>
                <div class="absolute inset-0 bg-white/40 rounded-full blur-lg transform group-hover:scale-125 transition-all duration-500"></div>
                <div class="absolute inset-0 bg-gradient-to-r from-cyan-300/30 to-purple-300/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                <!-- Logo image with advanced effects -->
                <div class="relative">
                  <img
                    src="./assets/images/logo.png"
                    alt="Kashika"
                    class="relative h-12 w-12 rounded-full object-cover ring-2 ring-white/70 shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 z-10"
                  />
                  <!-- Rotating ring -->
                  <div class="absolute inset-0 rounded-full border-2 border-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 animate-spin-slow transition-opacity duration-500"></div>
                </div>
              </div>

              <!-- Enhanced text with advanced animations -->
              <div class="hidden md:block">
                <div class="relative overflow-hidden">
                  <div class="relative">
                    <span class="block text-black font-black text-2xl tracking-wider animate-fade-in bg-gradient-to-r from-gray-800 via-black to-gray-800 bg-clip-text">
                      <span class="inline-block transform group-hover:scale-110 group-hover:rotate-1 transition-all duration-300">K</span>
                      <span class="inline-block transform group-hover:scale-110 transition-all duration-300 animation-delay-100">a</span>
                      <span class="inline-block transform group-hover:scale-110 group-hover:rotate-1 transition-all duration-300 animation-delay-200">s</span>
                      <span class="inline-block transform group-hover:scale-110 transition-all duration-300 animation-delay-300">h</span>
                      <span class="inline-block transform group-hover:scale-110 group-hover:rotate-1 transition-all duration-300 animation-delay-400">i</span>


                    </span>
                    <!-- Animated gradient underline -->
                    <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                  </div>
                  <span class="block text-gray-700 text-xs font-bold tracking-widest animate-fade-in animation-delay-300 transform group-hover:translate-x-1 transition-transform duration-300">
                    Route
                  </span>
                </div>
              </div>
            </a>
          </div>

          <!-- Ultra-enhanced Desktop Navigation -->
          <div class="hidden md:flex md:items-center">
            <div class="nav-container relative bg-white/80 backdrop-blur-2xl rounded-3xl p-3 shadow-2xl border border-white/50 overflow-hidden">
              <!-- Navigation background effects -->
              <div class="absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-blue-500/5 to-purple-600/5 animate-gradient-x"></div>
              <div class="absolute inset-0 bg-white/20 blur-sm"></div>

              <div class="relative flex items-center gap-2">
                ${links
                  .map((l) => buildLinkHtml(l, l.href.endsWith(current)))
                  .join("")}
              </div>

              <!-- Floating highlight -->
              <div class="nav-highlight absolute inset-0 pointer-events-none"></div>
            </div>
          </div>

          <!-- SIMPLIFIED Mobile menu button -->
          <div class="flex md:hidden">
            <button
              id="mobileMenuBtn"
              aria-label="Toggle menu"
              class="mobile-menu-btn relative p-3 rounded-xl text-black transition-all duration-300 hover:scale-110 focus:outline-none group bg-white/90 hover:bg-white border border-white/50 shadow-lg backdrop-blur-xl"
            >
              <!-- Enhanced hamburger icon -->
              <div class="relative z-10">
                <svg class="h-6 w-6 transform transition-all duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    class="origin-center transform transition-all duration-300"
                    id="menuIcon"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- CORRECTED MOBILE MENU -->
      <div id="mobile-menu" class="mobile-menu-container md:hidden">
        <div class="px-4 py-3 space-y-2 bg-gradient-to-b from-white/98 via-gray-50/98 to-white/98 backdrop-blur-xl border-t border-white/50 shadow-xl">
          ${links
            .map((l, i) => {
              const icon =
                {
                  Home: "fa-home",
                  About: "fa-info-circle",
                  Packages: "fa-box-open",
                  Cars: "fa-car",
                  Contact: "fa-envelope",
                  "Sign In": "fa-sign-in-alt",
                  "Sign Out": "fa-sign-out-alt",
                  "Book Package": "fa-shopping-cart",
                  "Book Car": "fa-car-side",
                  History: "fa-history",
                  "Admin Cars": "fa-car-alt",
                  "Admin Packages": "fa-boxes",
                  Bookings: "fa-calendar-check",
                  Users: "fa-users",
                }[l.name] || "fa-link";

              return `
              <a href="${l.href}"
                class="mobile-nav-item group flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-black ${
                  l.href.endsWith(current)
                    ? "bg-gradient-to-r from-cyan-50 to-purple-50 border-2 border-cyan-200/50"
                    : "bg-white/80 hover:bg-white"
                } transition-all duration-300 border hover:border-cyan-200/30 hover:shadow-lg backdrop-blur-sm transform hover:scale-105"
                style="animation-delay: ${i * 0.1}s;">

                <!-- Icon container -->
                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-cyan-100 group-hover:to-purple-100 transition-all duration-300 shadow-sm group-hover:shadow-md transform group-hover:scale-110">
                  <i class="fas ${icon} text-gray-600 group-hover:text-cyan-600 transition-colors duration-300"></i>
                </div>

                <!-- Text -->
                <span class="font-bold text-base flex-1 transform group-hover:translate-x-1 transition-transform duration-300">
                  ${l.name}
                </span>

                <!-- Arrow -->
                <div class="opacity-60 transform scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                  <i class="fas fa-chevron-right text-gray-400 group-hover:text-cyan-500 text-sm"></i>
                </div>
              </a>
            `;
            })
            .join("")}
        </div>
      </div>

      <style>
        /* CORRECTED Mobile Menu Styles */
        .mobile-menu-container {
          display: none;
          position: relative;
          width: 100%;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out;
        }

        .mobile-menu-container.show {
          display: block;
          max-height: calc(100vh - 5rem);
          overflow-y: auto;
        }

        /* Enhanced Active Gradient */
        .active-gradient {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(134, 239, 255, 0.4) 15%,
            rgba(255, 255, 255, 0.98) 30%,
            rgba(168, 162, 255, 0.4) 45%,
            rgba(255, 255, 255, 0.98) 60%,
            rgba(255, 182, 255, 0.4) 75%,
            rgba(255, 255, 255, 0.98) 100%
          );
          background-size: 400% 400%;
          animation: gradient-shift-enhanced 6s ease infinite;
          position: relative;
        }

        .nav-link:hover::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg,
            rgba(59, 130, 246, 0.2),
            rgba(147, 51, 234, 0.2),
            rgba(236, 72, 153, 0.2)
          );
          background-size: 200% 200%;
          animation: gradient-shift 2s ease infinite;
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .nav-link:hover::before {
          opacity: 1;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg,
            rgba(59, 130, 246, 0.8),
            rgba(236, 72, 153, 0.8)
          );
          transform: translateX(-50%);
          transition: width 0.3s ease;
          border-radius: 2px;
        }

        .nav-link:hover::after {
          width: 80%;
        }

        .nav-link:active {
          transform: scale(0.98);
        }

        .active-gradient::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(45deg, rgba(6, 182, 212, 0.1), rgba(168, 85, 247, 0.1));
          animation: rotate-glow 6s linear infinite;
        }

        /* Advanced Keyframe Animations */
        @keyframes gradient-shift-enhanced {
          0% { background-position: 0% 50%; }
          25% { background-position: 100% 50%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes float-nav {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 25px rgba(236, 72, 153, 0.5); }
        }

        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }

        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(5px) rotate(-1deg); }
          66% { transform: translateY(10px) rotate(1deg); }
        }

        @keyframes float-icon {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(5deg); }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.6;
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 30px rgba(6, 182, 212, 0.6), 0 0 40px rgba(168, 85, 247, 0.3);
          }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes rotate-glow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes nav-slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Enhanced Component Styles */
        .floating-orb {
          position: absolute;
          border-radius: 50%;
          opacity: 0.6;
          animation: float-slow 8s ease-in-out infinite;
        }

        .orb-1 {
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.2), transparent);
          top: -60px;
          left: 10%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.2), transparent);
          top: -40px;
          right: 20%;
          animation-delay: 2s;
        }

        .orb-3 {
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2), transparent);
          bottom: -50px;
          left: 30%;
          animation-delay: 4s;
        }

        .orb-4 {
          width: 60px;
          height: 60px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.2), transparent);
          bottom: -30px;
          right: 40%;
          animation-delay: 6s;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.8), transparent);
          border-radius: 50%;
          animation: float-particle 3s ease-in-out infinite;
        }

        .particle-1 {
          top: 20%;
          left: 20%;
          animation-delay: 0s;
        }

        .particle-2 {
          top: 60%;
          right: 30%;
          animation-delay: 1s;
        }

        .particle-3 {
          bottom: 20%;
          left: 60%;
          animation-delay: 2s;
        }

        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
          50% { transform: translateY(-15px) scale(1.2); opacity: 1; }
        }

        .bg-dots-pattern {
          background-image: radial-gradient(circle, rgba(6, 182, 212, 0.3) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .scanning-line {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.8), transparent);
          animation: scan 4s ease-in-out infinite;
        }

        @keyframes scan {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: -100%; }
        }

        .border-gradient {
          border-image: linear-gradient(90deg, rgba(6, 182, 212, 0.3), rgba(168, 85, 247, 0.3)) 1;
        }

        /* Animation Delays */
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-1000 { animation-delay: 1s; }

        /* Utility Classes */
        .animate-gradient-x { animation: gradient-x 8s ease infinite; }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 6s ease-in-out infinite; }
        .animate-float-nav { animation: float-nav 2s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-nav-slide-down { animation: nav-slide-down 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }

        .text-gradient {
          background: linear-gradient(135deg, #3b82f6, #9333ea, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% 200%;
          animation: gradient-shift 2s ease infinite;
        }

        .nav-link:hover .text-gradient {
          animation: gradient-shift 1s ease infinite;
        }

        .group:hover .text-gradient {
          background-size: 150% 150%;
          animation: gradient-shift 1s ease infinite;
        }

        /* Fade animations */
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-out {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-10px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }

        .animate-fade-in { animation: fade-in 0.6s ease forwards; }

        /* Mobile responsive fixes */
        @media (max-width: 768px) {
          .logo-container span {
            font-size: 1.2rem;
          }

          .floating-orb {
            display: none;
          }

          .mobile-nav-item {
            min-height: 52px;
          }

          /* Ensure mobile menu items are visible */
          .mobile-menu-container {
            background: rgba(255, 255, 255, 0.98);
          }
        }
      </style>
    `;

  navbar.innerHTML = navHTML;

  // SIMPLIFIED mobile toggle with proper visibility control
  const mobileBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuIcon = document.getElementById("menuIcon");

  if (mobileBtn && mobileMenu) {
    let isOpen = false;

    mobileBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      isOpen = !isOpen;

      // Simple hamburger to X animation
      if (isOpen) {
        menuIcon.setAttribute("d", "M6 18L18 6M6 6l12 12");
        mobileMenu.classList.add("show");
        mobileMenu.style.display = "block";
      } else {
        menuIcon.setAttribute("d", "M4 6h16M4 12h16M4 18h16");
        mobileMenu.classList.remove("show");
        setTimeout(() => {
          if (!mobileMenu.classList.contains("show")) {
            mobileMenu.style.display = "none";
          }
        }, 300);
      }
    });

    // Close menu on window resize if open
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768 && isOpen) {
        isOpen = false;
        menuIcon.setAttribute("d", "M4 6h16M4 12h16M4 18h16");
        mobileMenu.classList.remove("show");
        mobileMenu.style.display = "none";
      }
    });

    // Close menu when clicking a link
    const mobileNavItems = mobileMenu.querySelectorAll(".mobile-nav-item");
    mobileNavItems.forEach((item) => {
      item.addEventListener("click", () => {
        isOpen = false;
        menuIcon.setAttribute("d", "M4 6h16M4 12h16M4 18h16");
        mobileMenu.classList.remove("show");
        setTimeout(() => {
          mobileMenu.style.display = "none";
        }, 300);
      });
    });
  }
}
loadNavbar();
