import React, { useState, useEffect } from "react";
import {
  fetchAllRequests,
  fetchRequestsByStatus,
  approveRequest,
  rejectRequest
} from "../api/api";
import SchedulePickupModal from "./SchedulePickupModal";
import AdminImageModal from "./AdminImageModal";
import "../styles/App.css";

const BASE_IMAGE_URL = "http://localhost:8080/";

// 🔥 Super safe normalizer for ALL your DB formats
const normalizeImagePath = (rawPath) => {
  if (!rawPath) return null;

  let p = rawPath.toString().trim();

  // Remove [ and ]
  p = p.replace(/^\[|\]$/g, "");

  // Replace backslashes with forward slashes
  p = p.replace(/\\/g, "/");

  // If full Windows path, cut everything before "uploads"
  const idx = p.toLowerCase().lastIndexOf("uploads/");
  if (idx !== -1) {
    p = p.substring(idx);
  }

  // If still just filename like "img1.jpg"
  if (!p.toLowerCase().startsWith("uploads/")) {
    p = "uploads/" + p;
  }

  // Avoid double uploads/uploads
  p = p.replace(/^uploads\/uploads\//i, "uploads/");

  return BASE_IMAGE_URL + p;
};

const extractImages = (req) => {
  let images = [];

  if (req.imagePaths && typeof req.imagePaths === "string") {
    const parts = req.imagePaths.split(",");
    images = parts
      .map((p) => normalizeImagePath(p))
      .filter((u) => u);
  } else if (req.imageUrl) {
    const url = normalizeImagePath(req.imageUrl);
    if (url) images = [url];
  }

  return images;
};

const AdminRequestDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [popupMessage, setPopupMessage] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    fetchRequests("All");
  }, []);

  const fetchRequests = async (status) => {
    try {
      setLoading(true);
      let data =
        status === "All"
          ? await fetchAllRequests()
          : await fetchRequestsByStatus(status);

      const normalized = data.map((r) => ({
        ...r,
        id: r.id || r.requestId
      }));

      setRequests(normalized);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const showPopup = (msg) => {
    setPopupMessage(msg);
    setTimeout(() => setPopupMessage(""), 2500);
  };

  const handleApprove = async (id) => {
    const allocatedRange = window.prompt("Enter allocated range (e.g. 300-600):");

    if (!allocatedRange || allocatedRange.trim() === "") {
      alert("Allocated range is required (e.g. 300-600)");
      return;
    }

    try {
      await approveRequest(id, allocatedRange);

      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? { ...req, status: "Approved", allocatedRange }
            : req
        )
      );
      showPopup("✅ Request approved successfully!");
    } catch (err) {
      console.error("Failed to approve request:", err);
      showPopup("⚠️ Failed to approve request.");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await rejectRequest(id, reason);
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? { ...req, status: "Rejected", rejectionReason: reason }
            : req
        )
      );
      showPopup("❌ Request rejected successfully!");
    } catch (err) {
      console.error("Failed to reject request:", err);
      showPopup("⚠️ Failed to reject request.");
    }
  };

  const handleScheduled = (updatedRequest) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === updatedRequest.requestId ? updatedRequest : req
      )
    );
    showPopup("✅ Pickup scheduled successfully!");
  };

  // 👇 Open image modal (ONLY for pending)
  const openImageModal = (req) => {
    const images = extractImages(req);
    setSelectedImages(images);
    setImageModalOpen(true);
  };

  return (
    <div className="request-status-page">
      <div className="overlay">
        <h2>📦 All User Requests (Admin)</h2>

        <div className="filter-buttons">
          {["All", "Pending", "Approved", "Rejected", "Scheduled", "Completed"].map(
            (status) => (
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
            )
          )}
        </div>

        {loading && <p>Loading requests...</p>}

        {!loading && requests.length === 0 && (
          <p className="empty-msg">No requests found.</p>
        )}

        {!loading && requests.length > 0 && (
          <div className="request-cards">
            {requests.map((req) => (
              <div
                key={req.id}
                className={`request-card status-${req.status?.toLowerCase()}`}
              >
                <h3>{req.deviceType} - {req.brand}</h3>
                <p><strong>Model:</strong> {req.model || "N/A"}</p>
                <p><strong>Condition:</strong> {req.condition || "N/A"}</p>
                <p><strong>Quantity:</strong> {req.qty || "N/A"}</p>
                <p><strong>Pickup:</strong> {req.pickupAddress || "N/A"}</p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status-badge ${req.status?.toLowerCase()}`}>
                    {req.status}
                  </span>
                </p>

                {req.status === "Pending" && req.remarks && (
                  <p className="extra-info">
                    📝 <strong>Remarks:</strong> {req.remarks}
                  </p>
                )}

                {(req.status === "Approved" || req.status === "Scheduled") && (
                  <p className="amount-info">
                    💰 <strong>Allocated Range:</strong> ₹{req.allocatedRange}
                  </p>
                )}

                {req.status === "Completed" && (
                  <p className="amount-info success">
                    ✅ <strong>Credited Amount:</strong> ₹{req.paymentAmount}
                  </p>
                )}

                {req.status === "Rejected" && (
                  <p className="extra-info">
                    ❌ Reason: {req.rejectionReason || "Not provided"}
                  </p>
                )}

                {/* 👇 View Image ONLY for Pending */}
                {req.status === "Pending" && (
                  <button
                    className="view-image-btn"
                    onClick={() => openImageModal(req)}
                  >
                    🖼️ View Image
                  </button>
                )}

                {req.status === "Pending" && (
                  <div className="action-buttons">
                    <button onClick={() => handleApprove(req.id)}>✅ Accept</button>
                    <button onClick={() => handleReject(req.id)}>❌ Reject</button>
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

      {/* Center Schedule Modal */}
      {selectedRequestId && (
        <SchedulePickupModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
          onScheduled={handleScheduled}
        />
      )}

      {/* Image Modal */}
      {imageModalOpen && (
        <AdminImageModal
          images={selectedImages}
          onClose={() => setImageModalOpen(false)}
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
