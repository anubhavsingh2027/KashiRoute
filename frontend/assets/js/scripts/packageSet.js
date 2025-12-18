import { createPackage } from "../Middleware/services.js";

      const packageForm = document.getElementById("packageSetForm");
      const message = document.getElementById("PackageMessage");
      const submitBtn = document.getElementById("submitBtn");

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
            "mt-2 rounded-xl overflow-hidden bg-slate-50 relative group hover:shadow-lg transition-shadow";
          preview.innerHTML = `
            <img src="${url}" alt="Package Preview" class="w-full h-48 object-cover" onerror="this.parentElement.remove()"/>
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="absolute bottom-0 left-0 right-0 p-4 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              Package preview image
            </div>
          `;
          urlInput.parentElement.parentElement.appendChild(preview);
        }
      }

      function showMessage(text, type = "success") {
        message.innerHTML = `
          <div class="px-6 py-4 rounded-xl shadow-xl ${
            type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          } flex items-center gap-3 animate-slide-up border border-white/20">
            <i class="fas ${
              type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
            }"></i>
            <p>${text}</p>
          </div>
        `;

        // Add show class to make the message visible
        message.classList.add('show');

        // Remove show class after delay
        setTimeout(() => {
          message.classList.remove('show');
        }, 3000);
      }

      function setLoading(isLoading) {
        const btnContent = submitBtn.querySelector("span");
        if (isLoading) {
          submitBtn.disabled = true;
          submitBtn.classList.add("opacity-80");
          btnContent.innerHTML = `
            <div class="flex items-center gap-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Package...
            </div>
          `;
        } else {
          submitBtn.disabled = false;
          submitBtn.classList.remove("opacity-80");
          btnContent.innerHTML = `
            <i class="fas fa-plus-circle"></i>
            <span>Create Package</span>
          `;
        }
      }

      if (packageForm) {
        packageForm.addEventListener("submit", async (event) => {
          event.preventDefault();
          setLoading(true);

          try {
            const packageData = {
              packageName: document.getElementById("packageName").value.trim(),
              place: document.getElementById("place").value.trim(),
              url: document.getElementById("url").value.trim(),
              price: document.getElementById("price").value.trim(),
              packageDuration: document.getElementById("packageDuration").value.trim(),
              description: document.getElementById("description").value.trim(),
            };

            const data = await createPackage(packageData);

            if (data.error) {
              showMessage(`Failed to create package: ${data.message}`, "error");
            } else {
              showMessage("Package created successfully! 🎉");

              packageForm.reset();
              const preview = document.getElementById("imagePreview");
              if (preview) preview.remove();

              // Scroll smoothly to top after success
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          } catch (err) {
            showMessage(
              "An unexpected error occurred. Please try again.",
              "error"
            );
          } finally {
            setLoading(false);
          }
        });
      }
