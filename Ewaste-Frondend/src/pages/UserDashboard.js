import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chatbot from "../components/Chatbot"; // import chatbot
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        if (userObj.name) setName(userObj.name);

        // ✅ Fetch request count for eligibility
        if (userObj.id) {
          axios
            .get(`http://localhost:8080/api/ewaste/user/${userObj.id}`)
            .then((res) => {
              setRequestCount(res.data?.length || 0);
            })
            .catch((err) => {
              console.error("Error fetching user requests:", err);
            });
        }
      } catch (err) {
        console.error("Error parsing user:", err);
      }
    }
  }, []);

  const handleCertificateClick = () => {
    if (requestCount < 5) {
      alert("⚠️ You must submit at least 5 requests to generate a certificate.");
      return;
    }
    navigate("/certificate"); // ✅ Eligible → navigate to certificate page
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
      <div className="dashboard-hero">
        <h1>Welcome, {name}!</h1>
        <p>Track your eco-friendly actions and see your impact grow.</p>
        <button onClick={() => navigate("/request-status")}>
          View Request Status
        </button>
      </div>

      <div className="stats-container">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.title}>
            <div className="stat-icon">{stat.icon}</div>
            <h3>{stat.title}</h3>
            <p>{stat.value}</p>
          </div>
        ))}
      </div>

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

      {/* Chatbot Bubble always visible */}
      <Chatbot />
    </div>
  );
};

export default UserDashboard;
