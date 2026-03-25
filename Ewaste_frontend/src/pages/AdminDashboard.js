import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AdminImageModal from "./AdminImageModal";
import "../styles/App.css";
import { fetchAllRequests } from "../api/api";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pickupPersonnels: 0,
    recycledItems: 0,
  });
  const [showReportModal, setShowReportModal] = useState(false);

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const name = user?.name || "Admin";

  const fetchStats = async () => {
    try {
      const allRequests = await fetchAllRequests();
      setRequests(allRequests);

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
    const interval = setInterval(fetchStats, 10000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const generatePDF = () => {
    if (!requests || requests.length === 0) {
      alert("No requests to generate report.");
      return;
    }

    const doc = new jsPDF("l", "pt", "a4"); // landscape for wide table
    doc.setFontSize(18);
    doc.text("E-Waste Pickup Requests Report", 40, 40);

    const headers = [
      [
        "User ID",
        "Device Type",
        "Brand",
        "Model",
        "Qty",
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
      startY: 60,
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 40, right: 40 },
    });

    doc.save("Ewaste_Requests_Report.pdf");
  };

  const handleViewImages = (req) => {
    let images = [];

    if (req.imagePaths) {
      images = req.imagePaths
        .split(",")
        .map((p) => `http://localhost:8080/${p.trim().replace(/\\/g, "/")}`);
    } else if (req.imageUrl) {
      images = [req.imageUrl];
    }

    setSelectedImages(images);
    setShowImageModal(true);
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

  // Modal styles
  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  };

  const modalContentStyle = {
    background: "#fefefe",
    borderRadius: "12px",
    width: "95%",
    maxWidth: "1400px",
    maxHeight: "90vh",
    overflow: "auto",
    padding: "25px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  };

  const tableContainerStyle = {
    width: "100%",
    overflowX: "auto",
    marginTop: "20px",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
  };

  const thStyle = {
    backgroundColor: "#2980b9",
    color: "#fff",
    padding: "8px 12px",
    textAlign: "left",
    border: "1px solid #ddd",
  };

  const tdStyle = {
    padding: "8px 12px",
    border: "1px solid #ddd",
  };

  const alternateRowStyle = { backgroundColor: "#f4f6f7" };

  const modalActionsStyle = {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between",
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-hero">
        <h1>👨‍💼 Welcome, {name}!</h1>
        <p>Manage your system and track eco-friendly activities efficiently.</p>
        <button className="report-btn" onClick={() => setShowReportModal(true)}>
          📊 Generate Report
        </button>
      </div>

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

      <div className="admin-actions">
        <div className="action-box" onClick={() => navigate("/pickup-personnels")}>
          👥 Manage Pickup Personnels
        </div>
        <div className="action-box" onClick={() => navigate("/admin-requests")}>
          📦 View Requests
        </div>
        <div className="action-box" onClick={() => navigate("/settings")}>
          ⚙️ Settings
        </div>
      </div>

      {/* ✅ Report Modal */}
      {showReportModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2>📄 E-Waste Requests Preview</h2>
            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>User ID</th>
                    <th style={thStyle}>Device</th>
                    <th style={thStyle}>Brand</th>
                    <th style={thStyle}>Model</th>
                    <th style={thStyle}>Qty</th>
                    <th style={thStyle}>Pickup Address</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Pickup Date/Time</th>
                    <th style={thStyle}>Remarks</th>
                    <th style={thStyle}>Image</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r, idx) => (
                    <tr
                      key={r.id || r.requestId}
                      style={idx % 2 === 0 ? alternateRowStyle : {}}
                    >
                      <td style={tdStyle}>{r.userId || "N/A"}</td>
                      <td style={tdStyle}>{r.deviceType || "N/A"}</td>
                      <td style={tdStyle}>{r.brand || "N/A"}</td>
                      <td style={tdStyle}>{r.model || "N/A"}</td>
                      <td style={tdStyle}>{r.qty || r.quantity || "N/A"}</td>
                      <td style={tdStyle}>{r.pickupAddress || "N/A"}</td>
                      <td style={tdStyle}>{r.status || "N/A"}</td>
                      <td style={tdStyle}>
                        {r.pickupDateTime
                          ? new Date(r.pickupDateTime).toLocaleString()
                          : "Not Scheduled"}
                      </td>
                      <td style={tdStyle}>{r.remarks || "N/A"}</td>
                      <td style={tdStyle}>
                        {r.status === "Pending" && (
                          <button onClick={() => handleViewImages(r)}>🖼️ View</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={modalActionsStyle}>
              <button onClick={generatePDF}>💾 Download PDF</button>
              <button onClick={() => setShowReportModal(false)}>✖ Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Image Modal */}
      {showImageModal && (
        <AdminImageModal
          images={selectedImages}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
