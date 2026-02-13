 import { getUserSession } from "../Middleware/services.js";

async function checkAccess() {
  try {
    const data = await getUserSession();
    if (!data?.user || data.user.userType !== "host") {
      // Redirect only if access is denied
      window.location.href = "/unauthorsisedAccess";
    }
    // If authorized, stay on the page
  } catch (error) {
    // Redirect only on error
    window.location.href = "/unauthorsisedAccess";
  } finally {
    // Hide loading indicator after check completes
    const loader = document.getElementById("access-loader");
    if (loader) {
      loader.style.display = "none";
    }
  }
}

// Show loading state and check access
document.addEventListener("DOMContentLoaded", () => {
  // Show loader while checking
  const loader = document.getElementById("access-loader");
  if (loader) {
    loader.style.display = "flex";
  }
  checkAccess();
});