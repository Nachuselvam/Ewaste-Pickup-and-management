// src/components/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/api"; // backend API
import "../styles/App.css";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match!");
      return;
    }

    const userData = {
      name: fullName,
      email,
      password,
      phone: "",           // optional fields
      address: "",
      profilePictureUrl: "",
      role: "USER",        // default role added
    };

    try {
      const response = await registerUser(userData);

      // Handle backend message
      const msg = response?.message || "❌ Registration failed!";
      setMessage(msg);

      if (msg.toLowerCase().includes("successful")) {
        setTimeout(() => navigate("/login"), 1000);
      }
    } catch (err) {
      console.error("Registration API error:", err);
      setMessage("❌ Registration failed. Please try again.");
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-overlay">
        <img src="/logo.png" alt="Logo" />
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Register</button>
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

export default Register;
