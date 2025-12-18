
      import { getAllPackages, getUserSession } from "../Middleware/services.js";

      async function loadPackages() {
        const userSession = await getUserSession();
        const userType = userSession?.user?.userType || "guest";

        const data = await getAllPackages();
        const container = document.getElementById("packageContainer");

        if (data.error) {
          container.textContent = "Failed to load packages.";
          return;
        }

        if (data.length === 0) {
          container.textContent = "No packages available.";
          return;
        }

        container.innerHTML = data
          .map(
            (pkg) => `
      <div class="card">
        <img src="${pkg.url}" alt="${pkg.packageName}">
        <div class="card-content">
          <h3>${pkg.packageName}</h3>
          <p class="place">${pkg.place}</p>
          <p class="duration"> <i class="fa-solid fa-clock" style="color: #e6de05;"></i> Package Duration  ${
            pkg.packageDuration
          }</p>
          <p>${pkg.description}</p>
          <p class="price">₹${pkg.price}</p>
          ${
            userType === "host"
              ? `<a href="/packageBook?id=${pkg._id}&delete=true" class="action-btn delete-btn"><i class="fas fa-trash"></i> Delete</a>`
              : `<a href="/packageBook?id=${pkg._id}" class="action-btn"><i class="fas fa-calendar-check"></i> Book</a>`
          }
        </div>
      </div>
    `
          )
          .join("");
      }

      loadPackages();
