
      import { forgetPass } from "../Middleware/services.js";
      import { showToast, withLoader } from "../Middleware/tailwind-init.js";
      import { getGlobalMail } from "../Middleware/otp.js";
      
      const forgetForm = document.getElementById("forgetForm");
      const btn = document.getElementById("forgetBtn");
      const loadingSpinner = document.getElementById("loadingSpinner");

      if (forgetForm) {
        forgetForm.addEventListener("submit", async (e) => {
          e.preventDefault();

          const email = document.getElementById("email").value.trim();
          const password = document.getElementById("password").value;
          const code = document.getElementById("code").value.trim();
          const confirmPassword =
            document.getElementById("confirmPassword").value;

          const sendData = await getGlobalMail();
          const Gmail = sendData.globalemail;
          const codeSend = sendData.globalotp;
          if (Gmail != email) {
            showToast("Both Email Are not Same While otp", "error");
            return;
          }
          if (codeSend != code) {
            showToast("Otp Not Match", "error");
            return;
          }

          if (password !== confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
          }

          const payload = { email, password };

          try {
            loadingSpinner.classList.remove("hidden");
            btn.querySelector("span").classList.add("opacity-0");

            const res = await forgetPass(payload);

            if (!res || res.error) {
              const msg = res?.message || "Failed to reset password";
              showToast(msg, "error");
            } else {
              const successMsg = res.message || "Password updated successfully";
              showToast(successMsg, "success");
              forgetForm.reset();
              setTimeout(() => {
                window.location.href = "/login";
              }, 1500);
            }
          } catch (error) {
            showToast(`An error occurred ${error}`, "error");
          } finally {
            loadingSpinner.classList.add("hidden");
            btn.querySelector("span").classList.remove("opacity-0");
          }
        });
      }
