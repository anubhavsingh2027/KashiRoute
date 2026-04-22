import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ServerLoader from "./components/ServerLoader";

// Pages

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import CarBookingPage from "./pages/CarBookingPage";
import PackageBookingPage from "./pages/PackageBookingPage";
import CarDetailsPage from "./pages/CarDetailsPage";
import PackageDetailsPage from "./pages/PackageDetailsPage";
import UserHistoryPage from "./pages/UserHistoryPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// Admin Pages
import AdminHistoryPage from "./pages/AdminHistoryPage";
import AdminCarPage from "./pages/AdminCarPage";
import AdminPackagePage from "./pages/AdminPackagePage";
import AdminUsersPage from "./pages/AdminUsersPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ServerLoader />}>
        <Route index element={<ServerLoader />} />

        {/* User Pages */}
        <Route path="home" element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="unauthorsised" element={<UnauthorizedPage />} />
        <Route path="unauthorised" element={<UnauthorizedPage />} />
        <Route path="unauthorsisedAccess" element={<UnauthorizedPage />} />

        {/* Booking Pages */}
        <Route path="carBook" element={<CarBookingPage />} />
        <Route path="carBook" element={<CarBookingPage />} />
        <Route path="car-book" element={<CarBookingPage />} />
        <Route path="packageBook" element={<PackageBookingPage />} />
        <Route path="package-book" element={<PackageBookingPage />} />

        {/* Details Pages */}
        <Route path="carDetails" element={<CarDetailsPage />} />
        <Route path="car-details" element={<CarDetailsPage />} />
        <Route path="car-details/:id" element={<CarDetailsPage />} />
        <Route path="packageDetails" element={<PackageDetailsPage />} />
        <Route path="packagedetails" element={<PackageDetailsPage />} />
        <Route path="package-details" element={<PackageDetailsPage />} />
        <Route path="package-details/:id" element={<PackageDetailsPage />} />

        {/* User Features */}
        <Route path="history" element={<UserHistoryPage />} />
        <Route path="userHistory" element={<UserHistoryPage />} />
        <Route path="user-history" element={<UserHistoryPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />

        {/* Admin Pages */}
        <Route path="adminHistory" element={<AdminHistoryPage />} />
        <Route path="allBookingHistory" element={<AdminHistoryPage />} />
        <Route path="admin-history" element={<AdminHistoryPage />} />

        <Route path="adminCarSet" element={<AdminCarPage />} />
        <Route path="carSet" element={<AdminCarPage />} />
        <Route path="CarAdd" element={<AdminCarPage />} />
        <Route path="admin-cars" element={<AdminCarPage />} />

        <Route path="adminPackageSet" element={<AdminPackagePage />} />
        <Route path="packageSet" element={<AdminPackagePage />} />
        <Route path="PackageAdd" element={<AdminPackagePage />} />
        <Route path="admin-packages" element={<AdminPackagePage />} />

        <Route path="adminUsers" element={<AdminUsersPage />} />
        <Route path="userTypeAccess" element={<AdminUsersPage />} />
        <Route path="admin-users" element={<AdminUsersPage />} />

        {/* Fallback */}
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
}

export default App;
