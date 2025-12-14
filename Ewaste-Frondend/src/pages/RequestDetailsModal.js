import React, { useState } from "react";
import SchedulePickupModal from "./SchedulePickupModal";

const RequestDetailsModal = ({ request, onClose, updateRequest }) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState(request.status); // initial filter

  const handleScheduled = (updatedRequest) => {
    updateRequest(updatedRequest); // Update parent dashboard list
    setShowScheduleModal(false);   // Close schedule modal after scheduling
    setStatusFilter(updatedRequest.status); // update filter
  };

  // Determine whether to show Schedule Pickup button based on filter
  const canSchedule =
    statusFilter !== "Scheduled" && statusFilter !== "Rejected";

  return (
    <div className="modal">
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

      {/* Request Details */}
      {statusFilter === request.status && (
        <>
          <p>
            <strong>Device:</strong> {request.deviceType} - {request.brand}{" "}
            {request.model || "N/A"}
          </p>
          <p>
            <strong>Status:</strong> {request.status}
          </p>
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
            <p>
              <strong>Rejection Reason:</strong> {request.rejectionReason}
            </p>
          )}

          {/* Schedule Pickup button */}
          {canSchedule && (
            <button onClick={() => setShowScheduleModal(true)}>
              Schedule Pickup
            </button>
          )}
        </>
      )}

      <button onClick={onClose}>Close</button>

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
  );
};

export default RequestDetailsModal;
