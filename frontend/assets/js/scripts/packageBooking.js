
      import {getAllPackages,getUserSession, bookPackage,deletePackage,} from "../Middleware/services.js";
      import { showToast, withLoader } from "../Middleware/tailwind-init.js";
      import { sendMailPackage } from "../Middleware/mailSendBook.js";

      
      const packageSelect = document.getElementById("packageName");
      const message = document.getElementById("message");
      const form = document.getElementById("bookForm");
      const submitBtn = form.querySelector("button");
      const packagePreview = document.getElementById("packagePreview");
      const previewImg = packagePreview.querySelector("img");
      const previewPackageName = document.getElementById("previewPackageName");
      const previewPlace = document.getElementById("previewPlace");
      const previewPrice = document.getElementById("previewPrice");
      const totalPrice = document.getElementById("totalPrice");

      // Format price with commas
      function formatPrice(price) {
        return new Intl.NumberFormat("en-IN").format(price);
      }

      // === Extract Package ID and Delete Flag ===
      function getPackageIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return {
          id: params.get("id"),
          isDelete: params.get("delete") === "true",
        };
      }

      const { id: packageId, isDelete } = getPackageIdFromURL();

      // === MAIN LOGIC ===
      (async function init() {
        if (isDelete && packageId) {
          const data = await deletePackage(packageId);
          window.location.href = "/packageDetails";
          return;
        }

        const data = await getAllPackages();
        if (!data || data.error) {
          message.textContent = "Failed to load packages.";
          message.style.color = "red";
          return;
        }

        const packages = data.packages || data;

        // Add default option
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select a package";
        packageSelect.appendChild(defaultOption);

        if (packageId) {
          const selected = packages.find((p) => p._id === packageId);
          if (!selected) {
            showToast("Package not found", "error");
            return;
          }
          const option = document.createElement("option");
          option.value = selected.packageName;
          option.textContent = selected.packageName;
          option.dataset.price = selected.price;
          option.dataset.place = selected.place;
          option.dataset.image = selected.url;
          option.selected = true;
          packageSelect.appendChild(option);
          packageSelect.disabled = true;
          updatePackagePreview(selected);
        } else {
          packages.forEach((pkg) => {
            const option = document.createElement("option");
            option.value = pkg.packageName;
            option.textContent = pkg.packageName;
            option.dataset.price = pkg.price;
            option.dataset.place = pkg.place;
            option.dataset.image = pkg.url;
            packageSelect.appendChild(option);
          });
        }

        // Show preview and update total on package selection
        packageSelect.addEventListener("change", () => {
          const selectedOption =
            packageSelect.options[packageSelect.selectedIndex];
          if (selectedOption.value) {
            const packageData = {
              packageName: selectedOption.value,
              place: selectedOption.dataset.place,
              price: selectedOption.dataset.price,
              url: selectedOption.dataset.image,
            };
            updatePackagePreview(packageData);
            // Trigger guest number calculation
            document
              .getElementById("guestNo")
              .dispatchEvent(new Event("input"));
          } else {
            packagePreview.classList.add("hidden");
            totalPrice.textContent = "";
          }
        });

        // Calculate total price on guest number change
        document.getElementById("guestNo").addEventListener("input", (e) => {
          const selectedOption =
            packageSelect.options[packageSelect.selectedIndex];
          if (selectedOption.value && e.target.value) {
            const basePrice = parseInt(selectedOption.dataset.price);
            const guests = parseInt(e.target.value);
            const total = basePrice * guests;
            totalPrice.textContent = `Total: ₹${formatPrice(total)}`;
          } else {
            totalPrice.textContent = "";
          }
        });

        // === Handle Booking ===
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          message.textContent = "";
          message.style.color = "red";

          const userData = await getUserSession();
          if (!userData || !userData.user?._id) {
            message.textContent = "Please login for booking.";
            setTimeout(() => {
              window.location.href = "/login";
            }, 2000);
            return;
          }

          const bookingData = {
            packageName: packageSelect.value,
            guestNo: document.getElementById("guestNo").value,
            arrivalDate: document.getElementById("arrivalDate").value,
            request: document.getElementById("request").value,
            userId: userData.user._id,
          };

          try {
            // Show loading state
            submitBtn.disabled = true;
            const btnContent = submitBtn.querySelector("span");
            const originalContent = btnContent.innerHTML;
            btnContent.innerHTML = `
              <div class="flex items-center gap-3">
                <svg class="loading-spinner h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Booking...
              </div>
            `;

            const response = await bookPackage(bookingData);
            if (response?.error) {
              showErrorMessage(response.message || "Booking failed");
              showToast(response.message || "Booking failed", "error");
            } else {
              showSuccessMessage("🎉 Package booked successfully!");
              showToast("Package booked successfully!", "success");
              const sendData = {
                to: userData.user.email,
                userName: userData.user.userName,
                packageName: packageSelect.value,
              };
              console.log("send data :", sendData);
              await sendMailPackage(sendData);
              form.reset();
              packagePreview.classList.add("hidden");
              totalPrice.textContent = "";
              if (!packageId) {
                packageSelect.selectedIndex = 0;
              }

              // Scroll to top with smooth animation
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          } catch (error) {
            showErrorMessage("An unexpected error occurred. Please try again.");
            showToast("An unexpected error occurred", "error");
          } finally {
            // Restore button state
            submitBtn.disabled = false;
            const btnContent = submitBtn.querySelector("span");
            btnContent.innerHTML = `
              <i class="fas fa-check-circle group-hover:rotate-12 transition-transform"></i>
              Book Package
            `;
          }
        });

        // Function to update package preview
        function updatePackagePreview(pkg) {
          if (pkg && pkg.url) {
            previewImg.src = pkg.url;
            previewPackageName.textContent = pkg.packageName;
            previewPlace.textContent = pkg.place;
            previewPrice.textContent = `₹${formatPrice(pkg.price)} per person`;
            packagePreview.classList.remove("hidden");
          } else {
            packagePreview.classList.add("hidden");
          }
        }

        // Functions to show messages with animation
        function showSuccessMessage(text) {
          showMessage(text, "success");
        }

        function showErrorMessage(text) {
          showMessage(text, "error");
        }

        function showMessage(text, type = "success") {
          // Remove existing message if any
          const existingMsg = message.querySelector("div");
          if (existingMsg) {
            existingMsg.classList.remove("animate-slide-in");
            existingMsg.classList.add("opacity-0", "translate-y-4");
          }

          // Create and insert new message
          const msgElement = document.createElement("div");
          msgElement.className = `px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in
            ${
              type === "success"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                : "bg-gradient-to-r from-rose-500 to-pink-500"
            } text-white`;
          msgElement.innerHTML = `
            <i class="fas ${
              type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
            }
              ${type === "success" ? "animate-bounce" : "animate-pulse"}"></i>
            <p class="flex-1">${text}</p>
          `;

          message.innerHTML = "";
          message.appendChild(msgElement);

          // Hide message after delay
          setTimeout(() => {
            msgElement.classList.remove("animate-slide-in");
            msgElement.classList.add("opacity-0", "translate-y-4");
            msgElement.style.transition = "all 0.3s ease-out";
          }, 5000);
        }

        setupPackages();
      })();
