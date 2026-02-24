package com.ewaste.controller;

import com.ewaste.model.EwasteRequest;
import com.ewaste.model.Transaction;
import com.ewaste.model.Wallet;
import com.ewaste.model.enums.Condition;
import com.ewaste.model.enums.PickupResponseStatus;
import com.ewaste.model.enums.RequestStatus;
import com.ewaste.repository.TransactionRepository;
import com.ewaste.repository.WalletRepository;
import com.ewaste.service.EwasteRequestService;
import com.ewaste.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.*;

@RestController
@RequestMapping("/api/ewaste")
@CrossOrigin(origins = "http://localhost:3000")
public class EwasteRequestController {

    private final EwasteRequestService service;
    private final EmailService emailService;

    @Autowired
    private WalletRepository walletRepo;

    @Autowired
    private TransactionRepository transactionRepo;

    public EwasteRequestController(EwasteRequestService service, EmailService emailService) {
        this.service = service;
        this.emailService = emailService;
    }

    // ================== SUBMIT REQUEST (JSON) ==================
    @PostMapping(value = "/submit-json", consumes = "application/json")
    public ResponseEntity<String> submitJson(@RequestBody EwasteRequest request) {
        if (request.getUserEmail() == null || request.getUserName() == null) {
            return ResponseEntity.badRequest().body("userEmail and userName are required");
        }

        if (request.getStatus() == null) {
            request.setStatus(RequestStatus.Pending);
        }

        service.create(request);

        try {
            emailService.sendTemplateEmail(
                    request.getUserEmail(),
                    "Request Confirmation",
                    "request-confirmation",
                    Map.of("userName", request.getUserName(), "requestId", request.getRequestId())
            );
        } catch (MessagingException e) {
            e.printStackTrace();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body("Request submitted successfully!");
    }

    // ================== SUBMIT REQUEST (MULTIPART) ==================
    @PostMapping(value = "/submit", consumes = "multipart/form-data")
    public ResponseEntity<String> submitMultipart(
            @RequestParam("userId") Integer userId,
            @RequestParam("userEmail") String userEmail,
            @RequestParam("userName") String userName,
            @RequestParam("deviceType") String deviceType,
            @RequestParam("brand") String brand,
            @RequestParam("model") String model,
            @RequestParam("deviceCondition") String deviceCondition,
            @RequestParam("pickupAddress") String pickupAddress,
            @RequestParam("qty") Integer qty,
            @RequestParam(value = "remarks", required = false) String remarks,
            @RequestParam("images") List<MultipartFile> images
    ) {
        if (images == null || images.isEmpty()) {
            return ResponseEntity.badRequest().body("At least one image is required");
        }

        try {
            List<String> savedFiles = new ArrayList<>();

            String uploadDir = System.getProperty("user.dir") + "/uploads";
            File directory = new File(uploadDir);
            if (!directory.exists()) directory.mkdirs();

            for (MultipartFile file : images) {
                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                File destination = new File(directory, fileName);
                file.transferTo(destination);
                savedFiles.add("uploads/" + fileName);
            }

            EwasteRequest request = new EwasteRequest();
            request.setUserId(userId);
            request.setUserEmail(userEmail);
            request.setUserName(userName);
            request.setDeviceType(deviceType);
            request.setBrand(brand);
            request.setModel(model);
            request.setCondition(Condition.valueOf(deviceCondition));
            request.setPickupAddress(pickupAddress);
            request.setQty(qty);
            request.setRemarks(remarks);
            request.setImagePaths(String.join(",", savedFiles));
            request.setStatus(RequestStatus.Pending);

            service.create(request);
            try {
                emailService.sendTemplateEmail(
                        request.getUserEmail(),
                        "Request Confirmation",
                        "request-confirmation",
                        Map.of(
                                "userName", request.getUserName(),
                                "requestId", request.getRequestId()
                        )
                );
            } catch (MessagingException e) {
                e.printStackTrace();
            }

            return ResponseEntity.status(HttpStatus.CREATED).body("Request submitted successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Upload failed: " + e.getMessage());
        }
    }

    // ================== APPROVE REQUEST ==================
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        try {
            if (!body.containsKey("allocatedRange")) {
                return ResponseEntity.badRequest().body("allocatedRange is required");
            }

            String allocatedRange = body.get("allocatedRange").toString().trim();
            if (allocatedRange.isEmpty()) {
                return ResponseEntity.badRequest().body("allocatedRange cannot be empty");
            }

            EwasteRequest updated = service.updateStatusWithRange(id, RequestStatus.Approved, allocatedRange);

            try {
                emailService.sendTemplateEmail(
                        updated.getUserEmail(),
                        "Request Approved",
                        "request-status",
                        Map.of(
                                "userName", updated.getUserName(),
                                "requestId", updated.getRequestId(),
                                "approved", true,
                                "allocatedRange", updated.getAllocatedRange()
                        )
                );
            } catch (MessagingException e) {
                e.printStackTrace();
            }

            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Request not found");
        }
    }

    // ================== REJECT REQUEST ==================
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        try {
            String reason = body.getOrDefault("reason", "Not provided");
            EwasteRequest updated = service.updateStatus(id, RequestStatus.Rejected, reason);

            try {
                emailService.sendTemplateEmail(
                        updated.getUserEmail(),
                        "Request Rejected",
                        "request-status",
                        Map.of(
                                "userName", updated.getUserName(),
                                "requestId", updated.getRequestId(),
                                "approved", false,
                                "reason", reason
                        )
                );
            } catch (MessagingException e) {
                e.printStackTrace();
            }

            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Request not found");
        }
    }

    // ================== SCHEDULE PICKUP ==================
    @PutMapping("/{id}/schedule")
    public ResponseEntity<?> schedulePickup(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        try {
            String dateTimeStr = body.get("pickupDateTime");
            String personnelIdStr = body.get("pickupPersonnelId");
            String personnelName = body.get("pickupPersonnelName");
            String personnelEmail = body.get("pickupPersonnelEmail");

            if (dateTimeStr == null || personnelIdStr == null || personnelName == null || personnelEmail == null) {
                return ResponseEntity.badRequest().body("pickupDateTime and complete personnel info are required");
            }

            LocalDateTime pickupDateTime;
            try {
                pickupDateTime = LocalDateTime.parse(dateTimeStr);
            } catch (DateTimeParseException e) {
                return ResponseEntity.badRequest().body("Invalid pickupDateTime format");
            }

            int personnelId = Integer.parseInt(personnelIdStr);

            EwasteRequest updated = service.schedulePickup(id, pickupDateTime, personnelId, personnelName);
            updated.setPickupResponseStatus(PickupResponseStatus.PENDING);
            updated.setPickupAssignedAt(LocalDateTime.now());
            service.save(updated);

            // Email to pickup personnel
            try {
                emailService.sendTemplateEmail(
                        personnelEmail,
                        "New Pickup Assigned",
                        "pickup-assigned",
                        Map.of(
                                "pickupPerson", personnelName,
                                "userName", updated.getUserName(),
                                "userEmail", updated.getUserEmail(),
                                "pickupDateTime", pickupDateTime.toString(),
                                "pickupAddress", updated.getPickupAddress(),
                                "deviceType", updated.getDeviceType(),
                                "deviceBrand", updated.getBrand()
                        )
                );
            } catch (MessagingException e) {
                e.printStackTrace();
            }

            return ResponseEntity.ok(updated);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Request not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid request body");
        }
    }

    // ================== PICKUP RESPONSE ==================
    @PutMapping("/{id}/pickup-response")
    public ResponseEntity<?> pickupResponse(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        try {
            EwasteRequest request = service.getById(id)
                    .orElseThrow(() -> new NoSuchElementException("Request not found"));

            String response = body.get("response");

            if (response == null) {
                return ResponseEntity.badRequest().body("response is required");
            }

            if ("ACCEPT".equalsIgnoreCase(response)) {
                request.setPickupResponseStatus(PickupResponseStatus.ACCEPTED);
                request.setPickupRespondedAt(LocalDateTime.now());
                request.setStatus(RequestStatus.Scheduled);

                service.save(request);

                // ✅ Send mail to user
                try {
                    emailService.sendTemplateEmail(
                            request.getUserEmail(),
                            "Pickup Scheduled",
                            "pickup-scheduled",
                            Map.of(
                                    "userName", request.getUserName(),
                                    "pickupPerson", request.getPickupPersonnelName(),
                                    "date", request.getPickupDateTime() != null
                                            ? request.getPickupDateTime().toString()
                                            : "Not Scheduled"
                            )
                    );
                } catch (MessagingException e) {
                    e.printStackTrace();
                }

            } else if ("REJECT".equalsIgnoreCase(response)) {
                request.setPickupResponseStatus(PickupResponseStatus.REJECTED);
                request.setPickupRespondedAt(LocalDateTime.now());

                // rollback assignment
                request.setPickupAssignedAt(null);
                request.setPickupPersonnelId(null);
                request.setPickupPersonnelName(null);
                request.setPickupDateTime(null);

                request.setStatus(RequestStatus.Approved);

                service.save(request);

            } else {
                return ResponseEntity.badRequest().body("response must be ACCEPT or REJECT");
            }

            return ResponseEntity.ok(request);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update pickup response");
        }
    }

    // ================== REQUEST COMPLETION (OTP) ==================
    @PutMapping("/{id}/request-completion")
    public ResponseEntity<?> requestCompletion(@PathVariable Integer id) {
        try {
            EwasteRequest request = service.getById(id).orElseThrow();

            if (!RequestStatus.Scheduled.equals(request.getStatus())) {
                return ResponseEntity.badRequest().body("Request is not in Scheduled status");
            }

            String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
            request.setCompletionOtp(otp);
            service.save(request);

            emailService.sendTemplateEmail(
                    request.getUserEmail(),
                    "OTP for Pickup Completion",
                    "otp-mail",
                    Map.of("userName", request.getUserName(), "otp", otp)
            );

            return ResponseEntity.ok("OTP sent successfully");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send OTP");
        }
    }

    // ================== COMPLETE REQUEST ==================
    @Transactional
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeRequest(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        try {
            EwasteRequest request = service.getById(id).orElseThrow();

            if (request.getCompletionOtp() == null || !body.get("otp").equals(request.getCompletionOtp())) {
                return ResponseEntity.badRequest().body("Invalid OTP");
            }

            Double amount = Double.parseDouble(body.get("amount"));

            request.setStatus(RequestStatus.Completed);
            request.setPaymentStatus("PAID");
            request.setPaymentAmount(amount);
            request.setAllocatedAmount(amount);
            request.setCompletionOtp(null);
            service.save(request);

            Wallet wallet = walletRepo.findByUserId(request.getUserId())
                    .orElseGet(() -> {
                        Wallet w = new Wallet();
                        w.setUserId(request.getUserId());
                        w.setBalance(0.0);
                        return w;
                    });

            wallet.setBalance(wallet.getBalance() + amount);
            walletRepo.save(wallet);

            Transaction tx = new Transaction();
            tx.setUserId(request.getUserId());
            tx.setRequestId(request.getRequestId());
            tx.setAmount(amount);
            tx.setType("CREDIT");
            tx.setStatus("SUCCESS");
            transactionRepo.save(tx);

            emailService.sendTemplateEmail(
                    request.getUserEmail(),
                    "Pickup Completed & Payment Credited",
                    "pickup-completed",
                    Map.of(
                            "userName", request.getUserName(),
                            "deviceType", request.getDeviceType(),
                            "pickupPerson", request.getPickupPersonnelName(),
                            "pickupDateTime",
                            request.getPickupDateTime() != null ? request.getPickupDateTime().toString() : "Not Scheduled",
                            "paidAmount", amount
                    )
            );

            return ResponseEntity.ok(request);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to complete request");
        }
    }

    // ================== GET REQUESTS ==================
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<EwasteRequest>> getByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(service.getByUser(userId));
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<EwasteRequest> getById(@PathVariable Integer requestId) {
        return service.getById(requestId).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<EwasteRequest>> getAllRequests() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/admin/status/{status}")
    public ResponseEntity<List<EwasteRequest>> getRequestsByStatus(@PathVariable String status) {
        try {
            RequestStatus requestStatus = RequestStatus.valueOf(status);
            return ResponseEntity.ok(service.getByStatus(requestStatus));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ArrayList<>());
        }
    }

    @GetMapping("/pickup-requests")
    public ResponseEntity<List<EwasteRequest>> getAssignedRequests(@RequestParam Integer personnelId) {
        return ResponseEntity.ok(service.getByPickupPersonnel(personnelId));
    }
}
