import { sendMail } from "./services.js";

// --- ✉️ Create user and host HTML templates ---
function getUserMessage1(carName) {
  return `
  <div style="font-family: 'Segoe UI', sans-serif; background-color: #f8fafc; padding: 30px; color: #1e293b;">
    <div style="max-width: 640px; margin: 0 auto; background: white; border-radius: 14px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">

      <!-- Header -->
      <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 25px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 26px;">Kashi Route</h1>
        <p style="margin: 5px 0 0; font-size: 15px;">Your Journey Begins with Comfort & Care</p>
      </div>

      <!-- Body -->
      <div style="padding: 35px; text-align: center;">
        <h2 style="color: #1e40af; margin-bottom: 15px;">🚗 Car Booking Received!</h2>
        <p style="font-size: 16px; color: #475569; line-height: 1.6;">
          Dear Valued Customer,<br><br>
          Thank you for choosing <strong>Kashi Route</strong>! We’ve received your booking request
          for our <strong style="color:#2563eb;">${carName}</strong> car service.
        </p>

        <p style="font-size: 16px; color: #475569; margin-top: 10px; line-height: 1.6;">
          Our travel team is reviewing your request and will contact you shortly
          with driver details, pickup information, and confirmation updates.
        </p>

        <div style="margin: 25px 0;">
          <a href="https://kashika-travel.anubhavsingh.website/"
             style="display:inline-block; background:#2563eb; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:500; margin:6px;">
             Visit Our Website
          </a>
          <a href="https://portfolio.anubhavsingh.website/"
             style="display:inline-block; background:#16a34a; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:500; margin:6px;">
             View Portfolio
          </a>
          <a href="https://github.com/anubhavsingh2027"
             style="display:inline-block; background:#0f172a; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:500; margin:6px;">
             Visit GitHub
          </a>
        </div>

        <div style="margin-top: 25px;">
          <p style="font-size:15px; color:#64748b;">
            Thank you for trusting us with your travel needs.<br>
            <strong>We look forward to making your trip memorable!</strong>
          </p>
        </div>

        <div style="margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          <p style="font-size:13px; color:#94a3b8;">
            Warm regards,<br>
            <strong style="color:#1e3a8a;">Kashi Route Team</strong><br>
            <a href="https://kashika-travel.anubhavsingh.website/" style="color:#2563eb; text-decoration:none;">www.kashika-travel.anubhavsingh.website</a>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f1f5f9; text-align:center; padding:12px; font-size:12px; color:#94a3b8;">
        &copy; 2025 Kashi Route. All Rights Reserved.
      </div>
    </div>
  </div>`;
}

function getHostMessage1({ email, userName }) {
  return `
  <div style="font-family: 'Segoe UI', sans-serif; background-color: #f7fafc; padding: 30px; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #15803d, #166534); padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0;">New Booking Request</h1>
      </div>

      <div style="padding: 30px;">
        <h2 style="color:#15803d;">New Customer Alert Car Rent 🚀</h2>
        <p style="font-size: 16px; color: #444;">
          You have received a new booking request from <strong>${userName}</strong>.
        </p>
        <p style="font-size: 16px; color: #444;">
          <strong>Email:</strong> ${email}<br>
        </p>

        <p style="font-size: 15px; color: #666;">
          Please reach out to the customer as soon as possible for confirmation and package details.
        </p>

        <a href="https://kashika-travel.anubhavsingh.website/"
           style="display:inline-block; background:#15803d; color:white; padding:10px 20px; border-radius:8px; text-decoration:none;">
          Visit Website
        </a>

        <p style="font-size:13px; color:#888; margin-top:20px;">Stay organized — new leads are waiting!</p>
      </div>

      <div style="background:#f3f4f6; text-align:center; padding:10px; font-size:12px; color:#888;">
        &copy; 2025 Kashi Route. All rights reserved.
      </div>
    </div>
  </div>`;
}

// --- 🚀 Main function to send both mails ---
export async function SendMailCar(data) {
  const user = {
    to: data.to,
    subject: "Thank You for Using Our Car Rent Service",
    message: getUserMessage1(data.carName),
  };

  const host = {
    to: "anubhavsinghcustomer@gmail.com",
    subject: "New Car Booking Request",
    message: getHostMessage1({
      email: data.to,
      userName: data.userName,
    }),
  };

  try {
    const userRes = await sendMail(user);
    const hostRes = await sendMail(host);
    return hostRes.success && userRes.success;
  } catch (err) {
    return false;
  }
}

// 🎨 USER CONFIRMATION TEMPLATE
function getUserMessage(packageName) {
  return `
  <div style="font-family:'Segoe UI',sans-serif;background-color:#f9fafb;padding:25px;color:#333;">
    <div style="max-width:600px;margin:auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.1);">

      <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);color:white;text-align:center;padding:20px;">
        <h1 style="margin:0;">Kashi Route</h1>
        <p style="margin:0;font-size:15px;">Booking Confirmation</p>
      </div>

      <div style="padding:30px;text-align:center;">
        <h2 style="color:#1e40af;">Your Package is Confirmed 🎉</h2>
        <p style="font-size:16px;color:#555;line-height:1.6;">
          Dear Traveler,<br>
          We’re thrilled to confirm your booking for the
          <strong style="color:#2563eb;">${packageName}</strong> package.
          <br><br>
          Our team will reach out shortly with your travel details and itinerary.
        </p>

        <div style="margin-top:20px;">
          <a href="https://kashika-travel.anubhavsingh.website/"
             style="background:#2563eb;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;margin:5px;display:inline-block;">
             View More Packages
          </a>
          <a href="https://portfolio.anubhavsingh.website/"
             style="background:#16a34a;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;margin:5px;display:inline-block;">
             My Portfolio
          </a>
        </div>

        <p style="font-size:14px;color:#666;margin-top:25px;">
          For queries, contact our support team anytime.<br>
          Thank you for choosing <strong>Kashi Route</strong> 🌍
        </p>
      </div>

      <div style="background:#f3f4f6;text-align:center;padding:10px;font-size:12px;color:#888;">
        &copy; 2025 Kashi Route. All rights reserved.
      </div>
    </div>
  </div>`;
}

function getHostMessage({ email, userName, packageName }) {
  return `
  <div style="font-family:'Segoe UI',sans-serif;background-color:#f9fafb;padding:25px;color:#333;">
    <div style="max-width:600px;margin:auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.1);">

      <div style="background:linear-gradient(135deg,#15803d,#166534);color:white;text-align:center;padding:20px;">
        <h1 style="margin:0;">Package Confirmed</h1>
      </div>

      <div style="padding:30px;">
        <h2 style="color:#166534;">Customer Booking Confirmed ✅</h2>
        <p style="font-size:16px;color:#444;">
          <strong>${userName}</strong> has confirmed their booking for the
          <strong style="color:#15803d;">${packageName}</strong> package.
        </p>
        <p style="font-size:15px;color:#555;">
          <strong>Email:</strong> ${email}
        </p>

        <p style="font-size:15px;color:#555;line-height:1.6;">
          Please follow up with the customer to finalize travel plans, payment, and itinerary.
        </p>

        <a href="https://kashika-travel.anubhavsingh.website/"
           style="background:#15803d;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;">
           Manage Booking
        </a>

        <p style="font-size:13px;color:#888;margin-top:20px;">Kashi Route Booking System</p>
      </div>

      <div style="background:#f3f4f6;text-align:center;padding:10px;font-size:12px;color:#888;">
        &copy; 2025 Kashi Route. All rights reserved.
      </div>
    </div>
  </div>`;
}

export async function sendMailPackage(data) {
  console.log("received data ", data);
  const user = {
    to: data.to,
    subject: "Your Package Booking is Confirmed 🎉",
    message: getUserMessage(data.packageName),
  };
  const host = {
    to: "anubhavsinghcustomer@gmail.com",
    subject: "New Package Booking Confirmed",
    message: getHostMessage({
      email: data.to,
      userName: data.userName,
      packageName: data.packageName,
    }),
  };

  try {
    const userRes = await sendMail(user);
    const hostRes = await sendMail(host);
    return hostRes.success && userRes.success;
  } catch (err) {
    return false;
  }
}
