package com.ewaste.service;

import com.ewaste.model.EwasteRequest;
import com.ewaste.model.enums.RequestStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EwasteRequestService {

    EwasteRequest create(EwasteRequest request);

    List<EwasteRequest> getByUser(Integer userId);

    Optional<EwasteRequest> getById(Integer requestId);

    // ✅ For Admin Dashboard
    List<EwasteRequest> getAll();

    List<EwasteRequest> getByStatus(RequestStatus status);

    // ✅ Update status (approve/reject/completed)
    EwasteRequest updateStatus(Integer id, RequestStatus status, String reason);

    /**
     * Schedule pickup for a request.
     * Updates pickup date/time, pickup personnel ID & name, and status.
     */
    EwasteRequest schedulePickup(Integer requestId,
                                 LocalDateTime pickupDateTime,
                                 Integer pickupPersonnelId,
                                 String pickupPersonnelName);

    /**
     * Fetch all requests assigned to a specific pickup personnel.
     */
    List<EwasteRequest> getByPickupPersonnel(Integer pickupPersonnelId);

    /**
     * Mark request as COMPLETED.
     */
    default EwasteRequest markCompleted(Integer requestId) {
        return updateStatus(requestId, RequestStatus.Completed, null);
    }

    /**
     * Save or update an EwasteRequest entity.
     * Useful for updating OTP, scheduled date, or any other fields.
     */
    EwasteRequest save(EwasteRequest request);
}
