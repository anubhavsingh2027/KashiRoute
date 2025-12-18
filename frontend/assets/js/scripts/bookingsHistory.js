import { getUsers } from "../Middleware/services.js";

const packageBtn = document.getElementById("packageBtn");
const carBtn = document.getElementById("carBtn");
const bookingList = document.getElementById("bookingList");
const emailSearch = document.getElementById("emailSearch");
const sortFilter = document.getElementById("sortFilter");

let usersData = [];
let currentType = "package";
let sortOrder = "newest";

// === Fetch all users once ===
async function loadUsers() {
  try {
    const data = await getUsers();
    if (data.error) {
      bookingList.innerHTML = `<div class="no-data fade-in"><i class="fas fa-exclamation-triangle text-4xl mb-4"></i><p>Error loading users: ${data.message}</p></div>`;
      return;
    }
    usersData = data.users || data;

    renderBookings("package"); // default view
  } catch (err) {
    bookingList.innerHTML = `<div class="no-data fade-in"><i class="fas fa-exclamation-triangle text-4xl mb-4"></i><p>Error loading users.</p></div>`;
  }
}

// === Filter users by email and type ===
function getFilteredUsers(type, searchEmail) {
  let filtered = usersData.filter((user) =>
    type === "package" ? user.packageBook?.length : user.carBooking?.length
  );

  if (searchEmail.trim()) {
    filtered = filtered.filter((user) =>
      user.email.toLowerCase().includes(searchEmail.toLowerCase())
    );
  }

  return filtered;
}

// === Sort bookings by date ===
function sortBookingsByDate(bookings, order) {
  return [...bookings].sort((a, b) => {
    const dateA = new Date(a.bookingDate);
    const dateB = new Date(b.bookingDate);
    return order === "newest" ? dateB - dateA : dateA - dateB;
  });
}

// === Render bookings based on selected type ===
function renderBookings(type) {
  currentType = type;
  bookingList.innerHTML = "";

  const searchEmail = emailSearch.value;
  const usersWithBookings = getFilteredUsers(type, searchEmail);

  if (usersWithBookings.length === 0) {
    bookingList.innerHTML = `<div class="no-data fade-in">
        <i class="fas fa-inbox text-6xl mb-4 opacity-50"></i>
        <p class="text-xl mb-2">No ${
          type === "package" ? "Package" : "Car Rent"
        } bookings found</p>
        <p class="text-sm opacity-70">Bookings will appear here once customers make reservations</p>
      </div>`;
    return;
  }

  // Add fade-in animation to the container
  bookingList.classList.add("fade-in");

  usersWithBookings.forEach((user, index) => {
    const userBlock = document.createElement("div");
    userBlock.className = "user-block card-hover";
    userBlock.style.animationDelay = `${index * 0.1}s`;

    let bookingsHTML = "";
    let totalBookings = 0;

    if (type === "package") {
      // Sort package bookings by date based on filter
      const sortedPackage = sortBookingsByDate(user.packageBook, sortOrder);
      totalBookings = sortedPackage.length;

      bookingsHTML = sortedPackage
        .map(
          (b) => `
          <div class="booking-item">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <i class="fas fa-box text-blue-600 text-xl mr-3"></i>
                <div>
                  <span class="font-bold text-lg text-gray-800">${
                    b.packageName
                  }</span>
                  <div class="text-sm text-gray-600 mt-1">
                    <i class="far fa-calendar-alt mr-2"></i>
                    Booked: ${new Date(b.bookingDate).toLocaleString()}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <i class="fas fa-check-circle mr-1"></i>
                  Confirmed
                </span>
              </div>
            </div>
          </div>
        `
        )
        .join("");
    } else {
      // Sort car bookings by date based on filter
      const sortedCar = sortBookingsByDate(user.carBooking, sortOrder);
      totalBookings = sortedCar.length;

      bookingsHTML = sortedCar
        .map(
          (b) => `
          <div class="booking-item">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <i class="fas fa-car text-purple-600 text-xl mr-3"></i>
                <div>
                  <span class="font-bold text-lg text-gray-800">${
                    b.carName
                  }</span>
                  <div class="text-sm text-gray-600 mt-1">
                    <i class="far fa-clock mr-2"></i>
                    Duration: ${b.duration} hrs
                    <span class="mx-2">•</span>
                    <i class="far fa-calendar-alt mr-2"></i>
                    Booked: ${new Date(b.bookingDate).toLocaleString()}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  <i class="fas fa-car mr-1"></i>
                  ${b.duration}h Rental
                </span>
              </div>
            </div>
          </div>
        `
        )
        .join("");
    }

    userBlock.innerHTML = `
        <div class="user-header flex items-center justify-between">
          <div class="flex items-center">
            <i class="fas fa-user-circle text-2xl mr-3"></i>
            <div>
              <div class="font-bold text-lg">${user.userName}</div>
              <div class="text-sm opacity-90">
                <i class="fas fa-phone mr-2"></i>${user.phone}
                <span class="mx-3">•</span>
                <i class="fas fa-envelope mr-2"></i>${user.email}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="bg-white/20 px-4 py-2 rounded-lg">
              <div class="text-2xl font-bold">${totalBookings}</div>
              <div class="text-sm opacity-90">Booking${
                totalBookings !== 1 ? "s" : ""
              }</div>
            </div>
          </div>
        </div>
        <div class="space-y-3">
          ${bookingsHTML}
        </div>
      `;

    bookingList.appendChild(userBlock);
  });
}

// === Button Event Listeners ===
packageBtn.addEventListener("click", () => {
  packageBtn.className =
    "btn-primary px-8 py-4 text-white rounded-xl font-semibold text-lg shadow-lg";
  carBtn.className =
    "btn-secondary px-8 py-4 text-white rounded-xl font-semibold text-lg";
  renderBookings("package");
});

carBtn.addEventListener("click", () => {
  carBtn.className =
    "btn-primary px-8 py-4 text-white rounded-xl font-semibold text-lg shadow-lg";
  packageBtn.className =
    "btn-secondary px-8 py-4 text-white rounded-xl font-semibold text-lg";
  renderBookings("car");
});

// === Search Event Listener ===
emailSearch.addEventListener("input", () => {
  renderBookings(currentType);
});

// === Sort Event Listener ===
sortFilter.addEventListener("change", (e) => {
  sortOrder = e.target.value;
  renderBookings(currentType);
});

// === Initialize ===
loadUsers();
