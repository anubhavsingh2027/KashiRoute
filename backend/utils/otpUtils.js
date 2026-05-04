/**
 * Generate a random alphanumeric OTP
 * Format: 4 or 6 characters containing digits and letters (both uppercase and lowercase)
 * Example: "A3xK9" or "B7mN2Qx"
 */
function generateOTP(length = 6) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let otp = "";

  // Ensure at least one digit and one letter in the OTP
  const digits = "0123456789";
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  // Add at least one digit
  otp += digits.charAt(Math.floor(Math.random() * digits.length));

  // Add at least one letter
  otp += letters.charAt(Math.floor(Math.random() * letters.length));

  // Fill the rest randomly
  for (let i = otp.length; i < length; i++) {
    otp += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Shuffle the OTP to randomize digit and letter positions
  return otp
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * Get OTP expiry time (7 minutes from now)
 */
function getOTPExpiry() {
  const now = new Date();
  const expiryTime = new Date(now.getTime() + 7 * 60 * 1000); // 7 minutes
  return expiryTime;
}

/**
 * Check if OTP has expired
 */
function isOTPExpired(expiryTime) {
  return new Date() > expiryTime;
}

module.exports = {
  generateOTP,
  getOTPExpiry,
  isOTPExpired,
};
