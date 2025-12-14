import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/api";
import "../styles/App.css";
import { AuthContext } from "../App";

const PickupPersonnelLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await loginUser(email, password);
      console.log("PickupPersonnel login response:", response);

      if (!response.user || !response.user.role) {
        setMessage("❌ Unexpected server response.");
        setLoading(false);
        return;
      }

      const role = response.user.role.toUpperCase();

      if (role !== "PICKUP") {
        setMessage("❌ You are not authorized as Pickup Personnel.");
        setLoading(false);
        return;
      }

      // ✅ Extract details
      const token = response.token || "dummy-token"; // replace with real token if backend provides
      const userId = response.user.id;               // backend should return pickup personnel id
      const userName = response.user.name || response.user.email;

      // ✅ Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", "PICKUP");
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", userName);

      // ✅ Update AuthContext
      setAuth({
        token,
        role: "PICKUP",
        userId,
        userName,
      });

      setMessage("✅ Login successful! Redirecting...");
      setTimeout(() => navigate("/pickup-personnel-dashboard"), 500);
    } catch (err) {
      console.error("Login error:", err);
      setMessage("❌ Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-overlay">
        <img src="/logo.png" alt="Logo" />
        <h2>Pickup Personnel Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
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

export default PickupPersonnelLogin;
