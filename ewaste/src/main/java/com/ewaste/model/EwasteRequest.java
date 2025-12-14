package com.ewaste.model;

import com.ewaste.model.enums.Condition;
import com.ewaste.model.enums.RequestStatus;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "ewaste_requests")
public class EwasteRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Integer requestId;

    // ================== USER INFO ==================
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "user_email", length = 150)
    private String userEmail;

    @Column(name = "user_name", length = 100)
    private String userName;

    // ================== DEVICE INFO ==================
    @Column(name = "device_type", length = 50)
    private String deviceType;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "model", length = 100)
    private String model;

    @Enumerated(EnumType.STRING)
    @Column(name = "device_condition")
    private Condition condition;

    @Column(name = "qty")
    private Integer qty;

    @Column(name = "image_paths", columnDefinition = "TEXT")
    private String imagePaths;

    @Column(name = "pickup_address", length = 255)
    private String pickupAddress;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    // ================== STATUS & REJECTION ==================
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private RequestStatus status = RequestStatus.Pending;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    // ================== PICKUP INFO ==================
    @Column(name = "pickup_datetime")
    private LocalDateTime pickupDateTime;

    @Column(name = "pickup_personnel_id")
    private Integer pickupPersonnelId;

    @Column(name = "pickup_personnel_name", length = 100)
    private String pickupPersonnelName;

    @Column(name = "completion_otp", length = 6)
    private String completionOtp; // optional OTP for completion verification

    // ================== TIMESTAMPS ==================
    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @Column(name = "created_at", updatable = false, insertable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private Timestamp createdAt;

    // ================== GETTERS & SETTERS ==================
    public Integer getRequestId() { return requestId; }
    public void setRequestId(Integer requestId) { this.requestId = requestId; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getDeviceType() { return deviceType; }
    public void setDeviceType(String deviceType) { this.deviceType = deviceType; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Condition getCondition() { return condition; }
    public void setCondition(Condition condition) { this.condition = condition; }

    public Integer getQty() { return qty; }
    public void setQty(Integer qty) { this.qty = qty; }

    public String getImagePaths() { return imagePaths; }
    public void setImagePaths(String imagePaths) { this.imagePaths = imagePaths; }

    public String getPickupAddress() { return pickupAddress; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public LocalDateTime getPickupDateTime() { return pickupDateTime; }
    public void setPickupDateTime(LocalDateTime pickupDateTime) { this.pickupDateTime = pickupDateTime; }

    public Integer getPickupPersonnelId() { return pickupPersonnelId; }
    public void setPickupPersonnelId(Integer pickupPersonnelId) { this.pickupPersonnelId = pickupPersonnelId; }

    public String getPickupPersonnelName() { return pickupPersonnelName; }
    public void setPickupPersonnelName(String pickupPersonnelName) { this.pickupPersonnelName = pickupPersonnelName; }

    public String getCompletionOtp() { return completionOtp; }
    public void setCompletionOtp(String completionOtp) { this.completionOtp = completionOtp; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    // ================== CONVENIENCE METHODS ==================
    public void setPickupPersonnel(Integer id, String name) {
        this.pickupPersonnelId = id;
        this.pickupPersonnelName = name;
    }

    // ================== AUTO TIMESTAMPS ==================
    @PrePersist
    protected void onCreate() {
        this.createdAt = new Timestamp(System.currentTimeMillis());
        this.updatedAt = new Timestamp(System.currentTimeMillis());
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());
    }

    // ================== TO STRING ==================
    @Override
    public String toString() {
        return "EwasteRequest{" +
                "requestId=" + requestId +
                ", userId=" + userId +
                ", userName='" + userName + '\'' +
                ", userEmail='" + userEmail + '\'' +
                ", deviceType='" + deviceType + '\'' +
                ", brand='" + brand + '\'' +
                ", model='" + model + '\'' +
                ", condition=" + condition +
                ", qty=" + qty +
                ", status=" + status +
                ", pickupPersonnelName='" + pickupPersonnelName + '\'' +
                ", pickupDateTime=" + pickupDateTime +
                '}';
    }
}
