const API_BASE =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_PRODUCTION_URL
    : import.meta.env.VITE_DEV_URL;

const MAIL_API = import.meta.env.VITE_MAIL_API;

export async function getCheck() {
  try {
    const res = await fetch(`${API_BASE}check`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { error: true, status: res.status, ...(data || {}) };
    }

    return data;
  } catch (err) {
    return { error: true, message: "Network Error" };
  }
}

export default getCheck;

async function fetchJson(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: true, message: "Network Error" };
  }
}

// ===== AUTHENTICATION =====
export async function getUserSession() {
  return await fetchJson("session-user");
}

export async function loginUser(loginData) {
  return await fetchJson("login", {
    method: "POST",
    body: JSON.stringify(loginData),
  });
}

export async function registerUser(userData) {
  return await fetchJson("signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function verifySignupOTP(verifyData) {
  return await fetchJson("verify-signup-otp", {
    method: "POST",
    body: JSON.stringify(verifyData),
  });
}

export async function resendOTP(resendData) {
  return await fetchJson("resend-otp", {
    method: "POST",
    body: JSON.stringify(resendData),
  });
}

export async function forgetPassword(forgetData) {
  return await fetchJson("forgetPassword", {
    method: "POST",
    body: JSON.stringify(forgetData),
  });
}

export async function verifyForgotOTP(verifyData) {
  return await fetchJson("verify-forgot-otp", {
    method: "POST",
    body: JSON.stringify(verifyData),
  });
}

export async function logoutUser() {
  return await fetchJson("logout", { method: "POST" });
}

// ===== CARS & PACKAGES =====
export async function getAllCars() {
  const data = await fetchJson("getCar");
  return data.cars || data;
}

export async function getAllPackages() {
  const data = await fetchJson("getPackage");
  return data.packages || data;
}

// ===== BOOKINGS =====
export async function bookingCar(bookingData) {
  if (!bookingData?.userId) {
    return { error: true, message: "Missing user id" };
  }
  return await fetchJson(`carbooking/${bookingData.userId}`, {
    method: "POST",
    body: JSON.stringify(bookingData),
  });
}

export async function bookPackage(bookingData) {
  if (!bookingData?.userId) {
    return { error: true, message: "Missing user id" };
  }
  return await fetchJson(`bookPackage/${bookingData.userId}`, {
    method: "POST",
    body: JSON.stringify(bookingData),
  });
}

export async function getUserHistory(userId) {
  return await fetchJson(`userHistory/${userId}`);
}

// Get specific booking types for a user
export async function getUserCarBookings(userId) {
  return await fetchJson(`carBookings/${userId}`);
}

export async function getUserPackageBookings(userId) {
  return await fetchJson(`packageBookings/${userId}`);
}

// Get individual bookings
export async function getCarBookingById(bookingId) {
  return await fetchJson(`carBooking/${bookingId}`);
}

export async function getPackageBookingById(bookingId) {
  return await fetchJson(`packageBooking/${bookingId}`);
}

// Update bookings
export async function updateCarBooking(bookingId, updateData) {
  return await fetchJson(`carBooking/${bookingId}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
}

export async function updatePackageBooking(bookingId, updateData) {
  return await fetchJson(`packageBooking/${bookingId}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
}

// Cancel bookings
export async function cancelCarBooking(bookingId) {
  return await fetchJson(`carBooking/${bookingId}`, {
    method: "DELETE",
  });
}

export async function cancelPackageBooking(bookingId) {
  return await fetchJson(`packageBooking/${bookingId}`, {
    method: "DELETE",
  });
}

// ===== ADMIN FUNCTIONS =====
export async function getAllUsers() {
  return await fetchJson("getUser");
}

export async function createCar(carData) {
  return await fetchJson("admin/addCar", {
    method: "POST",
    body: JSON.stringify(carData),
  });
}

export async function createPackage(packageData) {
  return await fetchJson("admin/createPackage", {
    method: "POST",
    body: JSON.stringify(packageData),
  });
}

export async function deleteCar(carId) {
  return await fetchJson(`admin/carDelete/${carId}`, { method: "DELETE" });
}

export async function deletePackage(packageId) {
  return await fetchJson(`admin/packageDelete/${packageId}`, {
    method: "DELETE",
  });
}

export async function changeUserType(typeData) {
  return await fetchJson("changeUserType", {
    method: "PUT",
    body: JSON.stringify(typeData),
  });
}

export async function getAdminHistory() {
  return await fetchJson("admin/history", { method: "GET" });
}

// ===== EMAIL & PAYMENT =====
export async function sendEmail(emailData) {
  const payload = {
    to: emailData.to,
    subject: emailData.subject,
    websiteName: "Kashi Route",
    message: emailData.message,
  };
  return fetch(MAIL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((r) => r.json())
    .catch(() => ({ error: true, message: "Network Error" }));
}

// ===== CONTACT FORM =====
export async function submitContact(contactData) {
  return await fetchJson("contact", {
    method: "POST",
    body: JSON.stringify(contactData),
  });
}

export async function getContactInfo() {
  return await fetchJson("contact/info", {
    method: "GET",
  });
}

export async function createOrder(orderData) {
  return await fetchJson("payment/create-order", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

export async function verifyPayment(verifyData) {
  return await fetchJson("payment/verify-payment", {
    method: "POST",
    body: JSON.stringify(verifyData),
  });
}

export async function getRazorpayKey() {
  return await fetchJson("payment/razorpay-key");
}

// ===== CHATBOT =====
export async function sendChatbotMessage(question) {
  return await fetchJson("chatbot", {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}

export async function getChatHistory() {
  return await fetchJson("chatbot/history");
}

export async function getSessionChat(sessionId) {
  if (!sessionId) {
    return { error: true, message: "Missing sessionId" };
  }
  // encode sessionId to avoid issues with special characters
  const encoded = encodeURIComponent(sessionId);
  return await fetchJson(`chatbot/session/${encoded}`);
}

export async function clearChatHistory() {
  return await fetchJson("chatbot/clear", { method: "DELETE" });
}
