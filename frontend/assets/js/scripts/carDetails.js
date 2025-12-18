
      import { getAllCars, getUserSession } from "../Middleware/services.js";
      async function loadCars() {
        const userSession = await getUserSession();
        const userType = userSession?.user?.userType || "guest";

        const data = await getAllCars();
        const container = document.getElementById("carContainer");

        if (data.error) {
          container.textContent = "Failed to load cars.";
          return;
        }

        if (data.length === 0) {
          container.textContent = "No cars available.";
          return;
        }

        container.innerHTML = data
          .map(
            (car) => `
        <div class="card">
          <div style="position: relative;">
            <img src="${car.url}" alt="${car.carName}">
            <div class="eco-badge">
              <i class="fas fa-leaf"></i> Eco
            </div>
          </div>
          <div class="card-content">
            <h3>${car.carName}<div class="wheel-indicator"></div></h3>
            <div class="car-stats">
              <div class="stat-item">
                <div class="stat-icon"><i class="fas fa-gas-pump"></i></div>
                <div class="stat-value">Efficient</div>
                <div>Fuel</div>
              </div>
              <div class="stat-item">
                <div class="stat-icon"><i class="fas fa-users"></i></div>
                <div class="stat-value"> ${car.totalSeats}</div>
                <div>Seats</div>
              </div>
              <div class="stat-item">
                <div class="stat-icon"><i class="fas fa-shield-alt"></i></div>
                <div class="stat-value">Safe</div>
                <div>Rating</div>
              </div>
            </div>
            <p>${car.description}</p>
            <p class="price">₹${car.price}</p>
            ${
              userType === "host"
                ? `<a href="/carBook?id=${car._id}&delete=true" class="action-btn delete-btn"><i class="fas fa-trash"></i> Delete</a>`
                : `<a href="/carBook?id=${car._id}" class="action-btn"><i class="fas fa-key"></i> Book</a>`
            }
          </div>
        </div>
      `
          )
          .join("");
      }

      loadCars();
