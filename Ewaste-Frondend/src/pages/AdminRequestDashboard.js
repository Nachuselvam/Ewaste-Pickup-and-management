import React, { useState, useEffect } from "react";
import { 
  fetchAllRequests, 
  fetchRequestsByStatus, 
  approveRequest, 
  rejectRequest 
} from "../api/api";
import SchedulePickupModal from "./SchedulePickupModal";
import "../styles/App.css";

const AdminRequestDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [popupMessage, setPopupMessage] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  useEffect(() => {
    fetchRequests("All");
  }, []);

  const fetchRequests = async (status) => {
    try {
      setLoading(true);
      let data;

      if (status === "All") {
        data = await fetchAllRequests();
      } else {
        data = await fetchRequestsByStatus(status);
      }

      const normalized = data.map((r) => ({
        ...r,
        id: r.id || r.requestId,
      }));

      setRequests(normalized);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === "approve") {
        await approveRequest(id);
        setRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, status: "Approved" } : req
          )
        );
        showPopup("✅ Request approved successfully!");
      } else if (action === "reject") {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        await rejectRequest(id, reason);
        setRequests((prev) =>
          prev.map((req) =>
            req.id === id
              ? { ...req, status: "Rejected", rejectionReason: reason }
              : req
          )
        );
        showPopup("❌ Request rejected successfully!");
      }
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
      showPopup(`⚠️ Failed to ${action} request.`);
    }
  };

  const showPopup = (msg) => {
    setPopupMessage(msg);
    setTimeout(() => setPopupMessage(""), 2500);
  };

  const handleScheduled = (updatedRequest) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === updatedRequest.requestId ? updatedRequest : req
      )
    );
    showPopup("✅ Pickup scheduled successfully!");
  };

  return (
    <div className="request-status-page">
      <div className="overlay">
        <h2>📦 All User Requests (Admin)</h2>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          {["All", "Pending", "Approved", "Rejected", "Scheduled", "Completed"].map((status) => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? "active" : ""}`}
              onClick={() => {
                setFilter(status);
                fetchRequests(status);
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="global-loader">
            <div className="spinner">
              <img src="/spinner.gif" alt="Loading..." />
              <p>Loading requests...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && requests.length === 0 && (
          <p className="empty-msg">No requests found.</p>
        )}

        {/* Requests List */}
        {!loading && requests.length > 0 && (
          <div className="request-cards">
            {requests.map((req) => (
              <div
                key={req.id}
                className={`request-card status-${req.status?.toLowerCase()}`}
              >
                <h3>{req.deviceType} - {req.brand}</h3>
                <p><strong>Model:</strong> {req.model || "N/A"}</p>
                <p><strong>Condition:</strong> {req.condition || req.deviceCondition || "N/A"}</p>
                <p><strong>Quantity:</strong> {req.qty || "N/A"}</p>
                <p><strong>Pickup:</strong> {req.pickupAddress || "N/A"}</p>
                <p><strong>Remarks:</strong> {req.remarks || "None"}</p>

                {(req.status === "Scheduled" || req.status === "Completed") && (
                  <p><strong>Pickup Personnel:</strong> {req.pickupPersonnelName || "TBD"}</p>
                )}

                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status-badge ${req.status?.toLowerCase()}`}>
                    {req.status}
                  </span>
                </p>

                {req.status === "Rejected" && (
                  <p className="extra-info">❌ Reason: {req.rejectionReason || "Not provided"}</p>
                )}

                {req.status === "Pending" && (
                  <div className="action-buttons">
                    <button onClick={() => handleAction(req.id, "approve")}>✅ Accept</button>
                    <button onClick={() => handleAction(req.id, "reject")}>❌ Reject</button>
                  </div>
                )}

                {req.status === "Approved" && (
                  <button
                    className="schedule-btn"
                    onClick={() => setSelectedRequestId(req.id)}
                  >
                    📅 Schedule Pickup
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRequestId && (
        <SchedulePickupModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
          onScheduled={handleScheduled}
        />
      )}

      {popupMessage && (
        <div className="popup-overlay">
          <div className="popup-box">{popupMessage}</div>
        </div>
      )}
    </div>
  );
};

export default AdminRequestDashboard;
