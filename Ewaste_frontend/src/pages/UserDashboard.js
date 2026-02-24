import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chatbot from "../components/Chatbot";
import { fetchWalletBalance } from "../api/api"; // using helper API
import axios from "axios";
import "../styles/App.css";

const stats = [
  { title: "Points", value: "1200", icon: "⭐" },
  { title: "Recycled Items", value: "75", icon: "♻️" },
  { title: "Eco Score", value: "88%", icon: "🌿" },
];

const featureCards = [
  { title: "Request Form", icon: "📝", route: "/request-form" },
  { title: "Certificate", icon: "🎓", route: "/certificate" },
  { title: "Profile Settings", icon: "⚙️", route: "/profile-settings" },
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("User");
  const [requestCount, setRequestCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    try {
      const userObj = JSON.parse(storedUser);

      if (userObj.name) setName(userObj.name);

      if (userObj.id) {
        // Fetch user requests count
        axios
          .get(`http://localhost:8080/api/ewaste/user/${userObj.id}`)
          .then((res) => setRequestCount(res.data?.length || 0))
          .catch((err) =>
            console.error("Error fetching user requests:", err)
          );

        // Fetch wallet balance using correct API endpoint
        fetchWalletBalance(userObj.id)
          .then((data) => setWalletBalance(data.balance || 0))
          .catch((err) =>
            console.error("Error fetching wallet balance:", err)
          );
      }
    } catch (err) {
      console.error("Error parsing user from localStorage:", err);
    }
  }, []);

  // Certificate logic
  const handleCertificateClick = () => {
    if (requestCount < 5) {
      alert(
        "⚠️ You must submit at least 5 requests to generate a certificate."
      );
      return;
    }
    navigate("/certificate");
  };

  const handleFeatureClick = (feature) => {
    if (feature.title === "Certificate") {
      handleCertificateClick();
    } else {
      navigate(feature.route);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-hero" style={{ position: "relative" }}>
        {/* 💰 Wallet Button */}
        <div
          onClick={() => navigate("/transactions")}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "black",
            padding: "8px 14px",
            borderRadius: "20px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: "bold",
            color: "white",
            zIndex: 10,
          }}
          title="My Wallet"
        >
          💰
          <span>
            {walletBalance.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
              minimumFractionDigits: 2,
            })}
          </span>
        </div>

        <h1>Welcome, {name}!</h1>
        <p>Track your eco-friendly actions and see your impact grow.</p>
        <button onClick={() => navigate("/request-status")}>
          View Request Status
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.title}>
            <div className="stat-icon">{stat.icon}</div>
            <h3>{stat.title}</h3>
            <p>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div className="features-dashboard">
        {featureCards.map((feature) => (
          <div
            className="feature-box"
            key={feature.title}
            onClick={() => handleFeatureClick(feature)}
          >
            <span className="feature-icon">{feature.icon}</span>
            {feature.title}
          </div>
        ))}
      </div>

      {/* Chatbot Bubble */}
      <Chatbot />
    </div>
  );
};

export default UserDashboard;
