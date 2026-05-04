async function sendEmail({
  to,
  subject,
  message,
  websiteName = "Kashi Route",
}) {
  try {
    const payload = {
      to: to,
      subject: subject,
      websiteName: websiteName,
      message: message,
    };

    const response = await fetch(process.env.mail_Api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Mail API Error:", result);
      return {
        success: false,
        error: result.message || "Failed to send email",
      };
    }

    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate OTP email HTML
 */
function generateOTPEmailHTML(otp, websiteName = "Kashi Route") {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>

        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Hello,
        </p>

        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Your One-Time Password (OTP) for ${websiteName} is:
        </p>

        <div style="background-color: #fff; border: 2px solid #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; letter-spacing: 5px; margin: 0; font-family: 'Courier New', monospace; font-size: 32px;">
            ${otp}
          </h1>
        </div>

        <p style="color: #ff6b6b; font-size: 14px; margin: 20px 0;">
          <strong>⚠️ Important:</strong> This OTP will expire in 7 minutes.
        </p>

        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
          Do not share this OTP with anyone. ${websiteName} staff will never ask you for your OTP.
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p style="color: #999; font-size: 12px; text-align: center;">
          If you didn't request this OTP, please ignore this email or contact support.
        </p>

        <p style="color: #999; font-size: 12px; text-align: center;">
          © 2026 ${websiteName}. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate password reset confirmation HTML
 */
function generatePasswordResetHTML(userName, websiteName = "Kashi Route") {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">Password Reset Successful</h2>

        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Hello ${userName},
        </p>

        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Your password has been successfully reset. You can now log in to your ${websiteName} account with your new password.
        </p>

        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0; color: #155724;">
          <strong>✓</strong> Your account is secure and ready to use.
        </div>

        <p style="color: #666; font-size: 14px; margin: 20px 0;">
          If you didn't reset your password, please contact our support team immediately.
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p style="color: #999; font-size: 12px; text-align: center;">
          © 2026 ${websiteName}. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate User Type Change Admin Approval Email
 */
function generateUserTypeChangeApprovalEmailHTML(
  userName,
  userId,
  newUserType,
  otp,
  requestId,
  websiteName = "Kashi Route",
) {
  const isProduction = process.env.NODE_ENV === "production";
  const baseUrl = isProduction
    ? process.env. production_url_backend
    : process.env.development_Url_backend;

  const approveLink = `${baseUrl}/permissiongrant?id=${userId}&type=${newUserType}&action=approve&otp=${otp}&requestId=${requestId}`;
  const disapproveLink = `${baseUrl}/permissiongrant?id=${userId}&type=${newUserType}&action=disapprove&otp=${otp}&requestId=${requestId}`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">User Type Change Request</h2>

        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Hello Admin,
        </p>

        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          A user has requested to change their account type from <strong>guest</strong> to <strong>${newUserType}</strong>.
        </p>

        <div style="background-color: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
          <p style="color: #004085; margin: 5px 0;"><strong>User Name:</strong> ${userName}</p>
          <p style="color: #004085; margin: 5px 0;"><strong>User ID:</strong> ${userId}</p>
          <p style="color: #004085; margin: 5px 0;"><strong>Requested Type:</strong> ${newUserType}</p>
          <p style="color: #004085; margin: 5px 0;"><strong>OTP:</strong> <span style="font-family: 'Courier New', monospace; font-weight: bold; color: #007bff; font-size: 18px; letter-spacing: 2px;">${otp}</span></p>
        </div>

        <p style="color: #333; font-size: 14px; margin: 20px 0; font-weight: bold;">
          Please select an action:
        </p>

        <div style="display: flex; gap: 10px; margin: 20px 0;">
          <a href="${approveLink}" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center;">
            ✓ Approve
          </a>
          <a href="${disapproveLink}" style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center;">
            ✕ Disapprove
          </a>
        </div>

        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
          <strong>Note:</strong> This request will expire in 24 hours. If you didn't initiate this request, please contact support immediately.
        </p>

        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
          © 2026 ${websiteName}. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate User Type Change Confirmation Email (when approved)
 */
function generateUserTypeChangeConfirmationHTML(
  userName,
  userType,
  websiteName = "Kashi Route",
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #28a745; margin-bottom: 20px;">✓ User Type Change Approved</h2>
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Hello ${userName},
        </p>
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Your request to change your account type to <strong>${userType}</strong> has been <strong style="color: #28a745;">APPROVED</strong>.
        </p>
        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0; color: #155724;">
          <strong>✓</strong> You can now access ${userType} features in your account.
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Please login to your account to start using your new features.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          © 2026 ${websiteName}. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate User Type Change Rejection Email (when disapproved)
 */
function generateUserTypeChangeRejectionHTML(
  userName,
  userType,
  currentUserType,
  websiteName = "Kashi Route",
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #dc3545; margin-bottom: 20px;">✕ User Type Change Request Declined</h2>
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Hello ${userName},
        </p>
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Unfortunately, your request to change your account type to <strong>${userType}</strong> has been <strong style="color: #dc3545;">DECLINED</strong>.
        </p>
        <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 20px 0; color: #721c24;">
          <strong>✕</strong> Your account type remains as <strong>${currentUserType}</strong>.
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          If you have any questions or concerns, please contact our support team.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          © 2026 ${websiteName}. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate Welcome Email for New User After Signup
 */
function generateWelcomeSignupEmailHTML(userName, websiteName = "Kashi Route") {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 32px;">Welcome to ${websiteName}!</h1>
      </div>

      <div style="background-color: #f8f9fa; padding: 40px 20px; border-radius: 0 0 8px 8px;">
        <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
          Hello <strong>${userName}</strong>,
        </p>

        <p style="color: #666; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
          Thank you for signing up with <strong>${websiteName}</strong>! We're excited to have you on board. Your account has been successfully created and verified.
        </p>

        <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 30px 0; border-radius: 4px;">
          <p style="color: #155724; margin: 0; font-size: 14px; line-height: 22px;">
            <strong>✓ Account Activated</strong><br>
            Your email has been verified and your account is now fully active. You can start exploring all the features of ${websiteName}.
          </p>
        </div>

        <h3 style="color: #333; font-size: 18px; margin: 30px 0 15px 0;">Getting Started</h3>
        <ul style="color: #666; font-size: 14px; line-height: 24px; margin: 0 0 30px 0; padding-left: 20px;">
          <li>Complete your profile for better recommendations</li>
          <li>Browse and book vehicles or explore packages</li>
          <li>Check your booking history and manage reservations</li>
          <li>Contact our support team if you need any help</li>
        </ul>

        <p style="color: #666; font-size: 14px; margin: 20px 0;">
          If you have any questions or need assistance, feel free to reach out to our support team. We're here to help!
        </p>

        <div style="background-color: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 4px; padding: 15px; margin: 20px 0; text-align: center;">
          <p style="color: #004085; font-size: 14px; margin: 0;">
            Have questions? Visit our <strong>Help Center</strong> or <strong>Contact Us</strong> page for more information.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          <strong>Security Tip:</strong> Never share your password with anyone. ${websiteName} staff will never ask for your password.
        </p>

        <p style="color: #999; font-size: 12px; text-align: center; margin: 15px 0 0 0;">
          © 2026 ${websiteName}. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate Admin Notification Email for New User Signup
 */
function generateAdminSignupNotificationEmailHTML(
  userName,
  userEmail,
  userPhone,
  userLocation,
  userType,
  signupDate,
  websiteName = "Kashi Route",
) {
  const formattedDate = new Date(signupDate).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📢 New User Signup Alert</h1>
      </div>

      <div style="background-color: #f8f9fa; padding: 30px 20px; border-radius: 0 0 8px 8px;">
        <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
          Hello Admin,
        </p>

        <p style="color: #666; font-size: 16px; margin: 0 0 20px 0;">
          A new user has successfully registered and verified their email on ${websiteName}. Here are the details:
        </p>

        <div style="background-color: #e7f3ff; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 10px 0; color: #004085;"><strong>Name:</strong></td>
              <td style="padding: 10px 0; color: #004085;">${userName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #004085;"><strong>Email:</strong></td>
              <td style="padding: 10px 0; color: #004085;"><a href="mailto:${userEmail}" style="color: #0066cc; text-decoration: none;">${userEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #004085;"><strong>Phone:</strong></td>
              <td style="padding: 10px 0; color: #004085;"><a href="tel:${userPhone}" style="color: #0066cc; text-decoration: none;">${userPhone}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #004085;"><strong>Location:</strong></td>
              <td style="padding: 10px 0; color: #004085;">${userLocation}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #004085;"><strong>Account Type:</strong></td>
              <td style="padding: 10px 0; color: #004085;"><strong style="text-transform: capitalize;">${userType}</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #004085;"><strong>Signup Date & Time:</strong></td>
              <td style="padding: 10px 0; color: #004085;">${formattedDate}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; padding: 15px; margin: 20px 0; color: #155724;">
          <p style="margin: 0; font-size: 14px;">
            <strong>✓ Email Verified:</strong> User's email has been successfully verified. They can now use all features of the platform.
          </p>
        </div>

        <h3 style="color: #333; font-size: 16px; margin: 20px 0 10px 0;">Quick Actions</h3>
        <ul style="color: #666; font-size: 14px; line-height: 22px; margin: 0; padding-left: 20px;">
          <li>Monitor user activity and engagement</li>
          <li>Send a personalized welcome offer if applicable</li>
          <li>Check profile completion status</li>
        </ul>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          This is an automated notification. Please do not reply to this email.
        </p>

        <p style="color: #999; font-size: 12px; text-align: center; margin: 10px 0 0 0;">
          © 2026 ${websiteName}. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

module.exports = {
  sendEmail,
  generateOTPEmailHTML,
  generatePasswordResetHTML,
  generateUserTypeChangeApprovalEmailHTML,
  generateUserTypeChangeConfirmationHTML,
  generateUserTypeChangeRejectionHTML,
  generateWelcomeSignupEmailHTML,
  generateAdminSignupNotificationEmailHTML,
};
