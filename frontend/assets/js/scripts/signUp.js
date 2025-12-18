import { registerUser } from "../Middleware/services.js";
import { getGlobalMail } from "../Middleware/otp.js";
import { showToast } from "../Middleware/tailwind-init.js";

const form = document.getElementById("registerForm");
const msg = document.getElementById("registerMessage");
const btn = document.getElementById("registerBtn");

// Toast notifications are handled by the imported showToast function

function setLoading(isLoading) {
  const btnContent = btn.querySelector("span");
  if (isLoading) {
    btn.disabled = true;
    btn.classList.add("opacity-80");
    btnContent.innerHTML = `
            <div class="flex items-center gap-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </div>
          `;
  } else {
    btn.disabled = false;
    btn.classList.remove("opacity-80");
    btnContent.innerHTML = `
            <i class="fas fa-user-plus group-hover:rotate-12 transition-transform"></i>
            Create Account
          `;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userName = document.getElementById("userName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const location = document.getElementById("location").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const code = document.getElementById("code").value.trim();
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

  const userData = { userName, email, phone, location, password };

  try {
    setLoading(true);
    const result = await registerUser(userData);

    if (!result.status) {
      showToast(result.message || "Registration failed", "error");
    } else if (result.status) {
      showToast(
        "🎉 " + (result.message || "Account created successfully!"),
        "success"
      );
      form.reset();

      // Smooth redirect
      setTimeout(() => {
        const overlay = document.createElement("div");
        overlay.className =
          "fixed inset-0 bg-white transition-opacity duration-500 z-50";
        document.body.appendChild(overlay);
        setTimeout(() => {
          overlay.style.opacity = "1";
          setTimeout(() => {
            window.location.href = "/";
          }, 500);
        }, 100);
      }, 1500);
    } else {
      showToast("Unexpected server response", "error");
    }
  } catch (error) {
    showToast(
      "Registration failed: " +
        (error.message || "An unexpected error occurred"),
      "error"
    );
  } finally {
    setLoading(false);
  }
});

//=======Password check======

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = input.nextElementSibling.nextElementSibling.querySelector("i");

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

// Password strength indicator functionality
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const strengthPopup = document.getElementById("passwordStrength");
const strengthIcon = document.getElementById("passwordStrengthIcon");
const confirmIcon = document.getElementById("confirmPasswordIcon");

// Strength check elements
const lengthCheck = document.getElementById("lengthCheck");
const mixedCaseCheck = document.getElementById("mixedCaseCheck");
const numberCheck = document.getElementById("numberCheck");

// Show/hide password strength popup
passwordInput.addEventListener("focus", () => {
  strengthPopup.classList.remove("hidden");
  strengthPopup.classList.add("animate-slide-up");
});

passwordInput.addEventListener("blur", () => {
  setTimeout(() => {
    strengthPopup.classList.add("hidden");
  }, 200);
});

function updatePasswordStrength(password) {
  const hasLength = password.length >= 8;
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  lengthCheck.className = `fas ${
    hasLength ? "fa-circle-check text-emerald-500" : "fa-circle text-slate-300"
  }`;
  mixedCaseCheck.className = `fas ${
    hasMixedCase
      ? "fa-circle-check text-emerald-500"
      : "fa-circle text-slate-300"
  }`;
  numberCheck.className = `fas ${
    hasNumber ? "fa-circle-check text-emerald-500" : "fa-circle text-slate-300"
  }`;

  if (hasLength && hasMixedCase && hasNumber) {
    strengthIcon.className = "fas fa-shield-check text-emerald-500";
  } else if (password.length > 0) {
    strengthIcon.className = "fas fa-shield-exclamation text-amber-500";
  } else {
    strengthIcon.className = "fas fa-circle-info text-slate-400";
  }
}

function updateConfirmPassword() {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (confirmPassword.length === 0) {
    confirmIcon.className = "fas fa-circle-check text-slate-400";
  } else if (password === confirmPassword) {
    confirmIcon.className = "fas fa-circle-check text-emerald-500";
  } else {
    confirmIcon.className = "fas fa-circle-xmark text-rose-500";
  }
}

passwordInput.addEventListener("input", () => {
  updatePasswordStrength(passwordInput.value);
  updateConfirmPassword();
});

confirmPasswordInput.addEventListener("input", updateConfirmPassword);
