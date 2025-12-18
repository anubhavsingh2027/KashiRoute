 import { getUserSession } from "../Middleware/services.js";

  async function checkAccess() {
    try {
      const data = await getUserSession();
      if (!data?.user || data.user.userType !== "host") {
        window.location.href = "/unauthorsisedAccess";
      }
    } catch (error) {
      window.location.href = "/unauthorsisedAccess"; // fallback redirect
    }
  }
  document.addEventListener("DOMContentLoaded", checkAccess);