// src/pages/AssignedRequestsPage.js
import React, { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../App";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";

const statusColors = {
  PENDING: "#FFC107",
  APPROVED: "#9C27B0",
  REJECTED: "#F44336",
  SCHEDULED: "#2196F3",
  COMPLETED: "#4CAF50",
};

const AssignedRequestsPage = () => {
  const { auth } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpModal, setOtpModal] = useState({ visible: false, requestId: null });
  const [otpInput, setOtpInput] = useState("");
  const [otpRequestedIds, setOtpRequestedIds] = useState([]); // track OTP requested
  const navigate = useNavigate();

  // Fetch assigned requests
  const fetchRequests = useCallback(async () => {
    if (!auth?.userId) {
      setLoading(false);
      return;
    }
    try {
      const response = await API.get("/ewaste/pickup-requests", {
        params: { personnelId: auth.userId },
      });
      const data = Array.isArray(response.data) ? response.data : [];
      setRequests(data);
    } catch (err) {
      console.error("Error fetching assigned requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000); // auto refresh every 10s
    return () => clearInterval(interval);
  }, [fetchRequests]);

  // Request OTP for completion
  const requestOtp = async (requestId) => {
    if (otpRequestedIds.includes(requestId)) {
      alert("⚠️ OTP has already been requested for this request.");
      return;
    }
    try {
      await API.put(`/ewaste/${requestId}/request-completion`);
      setOtpModal({ visible: true, requestId });
      setOtpRequestedIds((prev) => [...prev, requestId]); // mark OTP requested
    } catch (err) {
      console.error("Error requesting OTP:", err);
      alert("⚠️ Failed to request OTP.");
    }
  };

  // Verify OTP and mark request completed
  const verifyOtpAndComplete = async () => {
    if (!otpInput || otpInput.length !== 6) {
      alert("⚠️ Please enter a valid 6-digit OTP.");
      return;
    }
    try {
      await API.put(`/ewaste/${otpModal.requestId}/complete`, { otp: otpInput });

      alert("✅ Request marked as completed successfully.");

      // Update local request state
      setRequests((prev) =>
        prev.map((r) =>
          r.requestId === otpModal.requestId ? { ...r, status: "COMPLETED" } : r
        )
      );

      setOtpModal({ visible: false, requestId: null });
      setOtpInput("");
    } catch (err) {
      console.error("Error verifying OTP:", err);
      alert(err.response?.data || "⚠️ Invalid OTP or failed to complete request.");
    }
  };

  if (loading) return <p>⏳ Loading assigned requests...</p>;

  if (!auth?.userId) {
    return (
      <div>
        <h2>Assigned Pickup Requests</h2>
        <p>⚠️ You are not logged in as Pickup Personnel.</p>
        <button onClick={() => navigate("/pickup-login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="assigned-requests-page">
      <h2>Assigned Pickup Requests for {auth.userName || "Pickup Personnel"}</h2>

      {requests.length === 0 ? (
        <p>📭 No requests assigned yet.</p>
      ) : (
        <div className="request-cards">
          {requests.map((r) => {
            const pickupDateTime = r.pickupDateTime
              ? new Date(r.pickupDateTime).toLocaleString()
              : "Not scheduled";

            return (
              <div key={r.requestId} className="request-card">
                <h3>{r.deviceType} - {r.brand}</h3>
                <p><strong>Model:</strong> {r.model || "N/A"}</p>
                <p><strong>Condition:</strong> {r.condition || r.deviceCondition || "N/A"}</p>
                <p><strong>Quantity:</strong> {r.qty || "N/A"}</p>
                <p><strong>Pickup Address:</strong> {r.pickupAddress || "N/A"}</p>
                <p><strong>Pickup Personnel:</strong> {r.pickupPersonnelName || auth.userName}</p>
                <p><strong>Scheduled Date & Time:</strong> {pickupDateTime}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className="status-badge"
                    style={{
                      background: statusColors[r.status?.toUpperCase()] || "#9E9E9E",
                      color: r.status?.toUpperCase() === "COMPLETED" ? "#fff" : "#000",
                    }}
                  >
                    {r.status?.toUpperCase() || "N/A"}
                  </span>
                </p>

                {r.status?.toUpperCase() !== "COMPLETED" && (
                  <button
                    className="complete-btn"
                    onClick={() => requestOtp(r.requestId)}
                    disabled={otpRequestedIds.includes(r.requestId)}
                  >
                    {otpRequestedIds.includes(r.requestId) ? "OTP Requested" : "✅ Mark Completed"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* OTP Modal */}
      {otpModal.visible && (
        <div className="otp-modal">
          <div className="otp-modal-content">
            <h3>Enter OTP from User</h3>
            <input
              type="text"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              maxLength={6}
              placeholder="Enter 6-digit OTP"
            />
            <div className="otp-modal-actions">
              <button onClick={verifyOtpAndComplete}>✅ Verify & Complete</button>
              <button
                onClick={() => {
                  setOtpModal({ visible: false, requestId: null });
                  setOtpInput("");
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="back-btn" onClick={() => navigate(-1)}>⬅ Back</button>
    </div>
  );
};

export default AssignedRequestsPage;
