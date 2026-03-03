// src/pages/RequestStatus.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/App.css";
import RequestDetailsModal from "./RequestDetailsModal";

// Map status to badge colors
const statusColors = {
  PENDING: "#FFC107",
  APPROVED: "#9C27B0",
  REJECTED: "#F44336",
  SCHEDULED: "#2196F3",
  COMPLETED: "#4CAF50",
};

const RequestStatus = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || null;

  useEffect(() => {
    const fetchRequests = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(
          `http://localhost:8080/api/ewaste/user/${userId}`
        );
        setRequests(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [userId]);

  return (
    <div className="request-status-page">
      <div className="overlay">
        <h2>📦 Your E-Waste Requests</h2>
        <p>Track your submissions and see their live status updates</p>

        {loading && (
          <div className="global-loader">
            <div className="spinner">
              <img src="/spinner.gif" alt="Loading..." />
              <p>Fetching your requests...</p>
            </div>
          </div>
        )}

        {!loading && requests.length === 0 && (
          <p className="empty-msg">❌ No requests found. Submit one first!</p>
        )}

        {!loading && requests.length > 0 && (
          <div className="request-cards">
            {requests.map((req) => {
              const pickupDateTime = req.pickupDateTime
                ? new Date(req.pickupDateTime)
                : null;

              const pickupDate =
                pickupDateTime?.toLocaleDateString() || "TBD";

              const pickupTime =
                pickupDateTime?.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }) || "TBD";

              const status = req.status?.toUpperCase();

              return (
                <div
                  key={req.requestId}
                  className="request-card"
                  style={{ cursor: "pointer" }}
                >
                  <h3>
                    {req.deviceType} - {req.brand}
                  </h3>

                  <p>
                    <strong>Model:</strong> {req.model || "N/A"}
                  </p>
                  <p>
                    <strong>Condition:</strong> {req.deviceCondition || "N/A"}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {req.qty || "N/A"}
                  </p>
                  <p>
                    <strong>Pickup:</strong> {req.pickupAddress || "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className="status-badge"
                      style={{
                        background: statusColors[status] || "#9E9E9E",
                      }}
                    >
                      {status || "N/A"}
                    </span>
                  </p>

                  {(status === "APPROVED" || status === "SCHEDULED") && (
                    <p className="extra-info">
                      📏 <strong>Allocated Range:</strong>{" "}
                      {req.allocatedRange || "Pending"}
                    </p>
                  )}

                  {status === "COMPLETED" && (
                    <p className="extra-info success">
                      ✅ <strong>Credited Amount:</strong>{" "}
                      ₹{req.paymentAmount ?? "0"}
                    </p>
                  )}

                  {status === "REJECTED" && (
                    <p className="extra-info error">
                      ❌ Reason: {req.rejectionReason || "Not provided"}
                    </p>
                  )}

                  {(status === "SCHEDULED" || status === "COMPLETED") && (
                    <p className="extra-info">
                      📅 Pickup on {pickupDate} at {pickupTime}
                      {req.pickupPersonnelName &&
                        ` by ${req.pickupPersonnelName}`}
                    </p>
                  )}

                  {/* View Image Button */}
                  {req.imageUrl && (
                    <button
                      className="view-image-btn"
                      onClick={() => setSelectedRequest(req)}
                    >
                      🖼️ View Uploaded Image
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Request Details Modal */}
        {selectedRequest && (
          <RequestDetailsModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            updateRequest={(updatedReq) => {
              setRequests((prev) =>
                prev.map((r) =>
                  r.requestId === updatedReq.requestId ? updatedReq : r
                )
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

export default RequestStatus;
