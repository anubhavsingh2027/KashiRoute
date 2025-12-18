
      import { loginUser, logoutRequested } from "../Middleware/services.js";
      import { showToast} from "../Middleware/tailwind-init.js";

      const loginForm = document.getElementById("loginForm");
      const message = document.getElementById("loginMessage");
      const submitBtn = loginForm?.querySelector("button");

      // Toast notifications are handled by the imported showToast function

      function setLoading(isLoading) {
  if (!submitBtn) return;
  const btnContent = submitBtn.querySelector('span');
  if (!btnContent) return;

  if (isLoading) {
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-80');
    btnContent.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="animate-spin h-5 w-5 text-white" ...></svg>
        Signing in...
      </div>
    `;
  } else {
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-80');
    btnContent.innerHTML = `
      <i class="fas fa-sign-in-alt group-hover:translate-x-1 transition-transform"></i>
      Sign in
    `;
  }
}


      function getLogoutParams() {
        const params = new URLSearchParams(window.location.search);
        return { logoutRequest: params.get("logoutRequest") === "true" };
      }

      const { logoutRequest } = getLogoutParams();
      (async function init() {
        if (logoutRequest) {
          try {
            const data = await logoutRequested();
            if (data.status) {
              // Smooth redirect
              const overlay = document.createElement('div');
              overlay.className = 'fixed inset-0 bg-white transition-opacity duration-500 z-50';
              document.body.appendChild(overlay);
              setTimeout(() => {
                overlay.style.opacity = '1';
                setTimeout(() => {
                  window.location.href = "/";
                }, 500);
              }, 100);
            }
          } catch (err) {}
          return;
        }

        if (loginForm) {
          loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const loginData = { email, password };
                showToast("loading...", "send");
            try {
              setLoading(true);
              const data = await loginUser(loginData);
              if (!data || !data.status) {
                const msg = data?.message || "Login failed";
                showToast(msg, "error");
                return;
              }

              // Only show success toast if there's a message from server
              if (data.message) {
                showToast(data.message, "success");
              }
              loginForm.reset();

              // Smooth redirect
              setTimeout(() => {
                const overlay = document.createElement('div');
                overlay.className = 'fixed inset-0 bg-white transition-opacity duration-500 z-50';
                document.body.appendChild(overlay);
                setTimeout(() => {
                  overlay.style.opacity = '1';
                  setTimeout(() => {
                    window.location.href = "/";
                  }, 500);
                }, 100);
              }, 1200);
            } catch (err) {
              showToast("Network error. Please try again.", "error");
            } finally {
              setLoading(false);
            }
          });
        }
      })();
