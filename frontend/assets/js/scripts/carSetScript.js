
      import { addCar } from "../Middleware/services.js";
      import { showToast } from "../Middleware/tailwind-init.js";

      const carForm = document.getElementById("carSetForm");
      const submitBtn = document.getElementById("submitBtn");

      // Preview image on URL input
      const urlInput = document.getElementById("url");
      urlInput.addEventListener("input", debounce(previewImage, 500));

      function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
          const later = () => {
            clearTimeout(timeout);
            func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
        };
      }

      function previewImage() {
        const url = urlInput.value.trim();
        if (url) {
          // Remove old preview if exists
          const oldPreview = document.getElementById("imagePreview");
          if (oldPreview) oldPreview.remove();

          // Create new preview
          const preview = document.createElement("div");
          preview.id = "imagePreview";
          preview.className =
            "mt-2 rounded-lg overflow-hidden bg-slate-100 relative group hover:shadow-lg transition-shadow";
          preview.innerHTML = `
            <img src="${url}" alt="Car Preview" class="w-full h-48 object-cover" onerror="this.parentElement.remove()"/>
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="absolute bottom-0 left-0 right-0 p-3 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">Preview image</div>
          `;
          urlInput.parentElement.parentElement.appendChild(preview);
        }
      }

      function showMessage(text, type = "success") {
        message.innerHTML = `
          <div class="px-4 py-3 rounded-lg shadow-lg ${
            type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-rose-500 text-white"
          } flex items-center gap-3 animate-slide-up">
            <i class="fas ${
              type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
            }"></i>
            <p>${text}</p>
          </div>
        `;
        message.style.opacity = "1";
        message.style.transform = "translateY(0)";

        setTimeout(() => {
          message.style.opacity = "0";
          message.style.transform = "translateY(24px)";
        }, 5000);
      }

      function setLoading(isLoading) {
        const btnContent = submitBtn.querySelector("span");
        if (isLoading) {
          submitBtn.disabled = true;
          submitBtn.classList.add('opacity-90', 'cursor-wait');
          btnContent.innerHTML = `
            <div class="flex items-center justify-center gap-3">
              <svg class="animate-spin h-6 w-6 text-white filter drop-shadow-md" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-lg font-semibold tracking-wide">Adding Car...</span>
            </div>
          `;
        } else {
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-90', 'cursor-wait');
          btnContent.innerHTML = `
            <i class="fas fa-plus-circle text-xl group-hover:rotate-180 transition-transform duration-500"></i>
            <span class="tracking-wide">Add New Car</span>
          `;
        }
      }

      if (carForm) {
        carForm.addEventListener("submit", async (event) => {
          event.preventDefault();
          setLoading(true);

          try {
            const carData = {
              carName: document.getElementById("carName").value.trim(),
              totalSeats: document.getElementById("totalSeats").value.trim(),
              price: document.getElementById("price").value.trim(),
              url: document.getElementById("url").value.trim(),
              description: document.getElementById("description").value.trim(),
            };

            const data = await addCar(carData);

            if (data.error) {
              showToast(`Failed to add car: ${data.message}`, "error");
            } else {
              showToast("Car added successfully! 🚗", "success");
              carForm.reset();
              const preview = document.getElementById("imagePreview");
              if (preview) preview.remove();

              // Smooth scroll to top
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          } catch (err) {
            showToast("An unexpected error occurred. Please try again.", "error");
          } finally {
            setLoading(false);
          }
        });
      }