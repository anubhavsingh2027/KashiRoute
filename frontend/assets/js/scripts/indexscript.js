// Keep your exact original script
import {
  mountUtilities,
  initScrollReveal,
} from "../Middleware/tailwind-init.js";
import {
  getAllPackages,
  getUserSession,
  getAllCars,
} from "../Middleware/services.js";
import { openModal, initTestimonials } from "../Middleware/ui-components.js";

// Keep your EXACT original packageCard function - only enhance styling
function packageCard(pkg) {
  return `
      <article class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group hover:-translate-y-1 enhanced-card">
        <div class="relative overflow-hidden aspect-[4/3]">
          <img src="${pkg.url}" alt="${pkg.packageName}" class="w-full h-full object-cover transform transition duration-700 group-hover:scale-110" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div class="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium">
            <i class="fas fa-fire text-amber-400"></i> Popular
          </div>
          <div class="absolute bottom-4 left-4 right-4">
            <h3 class="text-xl font-bold text-white mb-2">${pkg.packageName}</h3>
            <p class="text-white/90 flex items-center gap-2 text-sm">
              <i class="fas fa-map-marker-alt text-rose-400"></i> ${pkg.place}
            </p>
          </div>
        </div>
        <div class="p-6">
          <div class="flex items-center gap-4 mb-4">
            <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-sm">
                <i class="fas fa-clock"></i> ${pkg.packageDuration} Days
            </span>
            <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-sm">
              <i class="fas fa-user-group"></i> Group Tour
            </span>
          </div>
          <p class="text-slate-600 text-sm line-clamp-2 mb-4">${pkg.description}</p>
          <div class="flex items-center justify-between pt-4 border-t">
            <div>
              <p class="text-sm text-slate-500 mb-1">Starting from</p>
              <div class="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">₹${pkg.price}</div>
            </div>
            <div class="flex items-center gap-2">
              <button
                data-id="${pkg._id}"
                data-type="package"
                class="previewBtn p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors group"
              >
                <i class="fas fa-eye"></i>
              </button>
              <a
                href="/packageBook?id=${pkg._id}"
                class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-sky-100 transition-all duration-300"
              >
                Book Now
                <i class="fas fa-arrow-right text-sm transition-transform group-hover:translate-x-1"></i>
              </a>
            </div>
          </div>
        </div>
      </article>
    `;
}

// Keep your EXACT original carCard function - only enhance styling
function carCard(car) {
  return `
      <article class="bg-gradient-to-br from-white to-slate-50/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group hover:-translate-y-1 enhanced-card">
        <div class="relative overflow-hidden aspect-[5/3]">
          <img src="${car.url}" alt="${car.carName}" class="w-full h-full object-cover transform transition duration-700 group-hover:scale-110" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="absolute top-4 right-4 px-3 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-full text-white text-sm font-medium">
            <i class="fas fa-check"></i> Available Now
          </div>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-sky-600 transition-colors">${car.carName}</h3>
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="flex items-center gap-2 bg-sky-50 rounded-lg p-2">
              <i class="fas fa-snowflake text-sky-500"></i>
              <span class="text-sm text-slate-600">AC Vehicle</span>
            </div>
            <div class="flex items-center gap-2 bg-indigo-50 rounded-lg p-2">
              <i class="fas fa-user-group text-indigo-500"></i>
                 <span class="text-sm text-slate-600">${car.totalSeats} Seats</span>
            </div>
            <div class="flex items-center gap-2 bg-emerald-50 rounded-lg p-2">
              <i class="fas fa-route text-emerald-500"></i>
              <span class="text-sm text-slate-600">City Tours</span>
            </div>
            <div class="flex items-center gap-2 bg-amber-50 rounded-lg p-2">
              <i class="fas fa-shield-check text-amber-500"></i>
              <span class="text-sm text-slate-600">Verified</span>
            </div>
          </div>
          <p class="text-slate-600 text-sm line-clamp-2 mb-4">${car.description}</p>
          <div class="flex items-center justify-between pt-4 border-t">
            <div>
              <p class="text-sm text-slate-500">Per Day Rate</p>
              <div class="flex items-baseline gap-1">
                <span class="text-2xl font-bold text-slate-800">₹${car.price}</span>
                <span class="text-sm text-slate-500">/day</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                data-id="${car._id}"
                data-type="car"
                class="previewBtn p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
              >
                <i class="fas fa-info"></i>
              </button>
              <a
                href="/carBook?id=${car._id}"
                class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-sky-100 transition-all duration-300"
              >
                Book Now
                <i class="fas fa-arrow-right transition-transform group-hover:translate-x-1"></i>
              </a>
            </div>
          </div>
        </div>
      </article>
    `;
}

// Skeleton templates
function packageSkeletonCard() {
  return `
          <article class="bg-white rounded-2xl shadow-lg overflow-hidden skeleton-card">
            <div class="relative aspect-[4/3] skeleton"></div>
            <div class="p-6 space-y-4">
              <div class="flex gap-4">
                <div class="h-8 w-24 rounded-full skeleton"></div>
                <div class="h-8 w-24 rounded-full skeleton"></div>
              </div>
              <div class="space-y-2">
                <div class="h-4 w-3/4 rounded skeleton"></div>
                <div class="h-4 w-1/2 rounded skeleton"></div>
              </div>
              <div class="flex items-center justify-between pt-4 border-t">
                <div class="h-10 w-24 rounded skeleton"></div>
                <div class="h-10 w-32 rounded-full skeleton"></div>
              </div>
            </div>
          </article>
        `;
}

function carSkeletonCard() {
  return `
          <article class="bg-white rounded-2xl shadow-lg overflow-hidden skeleton-card">
            <div class="relative aspect-[5/3] skeleton"></div>
            <div class="p-6 space-y-4">
              <div class="h-6 w-3/4 rounded skeleton"></div>
              <div class="grid grid-cols-2 gap-3">
                ${Array(4)
                  .fill('<div class="h-10 rounded-lg skeleton"></div>')
                  .join("")}
              </div>
              <div class="space-y-2">
                <div class="h-4 w-full rounded skeleton"></div>
                <div class="h-4 w-2/3 rounded skeleton"></div>
              </div>
              <div class="flex items-center justify-between pt-4 border-t">
                <div class="h-10 w-24 rounded skeleton"></div>
                <div class="h-10 w-32 rounded-full skeleton"></div>
              </div>
            </div>
          </article>
        `;
}

// Keep ALL your original functions exactly the same
async function loadPackages() {
  const packageContainer = document.getElementById("packageContainer");
  if (!packageContainer) return;

  // Show skeleton loading
  packageContainer.innerHTML = Array(6).fill(packageSkeletonCard()).join("");

  if (!carContainer) return;

  // Show skeleton loading
  carContainer.innerHTML = Array(6).fill(carSkeletonCard()).join("");

  const userSession = await getUserSession();
  const userType = userSession?.user?.userType || "guest";

  const data = await getAllPackages();

  if (data.error) {
    packageContainer.textContent = "Failed to load packages.";
    return;
  }
  if (data.length === 0) {
    packageContainer.textContent = "No packages available.";
    return;
  }

  packageContainer.innerHTML = data.map((pkg) => packageCard(pkg)).join("");

  // attach preview listeners
  document.querySelectorAll(".previewBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = btn.dataset.id;
      const type = btn.dataset.type;
      const item = data.find((d) => d._id === id);
      if (item) {
        openModal(item, type);
      }
    });
  });
}

async function loadCars() {
  const carContainer = document.getElementById("carContainer");
  if (!carContainer) return;

  // Show skeleton loading
  carContainer.innerHTML = Array(6).fill(carSkeletonCard()).join("");

  const userSession = await getUserSession();
  const userType = userSession?.user?.userType || "guest";

  const data = await getAllCars();
  const container = document.getElementById("carContainer");

  if (!container) return;
  if (data.error) {
    container.textContent = "Failed to load cars.";
    return;
  }
  if (data.length === 0) {
    container.textContent = "No cars available.";
    return;
  }

  container.innerHTML = data.map((car) => carCard(car)).join("");

  document.querySelectorAll(".previewBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = btn.dataset.id;
      const type = btn.dataset.type;
      const item = data.find((d) => d._id === id);
      if (item) {
        openModal(item, type);
      }
    });
  });
}

// Simple scroll animation
function initScrollAnimations() {
  const elements = document.querySelectorAll(".fade-in");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  elements.forEach((el) => observer.observe(el));
}

// Enhanced Testimonials Functionality
const testimonials = [
  {
    content:
      "Our spiritual journey through Varanasi was absolutely transformative. The attention to detail and deep knowledge of our guide made every moment special. From the morning boat rides to evening aartis, everything was perfectly organized.",
    author: "Rajesh Sharma",
    location: "Delhi, India",
    avatar: "https://i.pravatar.cc/150?img=11",
    rating: 5,
  },
  {
    content:
      "The car service was immaculate and our driver was extremely professional. He knew all the shortcuts and best timings to visit temples, which made our pilgrimage so much smoother. Highly recommended!",
    author: "Sarah Williams",
    location: "London, UK",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 5,
  },
  {
    content:
      "What an incredible experience! The team went above and beyond to ensure we had the most authentic and comfortable stay in Varanasi. The cultural insights and local connections made all the difference.",
    author: "Priya Patel",
    location: "Mumbai, India",
    avatar: "https://i.pravatar.cc/150?img=9",
    rating: 5,
  },
];

function initEnhancedTestimonials() {
  const carousel = document.getElementById("testimonialCarousel");
  const content = carousel.querySelector(".testimonial-content");
  const prevBtn = document.getElementById("prevTestimonial");
  const nextBtn = document.getElementById("nextTestimonial");
  let currentIndex = 0;

  // Create indicators
  const indicators = document.createElement("div");
  indicators.className = "flex items-center justify-center gap-2 mt-8";
  testimonials.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = `testimonial-indicator ${index === 0 ? "active" : ""}`;
    dot.addEventListener("click", () => goToSlide(index));
    indicators.appendChild(dot);
  });
  carousel.appendChild(indicators);

  function updateTestimonial(index) {
    const testimonial = testimonials[index];
    content.innerHTML = `
            <div class="testimonial-slide ${
              index === currentIndex ? "active" : ""
            }">
              <blockquote class="text-xl md:text-2xl text-slate-700 leading-relaxed mb-8">
                "${testimonial.content}"
              </blockquote>
              <div class="flex items-center gap-4">
                <img src="${testimonial.avatar}" alt="${
      testimonial.author
    }" class="w-14 h-14 rounded-full object-cover border-2 border-indigo-100"/>
                <div>
                  <div class="font-semibold text-slate-800">${
                    testimonial.author
                  }</div>
                  <div class="text-slate-500 text-sm">${
                    testimonial.location
                  }</div>
                </div>
              </div>
            </div>
          `;

    // Update indicators
    const dots = indicators.getElementsByClassName("testimonial-indicator");
    Array.from(dots).forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  }

  function goToSlide(index) {
    currentIndex = index;
    updateTestimonial(currentIndex);
  }

  prevBtn.addEventListener("click", () => {
    currentIndex =
      (currentIndex - 1 + testimonials.length) % testimonials.length;
    updateTestimonial(currentIndex);
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % testimonials.length;
    updateTestimonial(currentIndex);
  });

  // Auto-advance slides
  let autoplayInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % testimonials.length;
    updateTestimonial(currentIndex);
  }, 5000);

  // Pause autoplay on hover
  carousel.addEventListener("mouseenter", () =>
    clearInterval(autoplayInterval)
  );
  carousel.addEventListener("mouseleave", () => {
    autoplayInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % testimonials.length;
      updateTestimonial(currentIndex);
    }, 5000);
  });

  updateTestimonial(0);
}

// Initialize everything
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await mountUtilities();
    initScrollReveal();
    initScrollAnimations();
    initEnhancedTestimonials();

    await loadPackages();
    await loadCars();
  } catch (error) {}
});
