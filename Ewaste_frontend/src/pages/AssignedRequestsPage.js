import React, { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../App";
import {
  markRequestOtpRequested,
  verifyOtpAndComplete,
  fetchAssignedRequests,
  acceptPickupRequest,
  rejectPickupRequest,
} from "../api/api";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";

const statusColors = {
  PENDING: "#FFC107",
  APPROVED: "#9C27B0",
  REJECTED: "#F44336",
  SCHEDULED: "#2196F3",
  OTPREQUESTED: "#FF9800",
  COMPLETED: "#4CAF50",
};

const AssignedRequestsPage = () => {
  const { auth } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpModal, setOtpModal] = useState({ visible: false, requestId: null });
  const [otpInput, setOtpInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const navigate = useNavigate();

  // Fetch assigned requests
  const loadRequests = useCallback(async () => {
    if (!auth?.userId) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchAssignedRequests(auth.userId);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching assigned requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 10000);
    return () => clearInterval(interval);
  }, [loadRequests]);

  // ---------------- ACCEPT PICKUP ----------------
  const handleAccept = async (requestId) => {
    try {
      await acceptPickupRequest(requestId);
      alert("✅ Pickup accepted.");

      setRequests((prev) =>
        prev.map((r) =>
          r.requestId === requestId
            ? { ...r, pickupResponseStatus: "ACCEPTED" }
            : r
        )
      );
    } catch (err) {
      console.error("Error accepting pickup:", err);
      alert(err.message || "⚠️ Failed to accept pickup.");
    }
  };

  // ---------------- REJECT PICKUP ----------------
  const handleReject = async (requestId) => {
    const reason = prompt("Enter reason for rejecting this pickup:");
    if (!reason) return;

    try {
      await rejectPickupRequest(requestId, reason);
      alert("❌ Pickup rejected. It will return to admin.");

      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch (err) {
      console.error("Error rejecting pickup:", err);
      alert(err.message || "⚠️ Failed to reject pickup.");
    }
  };

  // ---------------- REQUEST OTP ----------------
  const requestOtp = async (requestId) => {
    try {
      await markRequestOtpRequested(requestId);
      setRequests((prev) =>
        prev.map((r) =>
          r.requestId === requestId
            ? { ...r, status: "OTPREQUESTED" }
            : r
        )
      );
      setOtpModal({ visible: true, requestId });
    } catch (err) {
      console.error("Error requesting OTP:", err);
      alert(err.message || "⚠️ Failed to request OTP.");
    }
  };

  // ---------------- VERIFY OTP + COMPLETE ----------------
  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length !== 6) {
      alert("⚠️ Please enter a valid 6-digit OTP.");
      return;
    }

    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) {
      alert("⚠️ Please enter a valid amount.");
      return;
    }

    try {
      await verifyOtpAndComplete(otpModal.requestId, otpInput, amount);

      alert("✅ Request marked as completed and amount credited.");

      setRequests((prev) =>
        prev.map((r) =>
          r.requestId === otpModal.requestId
            ? { ...r, status: "COMPLETED", paymentAmount: amount }
            : r
        )
      );

      setOtpModal({ visible: false, requestId: null });
      setOtpInput("");
      setAmountInput("");
    } catch (err) {
      console.error("Error verifying OTP:", err);
      alert(err.message || "⚠️ Invalid OTP or amount.");
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
      <h2>Assigned Pickup Requests</h2>

      {requests.length === 0 ? (
        <p>📭 No requests assigned yet.</p>
      ) : (
        <div className="request-cards">
          {requests.map((r) => {
            const pickupDateTime = r.pickupDateTime
              ? new Date(r.pickupDateTime).toLocaleString()
              : "Not scheduled";

            const status = r.status?.toUpperCase();
            const responseStatus = r.pickupResponseStatus?.toUpperCase(); // PENDING / ACCEPTED / REJECTED

            return (
              <div key={r.requestId} className="request-card">
                <h3>
                  {r.deviceType} - {r.brand}
                </h3>

                <p>
                  <strong>Model:</strong> {r.model || "N/A"}
                </p>
                <p>
                  <strong>Quantity:</strong> {r.qty || "N/A"}
                </p>
                <p>
                  <strong>Pickup Address:</strong> {r.pickupAddress}
                </p>
                <p>
                  <strong>Pickup Time:</strong> {pickupDateTime}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className="status-badge"
                    style={{
                      background: statusColors[status] || "#9E9E9E",
                      color: status === "COMPLETED" ? "#fff" : "#000",
                    }}
                  >
                    {status}
                  </span>
                </p>

                {/* Allocated Range */}
                {(status === "SCHEDULED" ||
                  status === "OTPREQUESTED" ||
                  status === "COMPLETED") && (
                  <p className="amount-info">
                    📏 <strong>Allocated Range:</strong>{" "}
                    {r.allocatedRange || "N/A"}
                  </p>
                )}

                {status === "COMPLETED" && (
                  <p className="amount-info success">
                    ✅ <strong>Credited Amount:</strong> ₹{r.paymentAmount}
                  </p>
                )}

                {/* ---------------- ACTIONS ---------------- */}

                {/* Show Accept / Reject ONLY if status is SCHEDULED and response is PENDING */}
                {responseStatus === "PENDING" && status === "SCHEDULED" && (
                <div className="action-bar">
                  <button
                    className="pill-btn accept-btn"
                    onClick={() => handleAccept(r.requestId)}
                  >
                    ✔ Accept
                  </button>
                  <button
                    className="pill-btn reject-btn"
                    onClick={() => handleReject(r.requestId)}
                  >
                    ✖ Reject
                  </button>
                </div>
              )}
              
                {/* If ACCEPTED and not completed → allow OTP flow */}
                {responseStatus === "ACCEPTED" && status !== "COMPLETED" && (
                  <button
                    className="dashboard-btn complete-btn"
                    onClick={() => requestOtp(r.requestId)}
                  >
                    {status === "OTPREQUESTED"
                      ? "OTP Requested"
                      : "✅ Mark Completed"}
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
            <h3>Enter OTP and Final Amount</h3>

            <input
              type="text"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              maxLength={6}
              placeholder="Enter 6-digit OTP"
            />

            <input
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="Enter final amount"
            />

            <div className="otp-modal-actions">
              <button onClick={handleVerifyOtp}>✅ Verify & Complete</button>
              <button
                onClick={() => {
                  setOtpModal({ visible: false, requestId: null });
                  setOtpInput("");
                  setAmountInput("");
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="back-btn" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>
    </div>
  );
};

export default AssignedRequestsPage;
