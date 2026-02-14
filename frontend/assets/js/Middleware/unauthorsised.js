import { getUserSession } from "../Middleware/services.js";

function createLoader() {
  if (!document.getElementById("access-loader")) {
    const loader = document.createElement("div");
    loader.id = "access-loader";
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;
    loader.innerHTML = `
      <div style="text-align: center;">
        <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        <p style="margin-top: 20px; color: #333;">Verifying access...</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(loader);
  }
}

async function checkAccess() {
  try {
    const data = await getUserSession();
    if (!data?.user || data.user.userType !== "host") {
      window.location.href = "/unauthorsisedAccess";
      return;
    }
  } catch (error) {
    window.location.href = "/unauthorsisedAccess";
    return;
  } finally {
    const loader = document.getElementById("access-loader");
    if (loader) {
      loader.style.display = "none";
    }
  }
}
document.addEventListener("DOMContentLoaded", () => {
  createLoader();
  const loader = document.getElementById("access-loader");
  if (loader) {
    loader.style.display = "flex";
  }
  checkAccess();
});
