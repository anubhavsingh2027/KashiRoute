const { sendEmail } = require("../utils/emailUtils");

/**
 * Generate contact form confirmation email for user
 */
function generateUserContactConfirmationHTML(contactData) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">We Received Your Message</h2>

        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Hello ${contactData.name},
        </p>

        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Thank you for contacting Kashi Route. We have received your message and will get back to you as soon as possible.
        </p>

        <div style="background-color: #fff; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #333; margin-top: 0;">Your Message Details:</h3>
          <p style="color: #666; margin: 10px 0;"><strong>Name:</strong> ${contactData.name}</p>
          <p style="color: #666; margin: 10px 0;"><strong>Email:</strong> ${contactData.email}</p>
          <p style="color: #666; margin: 10px 0;"><strong>Phone:</strong> ${contactData.phone}</p>
          <p style="color: #666; margin: 10px 0;"><strong>Subject:</strong> ${contactData.subject}</p>
          <p style="color: #666; margin: 10px 0;"><strong>Message:</strong></p>
          <p style="color: #666; white-space: pre-wrap; word-wrap: break-word;">${contactData.message}</p>
        </div>

        <p style="color: #666; font-size: 14px; margin: 20px 0;">
          Our team typically responds within 24-48 hours during business days.
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p style="color: #999; font-size: 12px; text-align: center;">
          © 2026 Kashi Route. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate admin notification email
 */
function generateAdminNotificationHTML(contactData) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px;">
        <h2 style="color: #856404; margin-bottom: 20px;">New Contact Form Submission</h2>

        <div style="background-color: #fff; border: 1px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 4px;">
          <h3 style="color: #333; margin-top: 0;">Contact Details:</h3>

          <p style="color: #666; margin: 10px 0;">
            <strong>Name:</strong> ${contactData.name}
          </p>

          <p style="color: #666; margin: 10px 0;">
            <strong>Email:</strong> <a href="mailto:${contactData.email}" style="color: #ff9800; text-decoration: none;">${contactData.email}</a>
          </p>

          <p style="color: #666; margin: 10px 0;">
            <strong>Phone:</strong> <a href="tel:${contactData.phone}" style="color: #ff9800; text-decoration: none;">${contactData.phone}</a>
          </p>

          <p style="color: #666; margin: 10px 0;">
            <strong>Subject:</strong> ${contactData.subject}
          </p>
        </div>

        <div style="background-color: #fff; border-left: 4px solid #ff9800; padding: 15px; margin: 15px 0; border-radius: 4px;">
          <h3 style="color: #333; margin-top: 0;">Message:</h3>
          <p style="color: #666; white-space: pre-wrap; word-wrap: break-word;">${contactData.message}</p>
        </div>

        <div style="background-color: #e8f5e9; border: 1px solid #4caf50; padding: 15px; margin: 15px 0; border-radius: 4px;">
          <p style="color: #2e7d32; margin: 0;">
            <strong>✓ Action Required:</strong> Please review and respond to this inquiry.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p style="color: #999; font-size: 12px; text-align: center;">
          Submitted at: ${new Date().toLocaleString()}
        </p>
      </div>
    </div>
  `;
}

/**
 * Handle contact form submission
 * Sends confirmation email to user and notification email to admin
 */
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // ===== Validation =====
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Phone format validation (basic)
    const phoneRegex = /^[0-9\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone) || phone.replace(/\D/g, "").length < 10) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number",
      });
    }

    // Message length validation
    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        error: "Message must be at least 10 characters long",
      });
    }

    const contactData = { name, email, phone, subject, message };

    // ===== Send confirmation email to user =====
    const userEmailResult = await sendEmail({
      to: email,
      subject: "We Received Your Message - Kashi Route",
      message: generateUserContactConfirmationHTML(contactData),
      websiteName: "Kashi Route",
    });

    if (!userEmailResult.success) {
      console.error("Failed to send user confirmation email:", userEmailResult);
      return res.status(500).json({
        success: false,
        error: "Failed to send confirmation email. Please try again later.",
      });
    }

    // ===== Send notification email to admin =====
    const adminEmail = process.env.ADMIN_EMAIL || "admin@kashiroute.com";

    const adminEmailResult = await sendEmail({
      to: adminEmail,
      subject: `New Contact Form Submission from ${name}`,
      message: generateAdminNotificationHTML(contactData),
      websiteName: "Kashi Route",
    });

    if (!adminEmailResult.success) {
      console.error("Failed to send admin notification email:", adminEmailResult);
      // Don't fail the request, as user email was already sent
      return res.status(200).json({
        success: true,
        message:
          "Your message was received. Admin notification email failed, but we will contact you soon.",
        warning: true,
      });
    }

    // ===== Success Response =====
    res.status(200).json({
      success: true,
      message:
        "Thank you for reaching out! We have received your message and will get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      success: false,
      error: "An unexpected error occurred. Please try again later.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get contact information (optional endpoint for frontend)
 */
exports.getContactInfo = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      contactInfo: {
        location: "Varanasi, Uttar Pradesh, India",
        email: process.env.SUPPORT_EMAIL || "support@kashiroute.com",
        phone: process.env.SUPPORT_PHONE || "+91 XXXX XXX XXXX",
        businessHours: "Monday - Sunday, 24 Hours Open",
        socialMedia: {
          facebook: "#",
          twitter: "#",
          instagram: "#",
          youtube: "#",
        },
      },
    });
  } catch (error) {
    console.error("Get contact info error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch contact information",
    });
  }
};
