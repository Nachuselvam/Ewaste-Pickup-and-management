package com.ewaste.model.dto;

public class PickupPersonnelDTO {

    private Integer id;
    private String name;
    private String address;
    private Long pendingCount;
    private String email;

    public PickupPersonnelDTO(Integer id, String name, String address, Long pendingCount, String email) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.pendingCount = pendingCount;
        this.email = email;
    }

    public Integer getId() { return id; }
    public String getName() { return name; }
    public String getAddress() { return address; }
    public Long getPendingCount() { return pendingCount; }
    public String getEmail() { return email; }
}