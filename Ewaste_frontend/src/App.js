import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRequestDashboard from "./pages/AdminRequestDashboard";
import EwasteRequestForm from "./pages/EwasteRequestForm";
import RequestStatus from "./pages/RequestStatus";
import ProfileSettings from "./pages/ProfileSettings";
import CertificatePreview from "./pages/CertificatePreview";
import Transactions from "./pages/MyTransactions";

// Admin Pages
import PickupPersonnelList from "./pages/PickupPersonnelList";
import AddPickupPersonnel from "./pages/AddPickupPersonnel";

// Pickup Personnel Pages
import PickupPersonnelLogin from "./pages/PickupPersonnelLogin";
import PickupPersonnelDashboard from "./pages/PickupPersonnelDashboard";
import AssignedRequestsPage from "./pages/AssignedRequestsPage";

// User Chatbot Page
import ChatbotPage from "./components/Chatbot";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// ✅ Stripe Pages
import RedeemWallet from "./pages/RedeemWallet";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

// Auth Context
export const AuthContext = React.createContext();

// Loader
const Loader = () => (
  <div className="global-loader">
    <div className="spinner">
      <img src="/spinner.gif" alt="Loading..." />
      <p>Loading, please wait...</p>
    </div>
  </div>
);

function App() {

  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
    userId: localStorage.getItem("userId"),
    userName: localStorage.getItem("userName"),
  });

  // ✅ CREATE USER OBJECT (FIX FOR ERROR)
  const user = {
    id: auth.userId,
    name: auth.userName,
  };

  // Persist auth
  useEffect(() => {
    if (auth.token) {
      localStorage.setItem("token", auth.token);
      localStorage.setItem("role", auth.role);
      if (auth.userId) localStorage.setItem("userId", auth.userId);
      if (auth.userName) localStorage.setItem("userName", auth.userName);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <Router>
        <div className="app-container">

          <Navbar />

          <Suspense fallback={<Loader />}>
            <main className="page-wrapper">
              <Routes>

                {/* PUBLIC */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/pickup-login" element={<PickupPersonnelLogin />} />

                {/* USER ROUTES */}
                <Route
                  path="/user-dashboard"
                  element={
                    <ProtectedRoute role="USER">
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/request-form"
                  element={
                    <ProtectedRoute role="USER">
                      <EwasteRequestForm />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/request-status"
                  element={
                    <ProtectedRoute role="USER">
                      <RequestStatus />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/certificate"
                  element={
                    <ProtectedRoute role="USER">
                      <CertificatePreview />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/chatbot"
                  element={
                    <ProtectedRoute role="USER">
                      <ChatbotPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute role="USER">
                      <Transactions />
                    </ProtectedRoute>
                  }
                />

                {/* ✅ WALLET REDEEM (STRIPE) */}
                <Route
                  path="/redeem"
                  element={
                    <ProtectedRoute role="USER">
                      <RedeemWallet user={user} />
                    </ProtectedRoute>
                  }
                />

                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancel" element={<PaymentCancel />} />

                {/* ADMIN */}
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute role="ADMIN">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin-requests"
                  element={
                    <ProtectedRoute role="ADMIN">
                      <AdminRequestDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/pickup-personnels"
                  element={
                    <ProtectedRoute role="ADMIN">
                      <PickupPersonnelList />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/add-pickup-person"
                  element={
                    <ProtectedRoute role="ADMIN">
                      <AddPickupPersonnel />
                    </ProtectedRoute>
                  }
                />

                {/* PICKUP */}
                <Route
                  path="/pickup-personnel-dashboard"
                  element={
                    <ProtectedRoute role="PICKUP">
                      <PickupPersonnelDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/assigned-requests"
                  element={
                    <ProtectedRoute role="PICKUP">
                      <AssignedRequestsPage />
                    </ProtectedRoute>
                  }
                />

                {/* PROFILE */}
                <Route path="/profile-settings" element={<ProfileSettings />} />

                {/* FALLBACK */}
                <Route path="*" element={<Navigate to="/" replace />} />

              </Routes>
            </main>
          </Suspense>

          <Footer />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;