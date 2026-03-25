// src/components/RequestDetailsModal.jsx
import React, { useState } from "react";
import SchedulePickupModal from "./SchedulePickupModal";

const RequestDetailsModal = ({ request, onClose, updateRequest }) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState(request.status);

  // ===== Clean image paths =====
  // Handle multiple images separated by commas
  const imageUrls = request.imagePaths
    ? request.imagePaths
        .replace(/^\[|]$/g, "")          // Remove brackets
        .replace(/\\/g, "/")             // Replace backslashes
        .split(",")                      // Split multiple images
        .map((path) => path.trim())      // Trim whitespace
    : [];

  const handleScheduled = (updatedRequest) => {
    updateRequest(updatedRequest);
    setShowScheduleModal(false);
    setStatusFilter(updatedRequest.status);
  };

  const canSchedule =
    statusFilter !== "Scheduled" &&
    statusFilter !== "Rejected" &&
    statusFilter !== "Completed";

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Close button */}
        <button className="modal-close" onClick={onClose}>
          ❌
        </button>

        <h2>Request Details</h2>

        {/* Status Filter */}
        <div style={{ marginBottom: "10px" }}>
          <label>
            <strong>Filter by Status:</strong>{" "}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>
          </label>
        </div>

        {statusFilter === request.status && (
          <>
            <p>
              <strong>Device:</strong> {request.deviceType} - {request.brand}{" "}
              {request.model || "N/A"}
            </p>

            <p>
              <strong>Status:</strong> {request.status}
            </p>

            {(request.status === "Approved" ||
              request.status === "Scheduled" ||
              request.status === "OTPRequested") &&
              request.allocatedAmount != null && (
                <p style={{ color: "green" }}>
                  <strong>Allocated Amount:</strong> ₹{request.allocatedAmount}
                </p>
              )}

            {request.status === "Completed" && request.paymentAmount != null && (
              <p style={{ color: "blue" }}>
                <strong>Credited Amount:</strong> ₹{request.paymentAmount}
              </p>
            )}

            <p>
              <strong>Pickup Address:</strong> {request.pickupAddress || "N/A"}
            </p>

            {request.qty && (
              <p>
                <strong>Quantity:</strong> {request.qty}
              </p>
            )}

            {request.remarks && (
              <p>
                <strong>Remarks:</strong> {request.remarks}
              </p>
            )}

            {request.status === "Rejected" && request.rejectionReason && (
              <p style={{ color: "red" }}>
                <strong>Rejection Reason:</strong> {request.rejectionReason}
              </p>
            )}

            {/* Uploaded Images */}
            {imageUrls.length > 0 ? (
              <div style={{ marginTop: "10px" }}>
                <strong>Uploaded Image{imageUrls.length > 1 ? "s" : ""}:</strong>
                {imageUrls.map((path, idx) => (
                  <img
                    key={idx}
                    src={`http://localhost:8080/${path}`}
                    alt={`Uploaded ${idx + 1}`}
                    style={{
                      width: "100%",
                      maxHeight: "400px",
                      objectFit: "contain",
                      marginTop: "5px",
                    }}
                  />
                ))}
              </div>
            ) : (
              <p>No image uploaded.</p>
            )}

            {canSchedule && (
              <button
                onClick={() => setShowScheduleModal(true)}
                style={{ marginTop: "10px" }}
              >
                Schedule Pickup
              </button>
            )}
          </>
        )}

        {/* Close Button */}
        <button onClick={onClose} style={{ marginTop: "10px" }}>
          Close
        </button>

        {/* Schedule Pickup Modal */}
        {showScheduleModal && (
          <SchedulePickupModal
            requestId={request.requestId}
            pickupAddress={request.pickupAddress}
            onClose={() => setShowScheduleModal(false)}
            onScheduled={handleScheduled}
          />
        )}
      </div>
    </div>
  );
};

export default RequestDetailsModal;
