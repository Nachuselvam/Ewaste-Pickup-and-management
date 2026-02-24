// src/components/Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/api";
import "../styles/App.css";
import { AuthContext } from "../App";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(email, password); // ✅ Call user login API
      console.log("User login response:", response);

      if (response.user && response.user.role.toLowerCase() === "user") {
        const { id, name, email, role } = response.user;

        setMessage(response.message);

        // ✅ Save user info in localStorage
        localStorage.setItem("user", JSON.stringify({ id, name, email, role }));
        localStorage.setItem("token", "dummy-token"); // Replace later with JWT

        // ✅ Update AuthContext
        setAuth({ token: "dummy-token", role });

        // ✅ Navigate to User Dashboard only
        navigate("/user-dashboard");
      } else {
        setMessage("❌ This login is only for normal users.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("❌ Server error. Please try again later.");
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-overlay">
        <img src="/logo.png" alt="Logo" />
        <h2>User Login</h2>
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

export default Login;
