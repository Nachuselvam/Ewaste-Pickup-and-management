package com.ewaste.model.dto;

public class PickupDetails {

    private String pickupDate;              // yyyy-MM-dd
    private String pickupTime;              // HH:mm
    private Integer pickupPersonnelId;      // ID of the pickup personnel
    private String pickupPersonnelName;     // Name of the pickup personnel

    // ===== Getters & Setters =====
    public String getPickupDate() {
        return pickupDate;
    }
    public void setPickupDate(String pickupDate) {
        this.pickupDate = pickupDate;
    }

    public String getPickupTime() {
        return pickupTime;
    }
    public void setPickupTime(String pickupTime) {
        this.pickupTime = pickupTime;
    }

    public Integer getPickupPersonnelId() {
        return pickupPersonnelId;
    }
    public void setPickupPersonnelId(Integer pickupPersonnelId) {
        this.pickupPersonnelId = pickupPersonnelId;
    }

    public String getPickupPersonnelName() {
        return pickupPersonnelName;
    }
    public void setPickupPersonnelName(String pickupPersonnelName) {
        this.pickupPersonnelName = pickupPersonnelName;
    }
}
