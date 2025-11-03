package com.ewaste.service.impl;

import com.ewaste.model.EwasteRequest;
import com.ewaste.model.enums.RequestStatus;
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

    // ================== CREATE ==================
    @Override
    public EwasteRequest create(EwasteRequest request) {
        request.setStatus(RequestStatus.Pending);
        request.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        return repository.save(request);
    }

    // ================== GET BY USER ==================
    @Override
    public List<EwasteRequest> getByUser(Integer userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // ================== GET BY ID ==================
    @Override
    public Optional<EwasteRequest> getById(Integer requestId) {
        return repository.findById(requestId);
    }

    // ================== GET ALL ==================
    @Override
    public List<EwasteRequest> getAll() {
        return repository.findAll();
    }

    // ================== GET BY STATUS ==================
    @Override
    public List<EwasteRequest> getByStatus(RequestStatus status) {
        return repository.findByStatusOrderByCreatedAtDesc(status);
    }

    // ================== UPDATE STATUS (APPROVE / REJECT) ==================
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

    // ================== SCHEDULE PICKUP ==================
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
        request.setStatus(RequestStatus.Scheduled);
        request.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        return repository.save(request);
    }

    // ================== GET BY PICKUP PERSONNEL ==================
    @Override
    public List<EwasteRequest> getByPickupPersonnel(Integer pickupPersonnelId) {
        return repository.findByPickupPersonnelIdOrderByPickupDateTimeDesc(pickupPersonnelId);
    }

    // ================== MARK COMPLETION WITH OTP ==================
    public EwasteRequest generateCompletionOtp(Integer requestId) {
        EwasteRequest request = repository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id " + requestId));

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        request.setCompletionOtp(otp);
        request.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        return repository.save(request); // Save OTP to DB
    }

    public EwasteRequest verifyAndComplete(Integer requestId, String providedOtp) {
        EwasteRequest request = repository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id " + requestId));

        if (request.getCompletionOtp() == null || !request.getCompletionOtp().equals(providedOtp)) {
            throw new RuntimeException("Invalid OTP provided");
        }

        request.setStatus(RequestStatus.Completed);
        request.setCompletionOtp(null); // Clear OTP after successful completion
        request.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        return repository.save(request);
    }

    // ================== SAVE METHOD ==================
    @Override
    public EwasteRequest save(EwasteRequest request) {
        request.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        return repository.save(request);
    }
}
