import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import API from "../api/api";
import "../styles/App.css";

const PickupPersonnelDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assigned: 0,
    completed: 0,
    pending: 0,
  });
  const navigate = useNavigate();

  // Fetch assigned requests and calculate stats
  const fetchAssignedStats = useCallback(async () => {
    if (!auth || !auth.userId) return;

    try {
      const res = await API.get(`/ewaste/pickup-requests?personnelId=${auth.userId}`);
      const requests = Array.isArray(res.data) ? res.data : [];

      const assignedCount = requests.length;
      const completedCount = requests.filter(r => r.status?.toUpperCase() === "COMPLETED").length;
      const pendingCount = requests.filter(r => r.status?.toUpperCase() !== "COMPLETED").length;

      setStats({
        assigned: assignedCount,
        completed: completedCount,
        pending: pendingCount,
      });

      console.log("Pickup personnel stats fetched:", { assignedCount, completedCount, pendingCount });
    } catch (err) {
      console.error("Error fetching assigned requests:", err);
    }
  }, [auth]);

  useEffect(() => {
    fetchAssignedStats(); // fetch stats on mount
    const interval = setInterval(fetchAssignedStats, 10000); // update every 10 seconds
    setLoading(false); // remove loader after first fetch
    return () => clearInterval(interval);
  }, [fetchAssignedStats]);

  const name = auth?.name || "Pickup Personnel";

  if (loading) {
    return (
      <div className="global-loader">
        <div className="spinner">
          <img src="/spinner.gif" alt="Loading..." />
          <p>Loading Pickup Personnel Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pickup-dashboard-container">
      {/* Hero Section */}
      <div className="pickup-hero" style={{ backgroundColor: "#4CAF50", color: "#fff" }}>
        <h1>👋 Welcome, {name}!</h1>
        <p>Track your pickups and manage requests efficiently.</p>
      </div>

      {/* Stats Section */}
      <div className="pickup-stats-container">
        <div className="pickup-stat-card" style={{ backgroundColor: "#e8f5e9", border: "1px solid #4CAF50" }}>
          <div className="stat-icon">📦</div>
          <h3>Assigned Requests</h3>
          <p>{stats.assigned}</p>
        </div>
        <div className="pickup-stat-card" style={{ backgroundColor: "#e8f5e9", border: "1px solid #4CAF50" }}>
          <div className="stat-icon">✅</div>
          <h3>Completed Pickups</h3>
          <p>{stats.completed}</p>
        </div>
        <div className="pickup-stat-card" style={{ backgroundColor: "#e8f5e9", border: "1px solid #4CAF50" }}>
          <div className="stat-icon">⏳</div>
          <h3>Pending Pickups</h3>
          <p>{stats.pending}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="pickup-actions">
        <div
          className="action-box"
          style={{ cursor: "pointer", backgroundColor: "#a5d6a7" }}
          onClick={() => navigate("/assigned-requests")}
        >
          📦 View Assigned Requests
        </div>

        <div
          className="action-box"
          style={{ cursor: "pointer", backgroundColor: "#81c784" }}
          onClick={() => navigate("/profile-settings")}
        >
          ⚙️ Profile & Settings
        </div>

        <div
          className="action-box"
          style={{ cursor: "pointer", backgroundColor: "#66bb6a" }}
          onClick={() => navigate("/ratings")} // navigate to ratings page
        >
          ⭐ Ratings
        </div>
      </div>
    </div>
  );
};

export default PickupPersonnelDashboard;
