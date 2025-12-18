
      import {getAllCars,getUserSession,bookingCar,deleteCar,} from "../Middleware/services.js";
      import { showToast, withLoader } from "../Middleware/tailwind-init.js";
      import { SendMailCar } from "../Middleware/mailSendBook.js";

      const carSelect = document.getElementById("carName");
      const priceInput = document.getElementById("price");
      const durationInput = document.getElementById("duration");
      const message = document.getElementById("message");
      const form = document.getElementById("bookForm");
      const submitBtn = form.querySelector("button");
      const carPreview = document.getElementById("carPreview");
      const previewImg = carPreview.querySelector("img");
      const previewCarName = document.getElementById("previewCarName");
      const previewPrice = document.getElementById("previewPrice");
      const totalPrice = document.getElementById("totalPrice");

      // Format price with commas for display
      function formatPrice(price) {
        return new Intl.NumberFormat("en-IN").format(price);
      }

      // Remove formatting to get raw number
      function unformatPrice(price) {
        return Number(price.toString().replace(/[^0-9.-]+/g, ""));
      }

      // === Extract Car ID and Delete Flag from URL ===
      function getCarParams() {
        const params = new URLSearchParams(window.location.search);
        return {
          id: params.get("id"),
          isDelete: params.get("delete") === "true",
        };
      }

      const { id: carId, isDelete } = getCarParams();

      // === MAIN LOGIC ===
      (async function init() {
        // Handle Delete Mode
        if (isDelete && carId) {
          try {
            const data = await deleteCar(carId);
            if (data.success) {
              window.location.href = "/carDetails";
            }
          } catch (err) {}
          return;
        }

        // === Populate Car Dropdown ===
        async function setupCars() {
          const data = await getAllCars();
          if (!data || data.error) {
            message.textContent = "Failed to load cars.";
            message.style.color = "red";
            return;
          }

          const cars = data.cars || data;

          // Add default option
          const defaultOption = document.createElement("option");
          defaultOption.value = "";
          defaultOption.textContent = "Select a car";
          carSelect.appendChild(defaultOption);

          if (carId) {
            // Prefill selected car
            const selected = cars.find((c) => c._id === carId);
            if (!selected) {
              showToast("Car not found", "error");
              return;
            }

            const option = document.createElement("option");
            option.value = selected.carName;
            option.textContent = selected.carName;
            option.dataset.price = selected.price;
            option.dataset.image = selected.url;
            option.selected = true;
            carSelect.appendChild(option);
            carSelect.disabled = true;
            priceInput.value = selected.price;
            updateCarPreview(selected);
          } else {
            // Populate all cars
            cars.forEach((car) => {
              const option = document.createElement("option");
              option.value = car.carName;
              option.textContent = car.carName;
              option.dataset.price = car.price;
              option.dataset.image = car.url;
              carSelect.appendChild(option);
            });
          }

          // Show price dynamically and update preview
          carSelect.addEventListener("change", () => {
            const selectedOption = carSelect.options[carSelect.selectedIndex];
            if (selectedOption.value) {
              const price = Number(selectedOption.dataset.price); // Ensure price is a number
              priceInput.value = price; // Store raw number in input
              updateCarPreview({
                carName: selectedOption.value,
                price: price,
                url: selectedOption.dataset.image,
              });
              // Update total price if duration exists
              if (durationInput.value) {
                const duration = Number(durationInput.value);
                const total = price * duration;
                totalPrice.textContent = `Total: ₹${formatPrice(total)}`;
              }
            } else {
              priceInput.value = "";
              carPreview.classList.add("hidden");
              totalPrice.textContent = "";
            }
          });

          // Calculate total price on duration change
          durationInput.addEventListener("input", () => {
            const price = Number(priceInput.value) || 0;
            const duration = Number(durationInput.value) || 0;
            if (price && duration) {
              const total = price * duration;
              totalPrice.textContent = `Total: ₹${formatPrice(total)}`;
            } else {
              totalPrice.textContent = "";
            }
          });
        }

        // === Booking Form Submission ===
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          message.textContent = "";
          message.style.color = "red";

          const userData = await getUserSession();
          if (!userData || !userData.user?._id) {
            message.textContent = "Please login for Booking .";
            setTimeout(() => {
              window.location.href = "/";
            }, 2000);

            return;
          }

          const bookingData = {
            carName: carSelect.value,
            price: Number(priceInput.value), // Ensure price is sent as number
            duration: Number(durationInput.value), // Ensure duration is sent as number
            date: document.getElementById("date").value,
            userId: userData.user._id,
          };

          try {
            const response = await withLoader(submitBtn, () =>
              bookingCar(bookingData)
            );

            if (response?.error) {
              showErrorMessage(response.message || "Booking failed");
              showToast(response.message || "Booking failed", "error");
            } else {
              showSuccessMessage("🎉 Car booked successfully!");
              showToast("Car booked successfully!", "success");

              const maildata = {
                to: userData.user.email,
                userName: userData.user.userName,
                carName: carSelect.value,
              };
              const abc = await SendMailCar(maildata);
              form.reset();
              carPreview.classList.add("hidden");
              totalPrice.textContent = "";
              if (!carId) {
                carSelect.selectedIndex = 0;
              }

              // Scroll to top with smooth animation
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          } catch (error) {
            showErrorMessage("An unexpected error occurred. Please try again.");
            showToast("An unexpected error occurred", "error");
          }
        });

        // Function to update car preview
        function updateCarPreview(car) {
          if (car && car.url) {
            previewImg.src = car.url;
            previewCarName.textContent = car.carName;
            const price = Number(car.price); // Ensure price is a number
            previewPrice.textContent = `₹${formatPrice(price)} per day`;
            carPreview.classList.remove("hidden");
            carPreview.style.display = "block"; // Force display
            // Trigger fade-in animation
            carPreview.classList.remove("animate-fade-in");
            void carPreview.offsetWidth; // Force reflow
            carPreview.classList.add("animate-fade-in");
          } else {
            carPreview.classList.add("hidden");
          }
        }

        // Functions to show messages with animation
        function showSuccessMessage(text) {
          message.innerHTML = `
            <div class="px-4 py-3 rounded-xl shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center gap-3 animate-slide-up">
              <i class="fas fa-check-circle"></i>
              <p>${text}</p>
            </div>
          `;
          animateMessage();
        }

        function showErrorMessage(text) {
          message.innerHTML = `
            <div class="px-4 py-3 rounded-xl shadow-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center gap-3 animate-slide-up">
              <i class="fas fa-exclamation-circle"></i>
              <p>${text}</p>
            </div>
          `;
          animateMessage();
        }

        function animateMessage() {
          message.style.opacity = "1";
          message.style.transform = "translateY(0)";

          setTimeout(() => {
            message.style.opacity = "0";
            message.style.transform = "translateY(8px)";
          }, 5000);
        }

        setupCars();
      })();
