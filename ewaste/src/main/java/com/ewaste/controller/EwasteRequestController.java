package com.ewaste.controller;

import com.ewaste.model.EwasteRequest;
import com.ewaste.model.enums.Condition;
import com.ewaste.model.enums.RequestStatus;
import com.ewaste.service.EwasteRequestService;
import com.ewaste.service.EmailService;
import jakarta.mail.MessagingException;
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

        if (request.getStatus() == null) request.setStatus(RequestStatus.Pending);

        service.create(request);

        // Send confirmation email
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

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Request submitted successfully!");
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
            @RequestParam(value = "images", required = false) List<MultipartFile> images
    ) {
        if (userEmail == null || userName == null) {
            return ResponseEntity.badRequest().body("userEmail and userName are required");
        }

        try {
            List<String> savedFiles = new ArrayList<>();
            if (images != null) {
                String uploadDir = System.getProperty("user.dir") + "/uploads";
                File directory = new File(uploadDir);
                if (!directory.exists()) directory.mkdirs();

                for (MultipartFile file : images) {
                    File destination = new File(directory, UUID.randomUUID() + "_" + file.getOriginalFilename());
                    file.transferTo(destination);
                    savedFiles.add(destination.getAbsolutePath());
                }
            }

            EwasteRequest request = new EwasteRequest();
            request.setUserId(userId);
            request.setUserEmail(userEmail);
            request.setUserName(userName);
            request.setDeviceType(deviceType);
            request.setBrand(brand);
            request.setModel(model);

            // Enum validation
            try {
                request.setCondition(Condition.valueOf(deviceCondition));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid deviceCondition value");
            }

            request.setPickupAddress(pickupAddress);
            request.setQty(qty);
            request.setRemarks(remarks);
            request.setImagePaths(String.join(",", savedFiles));
            request.setStatus(RequestStatus.Pending);

            service.create(request);

            // Send confirmation email
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
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Upload failed: " + e.getMessage());
        }
    }

    // ================== APPROVE REQUEST ==================
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Integer id) {
        try {
            EwasteRequest updated = service.updateStatus(id, RequestStatus.Approved, null);
            try {
                emailService.sendTemplateEmail(
                        updated.getUserEmail(),
                        "Request Approved",
                        "request-status",
                        Map.of("userName", updated.getUserName(), "requestId", updated.getRequestId(), "approved", true)
                );
            } catch (MessagingException e) { e.printStackTrace(); }
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
                        Map.of("userName", updated.getUserName(), "requestId", updated.getRequestId(), "approved", false, "reason", reason)
                );
            } catch (MessagingException e) { e.printStackTrace(); }
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
                return ResponseEntity.badRequest().body("Invalid pickupDateTime format. Use 'YYYY-MM-DD THH:MM'");
            }

            int personnelId = Integer.parseInt(personnelIdStr);
            EwasteRequest updated = service.schedulePickup(id, pickupDateTime, personnelId, personnelName);

            // Email to user
            try {
                emailService.sendTemplateEmail(
                        updated.getUserEmail(),
                        "Pickup Scheduled",
                        "pickup-scheduled",
                        Map.of(
                                "userName", updated.getUserName(),
                                "pickupPerson", personnelName,
                                "date", pickupDateTime.toString()
                        )
                );
            } catch (MessagingException e) {
                e.printStackTrace();
            }

            // Email to pickup personnel
            try {
                emailService.sendTemplateEmail(
                        personnelEmail,
                        "New Pickup Assigned",
                        "pickup-assigned", // template name without .html
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

    // ================== REQUEST COMPLETION (Send OTP) ==================
    @PutMapping("/{id}/request-completion")
    public ResponseEntity<?> requestCompletion(@PathVariable Integer id) {
        try {
            EwasteRequest request = service.getById(id)
                    .orElseThrow(() -> new NoSuchElementException("Request not found with id " + id));

            // Generate 6-digit OTP
            String otp = String.valueOf((int)(Math.random() * 900000) + 100000);
            request.setCompletionOtp(otp);
            service.save(request); // save updated OTP

            // Send OTP using template
            Map<String, Object> model = Map.of(
                    "userName", request.getUserName(),
                    "otp", otp
            );

            emailService.sendTemplateEmail(
                    request.getUserEmail(),
                    "OTP for Pickup Completion",
                    "otp-mail", // Thymeleaf template name without .html
                    model
            );

            return ResponseEntity.ok("OTP sent to user email.");

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (MessagingException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send OTP email");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to request completion");
        }
    }

    // ================== COMPLETE REQUEST (Verify OTP) ==================
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeRequest(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        try {
            EwasteRequest request = service.getById(id)
                    .orElseThrow(() -> new NoSuchElementException("Request not found with id " + id));

            // Validate OTP
            String otpInput = body.get("otp");
            if (otpInput == null || !otpInput.equals(request.getCompletionOtp())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid OTP");
            }

            // Mark as COMPLETED
            request.setStatus(RequestStatus.Completed);
            request.setCompletionOtp(null);
            service.save(request);

            // Send confirmation email
            Map<String, Object> model = Map.of(
                    "userName", request.getUserName(),
                    "deviceType", request.getDeviceType(),
                    "pickupPerson", request.getPickupPersonnelName(),
                    "pickupDateTime", request.getPickupDateTime() != null ? request.getPickupDateTime().toString() : "Not Scheduled"
            );

            emailService.sendTemplateEmail(
                    request.getUserEmail(),
                    "Pickup Completed Successfully",
                    "pickup-completed",  // Thymeleaf template name
                    model
            );

            return ResponseEntity.ok(request);

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (MessagingException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send confirmation email");
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
        return service.getById(requestId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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
