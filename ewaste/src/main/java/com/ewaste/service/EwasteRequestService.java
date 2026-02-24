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

    List<EwasteRequest> getAll();

    List<EwasteRequest> getByStatus(RequestStatus status);

    EwasteRequest updateStatus(Integer id, RequestStatus status, String reason);

    EwasteRequest updateStatusWithAmount(Integer id, RequestStatus status, Double allocatedAmount);

    EwasteRequest updateStatusWithRange(Integer id, RequestStatus status, String allocatedRange);

    EwasteRequest schedulePickup(Integer requestId,
                                 LocalDateTime pickupDateTime,
                                 Integer pickupPersonnelId,
                                 String pickupPersonnelName);

    List<EwasteRequest> getByPickupPersonnel(Integer pickupPersonnelId);

    // ✅ NEW: For auto-revert / cleanup of old pending pickups
    List<EwasteRequest> getPendingPickupsBefore(LocalDateTime time);

    default EwasteRequest markCompleted(Integer requestId) {
        return updateStatus(requestId, RequestStatus.Completed, null);
    }

    EwasteRequest save(EwasteRequest request);
}
