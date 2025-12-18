
      import { getUserSession, userHistory } from "../Middleware/services.js";

      async function loadUserData() {
        const data = await getUserSession();

        const loggedDiv = document.querySelector(".loggin");
        const notLoggedDiv = document.querySelector(".notloggin");

        if (data.loggedIn) {
          loggedDiv.style.display = "block";
          notLoggedDiv.style.display = "none";

          // Personalize
          document.getElementById("username").textContent = data.user.userName;
          const history = await userHistory(data.user._id);
          renderHistoryCar(history.carHistory);
          renderHistoryPackage(history.packageHistory);
        } else {
          loggedDiv.style.display = "none";
          notLoggedDiv.style.display = "block";
        }
      }

      function renderHistoryCar(user) {
        const carDiv = document.getElementById("carHistory");

        if (user.length) {
          carDiv.innerHTML = user
            .map(
              (b) => `
            <div class="booking-item">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <span class="text-2xl mr-3">🚗</span>
                  <div>
                    <div class="font-semibold text-gray-800">${b.carName}</div>
                    <div class="text-sm text-gray-500">Booking Date</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-medium text-indigo-600">${new Date(
                    b.date
                  ).toLocaleDateString()}</div>
                  <div class="text-sm text-gray-400">Confirmed</div>
                </div>
              </div>
            </div>
          `
            )
            .join("");
        } else {
          carDiv.innerHTML = '<div class="empty-state">Did Not Book Car</div>';
        }
      }

      function renderHistoryPackage(user) {
        const pkgDiv = document.getElementById("packageHistory");

        if (user.length) {
          pkgDiv.innerHTML = user
            .map(
              (p) => `
            <div class="booking-item">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <span class="text-2xl mr-3">🧳</span>
                  <div>
                    <div class="font-semibold text-gray-800">${
                      p.packageName
                    }</div>
                    <div class="text-sm text-gray-500">Package Booking</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-medium text-indigo-600">${new Date(
                    p.bookingDate
                  ).toLocaleDateString()}</div>
                  <div class="text-sm text-gray-400">Confirmed</div>
                </div>
              </div>
            </div>
          `
            )
            .join("");
        } else {
          pkgDiv.innerHTML =
            '<div class="empty-state">Did Not Book Package</div>';
        }
      }
      loadUserData();
