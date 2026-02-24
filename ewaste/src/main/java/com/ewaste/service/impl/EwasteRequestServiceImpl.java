package com.ewaste.service.impl;

import com.ewaste.model.EwasteRequest;
import com.ewaste.model.enums.RequestStatus;
import com.ewaste.model.enums.PickupResponseStatus; // ✅ NEW
import com.ewaste.repository.EwasteRequestRepository;
import com.ewaste.service.EwasteRequestService;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class EwasteRequestServiceImpl implements EwasteRequestService {

    private final EwasteRequestRepository repository;

    public EwasteRequestServiceImpl(EwasteRequestRepository repository) {
        this.repository = repository;
    }

    @Override
    public EwasteRequest create(EwasteRequest request) {
        request.setStatus(RequestStatus.Pending);
        request.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        return repository.save(request);
    }

    @Override
    public List<EwasteRequest> getByUser(Integer userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public Optional<EwasteRequest> getById(Integer requestId) {
        return repository.findById(requestId);
    }

    @Override
    public List<EwasteRequest> getAll() {
        return repository.findAll();
    }

    @Override
    public List<EwasteRequest> getByStatus(RequestStatus status) {
        return repository.findByStatusOrderByCreatedAtDesc(status);
    }

    @Override
    public EwasteRequest updateStatus(Integer id, RequestStatus status, String reason) {
        EwasteRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found with id " + id));

        request.setStatus(status);

        if (status == RequestStatus.Rejected) {
            request.setRejectionReason(reason);
        } else {
            request.setRejectionReason(null);
        }

        request.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        return repository.save(request);
    }

    @Override
    public EwasteRequest updateStatusWithAmount(Integer id, RequestStatus status, Double allocatedAmount) {
        EwasteRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found with id " + id));

        request.setStatus(status);
        request.setAllocatedAmount(allocatedAmount);
        request.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        return repository.save(request);
    }

    @Override
    public EwasteRequest updateStatusWithRange(Integer id, RequestStatus status, String allocatedRange) {
        EwasteRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found with id " + id));

        request.setStatus(status);
        request.setAllocatedRange(allocatedRange);
        request.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        return repository.save(request);
    }

    @Override
    public EwasteRequest schedulePickup(Integer requestId,
                                        LocalDateTime pickupDateTime,
                                        Integer pickupPersonnelId,
                                        String pickupPersonnelName) {
        EwasteRequest request = repository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id " + requestId));

        request.setPickupDateTime(pickupDateTime);
        request.setPickupPersonnelId(pickupPersonnelId);
        request.setPickupPersonnelName(pickupPersonnelName);

        // ✅ NEW: initialize pickup response flow
        request.setPickupResponseStatus(PickupResponseStatus.PENDING);
        request.setPickupAssignedAt(LocalDateTime.now());
        request.setPickupResponseDeadline(LocalDateTime.now().plusHours(12));
        request.setPickupRespondedAt(null);

        request.setStatus(RequestStatus.Scheduled); // ❗ kept exactly as your logic
        request.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        return repository.save(request);
    }

    @Override
    public List<EwasteRequest> getByPickupPersonnel(Integer pickupPersonnelId) {
        return repository.findByPickupPersonnelIdOrderByPickupDateTimeDesc(pickupPersonnelId);
    }

    // ================== ✅ REQUIRED BY INTERFACE ==================
    @Override
    public List<EwasteRequest> getPendingPickupsBefore(LocalDateTime time) {
        return repository.findByPickupResponseStatusAndPickupResponseDeadlineBefore(
                PickupResponseStatus.PENDING, time
        );
    }

    // ================== ✅ NEW METHODS ==================

    public EwasteRequest acceptPickup(Integer requestId) {
        EwasteRequest request = repository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id " + requestId));

        request.setPickupResponseStatus(PickupResponseStatus.ACCEPTED);
        request.setPickupRespondedAt(LocalDateTime.now());
        request.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        return repository.save(request);
    }

    public EwasteRequest rejectPickup(Integer requestId) {
        EwasteRequest request = repository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id " + requestId));

        request.setPickupResponseStatus(PickupResponseStatus.REJECTED);
        request.setPickupRespondedAt(LocalDateTime.now());

        // Rollback
        request.setStatus(RequestStatus.Approved);
        request.setPickupPersonnelId(null);
        request.setPickupPersonnelName(null);
        request.setPickupDateTime(null);
        request.setPickupAssignedAt(null);
        request.setPickupResponseDeadline(null);

        request.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        return repository.save(request);
    }

    public void expirePendingPickups() {
        List<EwasteRequest> all = repository.findAll();

        for (EwasteRequest req : all) {
            if (req.getPickupResponseStatus() == PickupResponseStatus.PENDING &&
                    req.getPickupResponseDeadline() != null &&
                    LocalDateTime.now().isAfter(req.getPickupResponseDeadline())) {

                req.setStatus(RequestStatus.Approved);
                req.setPickupPersonnelId(null);
                req.setPickupPersonnelName(null);
                req.setPickupDateTime(null);
                req.setPickupAssignedAt(null);
                req.setPickupResponseDeadline(null);
                req.setPickupRespondedAt(null);

                req.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
                repository.save(req);
            }
        }
    }

    // ================== EXISTING METHODS ==================

    public EwasteRequest generateCompletionOtp(Integer requestId) {
        EwasteRequest request = repository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id " + requestId));

        String otp = String.format("%06d", new Random().nextInt(999999));
        request.setCompletionOtp(otp);
        request.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        return repository.save(request);
    }

    public EwasteRequest verifyAndComplete(Integer requestId, String providedOtp) {
        EwasteRequest request = repository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id " + requestId));

        if (request.getCompletionOtp() == null || !request.getCompletionOtp().equals(providedOtp)) {
            throw new RuntimeException("Invalid OTP provided");
        }

        request.setStatus(RequestStatus.Completed);
        request.setCompletionOtp(null);
        request.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        return repository.save(request);
    }

    @Override
    public EwasteRequest save(EwasteRequest request) {
        request.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        return repository.save(request);
    }
}
