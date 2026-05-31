# 🌍 KashiRoute - AI Powered Booking System

**KashiRoute** is an AI-powered travel and tour booking platform based in **Varanasi (Kashi)**.
The name **KashiRoute** represents that **every travel package and journey offered through this platform begins from Kashi.**
Our goal is to provide comfortable, affordable, and well-organized tours starting from one of India's oldest and most spiritual cities with intelligent AI-assisted booking.

---

## 🔗 Live Preview

- **Website:** https://kashiroute.nav-code.com/

### 🖼️ Preview

<p align="center">
  <img src="https://kashiroute.nav-code.com/assets/images/websiteImg.png" alt="KashiRoute Preview" width="850px" />
</p>

---

## 🏠 User Features

| Feature                             | Description                                                                                           |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Home Page**                       | Modern and visually appealing introduction to Kashi and our services                                  |
| **About Us**                        | Information about KashiRoute and our travel approach                                                  |
| **Packages**                        | Browse travel packages — every package starts from Kashi                                              |
| **Cars**                            | Explore cars available for hire for city and outstation travel                                        |
| **Book Package**                    | Book your preferred travel package easily                                                             |
| **Book Car**                        | Rent a car with required details and pricing                                                          |
| **Booking History**                 | Users can check all past bookings anytime                                                             |
| **Contact Page**                    | Users can send queries or contact the support team                                                    |
| **User Forgot Password**            | Secure authentication and recovery                                                                    |
| **🤖 AI Powered Booking System**    | Intelligent booking system powered by Grok AI for instant travel assistance and smart recommendations |
| **📧 OTP Verification**             | OTP is sent to user's email via **custom Mail API** during authentication or sensitive actions        |
| **🔔 Booking Update Notifications** | Booking confirmation and status updates are automatically emailed to the user                         |

---

## 🔑 Admin Panel Features

| Feature                            | Description                                                         |
| ---------------------------------- | ------------------------------------------------------------------- |
| **Admin Login & Forgot Password**  | Secure authentication and recovery                                  |
| **Manage Packages**                | Add / Update / Delete travel packages                               |
| **Manage Cars**                    | Add / Update / Delete available cars (Admin managed)                |
| **View All Bookings**              | Check bookings from all users                                       |
| **Update Booking Status**          | Admin can update booking status and user receives mail notification |
| **View All Users**                 | View user accounts and their roles                                  |
| **Change User Roles**              | Users can be assigned `user` or `host` roles                        |
| **Independent Frontend & Backend** | Clean, professional architecture                                    |

---

## 🏗️ Tech Stack

| Layer                        | Technologies                              |
| ---------------------------- | ----------------------------------------- |
| **Frontend**                 | HTML, Tailwind CSS, JavaScript            |
| **Backend**                  | Node.js, Express.js                       |
| **Database**                 | MongoDB                                   |
| **Caching**                  | Redis (Session & Data Caching)            |
| **AI Integration**           | Grok AI API (Chatbot & Intent Detection)  |
| **Email Notification / OTP** | Custom Mail API (Node Mailer API / SMTP)  |
| **Authentication**           | JWT / Sessions                            |
| **Payment Gateway**          | Razorpay API                              |
| **Security**                 | bcryptjs, Crypto, CORS, HTTP-Only Cookies |
| **Deployment**               | Vercel / Render / Koyeb                   |

---

## 💳 Payment System

### How It Works

KashiRoute integrates with **Razorpay**, a secure payment gateway for processing bookings:

1. **Order Creation**
   - When user initiates a booking (car or package), the backend creates a Razorpay order
   - Order includes amount (converted to paise), booking details, and user information
   - Each order gets a unique receipt ID for tracking

2. **Payment Processing**
   - Frontend redirects user to Razorpay checkout interface
   - Razorpay handles secure payment card/UPI processing
   - Payment details never directly expose sensitive data

3. **Payment Verification**
   - Backend receives payment callback from Razorpay
   - Signature verification using crypto algorithms ensures payment authenticity
   - Payment record saved with status (pending, success, failed)

4. **Database Storage**
   - Payment data stored in MongoDB with fields:
     - `userId`: Reference to user making payment
     - `orderId`: Razorpay order identifier
     - `paymentId`: Razorpay payment confirmation ID
     - `amount`: Transaction amount in INR
     - `status`: Payment status tracking
     - `bookingType`: Either "car" or "package"
     - `bookingDetails`: Associated booking information

### Types

```javascript
// Payment Model Schema
{
  userId: ObjectId,           // Reference to User
  orderId: String,            // Razorpay Order ID
  paymentId: String,          // Razorpay Payment ID
  amount: Number,             // Amount in INR
  currency: String,           // Default: "INR"
  status: Enum,               // "pending" | "success" | "failed"
  receiptId: String,          // Unique receipt identifier
  bookingType: Enum,          // "car" | "package"
  bookingDetails: Object,     // Booking metadata
  createdAt: Date,            // Transaction timestamp
  updatedAt: Date             // Last update timestamp
}

// Booking Types Supported
type BookingType = "car" | "package";

// Payment Status States
type PaymentStatus = "pending" | "success" | "failed";
```

---

## 🔐 Security Features

### Authentication & Authorization

- **Password Hashing**: Passwords secured with bcryptjs (industry-standard hashing algorithm)
- **JWT Tokens**: JSON Web Tokens for stateless authentication with 7-day expiration
- **Session Management**: HTTP-only cookies prevent XSS attacks
  - Cookies marked `httpOnly: true` - inaccessible via JavaScript
  - `Secure` flag enabled in production (HTTPS only)
  - `SameSite` policy prevents CSRF attacks

### API Security

- **CORS Protection**: Restricted to authorized domains
  - Development and production URLs configured separately
  - Credentials allowed only for trusted origins
- **Environment-based Security**: Different configurations for dev/prod environments
- **Raw Body Verification**: Middleware preserves raw request body for payment signature validation

### Data Protection

- **OTP Verification**
  - One-Time Passwords for email verification
  - OTP expires after set time period
  - Rate limiting: Users can request new OTP after 30 seconds
  - Prevents brute force attempts with attempt tracking

- **Payment Security**
  - Signature verification using cryptographic hashing
  - Payment gateway handles PCI compliance
  - No sensitive card data stored in database
  - Transaction verification before booking confirmation

- **User Input Validation**
  - Amount validation (positive numbers only)
  - Booking type validation ("car" or "package")
  - Required field verification
  - Data type checking

### Role-Based Access Control

- **User Roles**: `guest`, `user`, `host`, `admin`
- **Admin Endpoints**: Protected routes for admin-only operations
- **User History**: Each user can only access their own booking history
- **Permission Verification**: Backend validates user roles before sensitive operations

### Email Security

- **OTP Delivery**: Secure email transmission for verification codes
- **Password Reset**: Separate secure email flow for account recovery
- **Booking Notifications**: Automated email updates for booking status changes
- **Admin Alerts**: Admin notifications for user type change requests

---

---

## 📂 Project Directory

KashiRoute/

├─ frontend/ # User & Admin UI

├─ backend/ # API, DB Models, Mail API, Auth, Controllers

└─ README.md

yaml
Copy code

---

## 👤 User Roles

| Role      | Capabilities                                                              |
| --------- | ------------------------------------------------------------------------- |
| **User**  | Book cars & packages, view booking history, receive OTP & booking updates |
| **Host**  | (Optional role) Can manage some listings                                  |
| **Admin** | Full dashboard control & notification control                             |

---

## 📧 Contact & Support

**Developer:** Anubhav Singh

**For Collaboration / Support:** _(anubhavsingh2027@gmail.com)_

---

## ⭐ Contributions

If you find this project useful, consider giving it a **star ⭐** and contributing through issues or pull requests.

---

### 🙏 Thank You for Using _KashiRoute_ —

**Every Journey Begins from Kashi.**

![ThankYou For Visiting My GitHub Profile](https://app.chatting.nav-code.com/detector/newUser/kashiroute-github)
