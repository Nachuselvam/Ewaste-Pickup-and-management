package com.ewaste.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private String address;
    private String role;  // This is a field

    // No need to declare getRole() manually because Lombok handles it
}
