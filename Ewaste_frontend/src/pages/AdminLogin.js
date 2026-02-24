// src/components/AdminLogin.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import { AuthContext } from "../App";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Admin login response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.user && data.user.role.toLowerCase() === "admin") {
        const { id, name, email, role } = data.user;

        setMessage(data.message);

        // ✅ Save admin info in localStorage
        localStorage.setItem("user", JSON.stringify({ id, name, email, role }));
        localStorage.setItem("token", "dummy-token"); // Replace later with JWT

        // ✅ Update AuthContext
        setAuth({ token: "dummy-token", role });

        // ✅ Navigate to Admin Dashboard only
        navigate("/admin-dashboard");
      } else {
        setMessage("❌ This login is only for admins.");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      setMessage("❌ Server error. Please try again later.");
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-overlay">
        <img src="/logo.png" alt="Logo" />
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "15px",
              color: message.toLowerCase().includes("successful")
                ? "green"
                : "red",
              fontWeight: "500",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
