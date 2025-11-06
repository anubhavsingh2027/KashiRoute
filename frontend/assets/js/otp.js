import { sendMail } from "./services.js";
import { showToast } from "./tailwind-init.js";
let globalemail;
let globalotp;
export async function getGlobalMail() {
  return { globalemail, globalotp };
}
const a = [
  1234, 8988, 2332, 223, 3489, 6721, 9154, 4820, 7391, 5602, 8417, 2935, 6748,
  9182, 4376, 8093, 5264, 7629, 1845, 9501, 3648, 7032, 8456, 1927, 6193, 7408,
  8251, 9037, 4826, 6579, 3182, 7945, 5607, 8724, 2398, 6812, 9053, 7419, 3642,
  8205, 5391, 6784, 9132, 4528, 7963, 2841, 6375, 9821, 7504, 3159, 4682, 9027,
  5941, 8176, 2634, 7492, 8365, 9218, 4712, 8369, 2905, 7148, 9632, 5087, 6274,
  8195, 3746, 9510, 4269, 7853, 6024, 8397, 9172, 5482, 7631, 2948, 6809, 8306,
];

function getRandomValue(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

let generated_code = null;

// Create OTP email HTML template
function createOtpHtmlTemplate({ email, otp }) {
  const currentYear = new Date().getFullYear();
  const sentTime = new Date().toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return `
  <div style="font-family:Poppins,Arial,sans-serif;background:#f4f7f6;padding:20px;">
    <div style="max-width:500px;margin:auto;background:#fff;border-radius:12px;border:1px solid #e5e5e5;overflow:hidden;">
      <div style="background:#f8f9fa;padding:40px;text-align:center;border-bottom:1px solid #dee2e6;">
        <img src="https://kashika-travel.anubhavsingh.website/assets/images/logo.png" alt="Kashi Route Logo" style="max-width:110px;">
      </div>
      <div style="padding:35px 40px;text-align:center;color:#343a40;">
        <h1 style="font-size:24px;font-weight:700;">Your Verification Code</h1>
        <p style="color:#6c757d;">A sign-in attempt requires a verification code valid for 5 minutes.</p>
        <div style="display:inline-block;background:#007bff;color:#fff;font-size:36px;font-weight:700;letter-spacing:6px;padding:18px 35px;border-radius:8px;margin:25px 0;">
          ${otp}
        </div>
        <p style="color:#6c757d;">This code was requested for:<br><strong>${email}</strong></p>
        <p style="color:#6c757d;margin-top:20px;">If you did not request this code, ignore this email.</p>
      </div>
      <div style="background:#f8f9fa;padding:25px;text-align:center;color:#6c757d;font-size:12px;border-top:1px solid #dee2e6;">
        <p>Email sent at ${sentTime}</p>
        <p>&copy; ${currentYear} PhishShield. All rights reserved.</p>
      </div>
    </div>
  </div>
  `;
}
// Send OTP using external API
async function sendOtp(email, otp) {
  const payload = {
    to: email,
    subject: "OTP by Kashi Route",
    websiteName: "Kashi Route",
    message: createOtpHtmlTemplate({ email, otp }),
  };

  try {
    const data = await sendMail(payload);
    return data && data.success;
  } catch (err) {
    return false;
  }
}

// Handle Get Code button click
document.getElementById("getCodeBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const msg = document.getElementById("register-message") || null;
  globalemail = email;
  if (!email) {
    showToast("Enter Email", "error");
    return;
  }

  showToast("Sending...", "info");
  generated_code = getRandomValue(a);
  globalotp = generated_code;
  const success = await sendOtp(email, generated_code);

  if (success) {
    showToast("OTP send Successfully ", "success");
  } else {
    msg.style.color = "red";
    showToast("Failed to send OTP. Please try again.", "error");
  }
});
