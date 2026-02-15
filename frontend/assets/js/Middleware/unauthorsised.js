import { getUserSession } from "../Middleware/services.js";

/**
 * Removes the access verification loader
 * Called only after access is verified
 */
function removeLoader() {
  const loader = document.getElementById("access-loader");
  if (loader) {
    loader.style.opacity = "0";
    loader.style.transition = "opacity 0.3s ease";
    setTimeout(() => {
      if (loader && loader.parentElement) {
        loader.remove();
      }
    }, 300);
  }
}

/**
 * Verifies user access on page load
 * This is a secondary check - primary check is done inline in HTML head
 * Useful for dynamic content verification
 */
export async function verifyAccessOnPageLoad() {
  try {
    const data = await getUserSession();

    if (!data?.user) {
      window.location.href = "/unauthorsisedAccess";
      return false;
    }

    // Access verified - remove loader
    removeLoader();
    return true;
  } catch (error) {
    console.error("Access verification failed:", error);
    window.location.href = "/unauthorsisedAccess";
    return false;
  }
}

/**
 * Optional: Call this if you need to verify access at specific points
 * For pages that have already passed the initial HTML head check
 */
export async function checkAdditionalAccess() {
  try {
    const data = await getUserSession();
    if (!data?.user) {
      window.location.href = "/unauthorsisedAccess";
      return false;
    }
    return true;
  } catch (error) {
    console.error("Additional access check failed:", error);
    window.location.href = "/unauthorsisedAccess";
    return false;
  }
}
