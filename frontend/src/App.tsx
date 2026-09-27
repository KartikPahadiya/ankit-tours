import {
  Route,
  Routes,
} from "react-router-dom";

import ScrollToTop from "./components/common/ScrollToTop";

import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStays from "./pages/admin/AdminStays";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminSafaris from "./pages/admin/AdminSafaris";
import AdminCustomPlans from "./pages/admin/AdminCustomPlans";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StayDetails from "./pages/StayDetails";
import TourPackages from "./pages/TourPackages";
import SafariPage from "./pages/SafariPage";
import AboutPage from "./pages/AboutPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Stays from "./pages/Stays";
import MyBookings from "./pages/MyBookings";
import Checkout from "./pages/Checkout";
import BookingSuccess from "./pages/BookingSuccess";
import BookingDetails from "./pages/BookingDetails";
import FaqPage from "./pages/FaqPage";
import TermsPage from "./pages/TermsPage";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>

      {/* Public */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/stays"
        element={<Stays />}
      />

      <Route
        path="/stays/:slug"
        element={<StayDetails />}
      />

      <Route
        path="/faq"
        element={<FaqPage />}
      />

      <Route
        path="/terms"
        element={<TermsPage />}
      />

      <Route
        path="/tour-packages"
        element={<TourPackages />}
      />

      <Route
        path="/safari"
        element={<SafariPage />}
      />

      <Route
        path="/about"
        element={<AboutPage />}
      />

      {/* Admin */}

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/stays"
            element={<AdminStays />}
          />

          <Route
            path="/admin/packages"
            element={<AdminPackages />}
          />

          <Route
            path="/admin/safaris"
            element={<AdminSafaris />}
          />

          <Route
            path="/admin/custom-plans"
            element={<AdminCustomPlans />}
          />

          <Route
            path="/admin/bookings"
            element={<AdminBookings />}
          />

          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />
        </Route>
      </Route>

      {/* Protected */}

      <Route element={<ProtectedRoute />}>

        <Route
          path="/my-bookings"
          element={<MyBookings />}
        />

        <Route
          path="/account/bookings/:bookingId"
          element={<BookingDetails />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/booking-success"
          element={<BookingSuccess />}
        />

      </Route>

    </Routes>
    </>
  );
}

export default App;
