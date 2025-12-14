// src/pages/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/App.css";
import { fetchAllRequests } from "../api/api"; // API helper

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pickupPersonnels: 0,
    recycledItems: 0,
  });
  const [showReportModal, setShowReportModal] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const name = user?.name || "Admin";

  // Fetch stats and requests
  const fetchStats = async () => {
    try {
      const allRequests = await fetchAllRequests(); // API helper
      setRequests(allRequests);

      // Compute stats
      const totalUsers = new Set(
        allRequests.filter((r) => r.userId).map((r) => r.userId)
      ).size;

      const pickupPersonnels = new Set(
        allRequests
          .filter((r) => r.pickupPersonnelId)
          .map((r) => r.pickupPersonnelId)
      ).size;

      const recycledItems = allRequests.filter(
        (r) => r.status && r.status.toLowerCase() === "completed"
      ).length;

      setStats({ totalUsers, pickupPersonnels, recycledItems });
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    const timer = setTimeout(() => setLoading(false), 1000);
    const interval = setInterval(fetchStats, 10000); // refresh every 10s
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Generate simplified PDF
  const generatePDF = () => {
    if (!requests || requests.length === 0) {
      alert("No requests to generate report.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("E-Waste Pickup Requests Report", 14, 22);

    const headers = [
      [
        "User ID",
        "Device Type",
        "Brand",
        "Model",
        "Quantity",
        "Pickup Address",
        "Status",
        "Pickup Date/Time",
        "Remarks",
      ],
    ];

    const rows = requests.map((r) => [
      r.userId || "N/A",
      r.deviceType || "N/A",
      r.brand || "N/A",
      r.model || "N/A",
      r.qty || r.quantity || "N/A",
      r.pickupAddress || "N/A",
      r.status || "N/A",
      r.pickupDateTime
        ? new Date(r.pickupDateTime).toLocaleString()
        : "Not Scheduled",
      r.remarks || "N/A",
    ]);

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save("Ewaste_Requests_Report.pdf");
  };

  if (loading) {
    return (
      <div className="global-loader">
        <div className="spinner">
          <img src="/spinner.gif" alt="Loading..." />
          <p>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Hero Section */}
      <div className="admin-hero">
        <h1>👨‍💼 Welcome, {name}!</h1>
        <p>Manage your system and track eco-friendly activities efficiently.</p>
        <button
          className="report-btn"
          onClick={() => setShowReportModal(true)}
        >
          📊 Generate Report
        </button>
      </div>

      {/* Stats Section */}
      <div className="admin-stats-container">
        <div className="admin-stat-card white-card">
          <div className="stat-icon">👥</div>
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="admin-stat-card white-card">
          <div className="stat-icon">🚚</div>
          <h3>Pickup Personnels</h3>
          <p>{stats.pickupPersonnels}</p>
        </div>
        <div className="admin-stat-card white-card">
          <div className="stat-icon">♻️</div>
          <h3>Recycled Items</h3>
          <p>{stats.recycledItems}</p>
        </div>
      </div>

      {/* Actions Section */}
      <div className="admin-actions">
        <div
          className="action-box"
          onClick={() => navigate("/pickup-personnels")}
        >
          👥 Manage Pickup Personnels
        </div>
        <div
          className="action-box"
          onClick={() => navigate("/admin-requests")}
        >
          📦 View Requests
        </div>
        <div
          className="action-box"
          onClick={() => navigate("/settings")}
        >
          ⚙️ Settings
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>E-Waste Requests Preview</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Device</th>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Qty</th>
                    <th>Pickup Address</th>
                    <th>Status</th>
                    <th>Pickup Date/Time</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td>{r.userId}</td>
                      <td>{r.deviceType}</td>
                      <td>{r.brand}</td>
                      <td>{r.model}</td>
                      <td>{r.qty}</td>
                      <td>{r.pickupAddress}</td>
                      <td>{r.status}</td>
                      <td>
                        {r.pickupDateTime
                          ? new Date(r.pickupDateTime).toLocaleString()
                          : "Not Scheduled"}
                      </td>
                      <td>{r.remarks || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-actions">
              <button onClick={generatePDF}>💾 Download PDF</button>
              <button onClick={() => setShowReportModal(false)}>✖ Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
