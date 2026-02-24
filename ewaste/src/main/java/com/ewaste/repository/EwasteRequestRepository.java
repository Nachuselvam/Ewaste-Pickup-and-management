package com.ewaste.repository;

import com.ewaste.model.EwasteRequest;
import com.ewaste.model.enums.RequestStatus;
import com.ewaste.model.enums.PickupResponseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EwasteRequestRepository extends JpaRepository<EwasteRequest, Integer> {

    // ✅ Get requests by user ordered by latest first
    List<EwasteRequest> findByUserIdOrderByCreatedAtDesc(Integer userId);

    // ✅ Get requests by status (for admin dashboard filter)
    List<EwasteRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status);

    // ✅ Get requests assigned to a specific pickup personnel (by ID), ordered by pickup datetime
    List<EwasteRequest> findByPickupPersonnelIdOrderByPickupDateTimeDesc(Integer pickupPersonnelId);

    // ✅ Get pending pickup responses whose deadline has passed (for auto-expire job)
    List<EwasteRequest> findByPickupResponseStatusAndPickupResponseDeadlineBefore(
            PickupResponseStatus status,
            LocalDateTime time
    );
}
