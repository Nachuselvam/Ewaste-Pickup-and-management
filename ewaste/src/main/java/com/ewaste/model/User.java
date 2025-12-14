package com.ewaste.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
        name = "users",
        indexes = {
                @Index(name = "idx_users_email", columnList = "email", unique = true),
                @Index(name = "idx_users_phone", columnList = "phone")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100, nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;   // acts as username for login

    @Column(length = 20, unique = true)
    private String phone;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(length = 255)
    private String address;

    @Column(length = 500)
    private String profilePictureUrl;

    // ✅ NEW FIELD for city (used to filter pickup personnel by location)
    @Column(length = 100)
    private String city;

    // Roles stored in a separate table
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id")
    )
    @Column(name = "role", length = 30)
    @Builder.Default
    private Set<String> roles = new HashSet<>();

    // Comma-separated roles stored in users table
    @Column(length = 255)
    private String role;

    // Get primary role (first one), default to USER
    public String getPrimaryRole() {
        return roles.stream().findFirst().orElse("USER");
    }

    // Set a single role (clears previous and updates column)
    public void setRole(String role) {
        this.roles.clear();
        this.roles.add(role.toUpperCase());
        updateRoleColumn();
    }

    // Override setRoles to keep column in sync
    public void setRoles(Set<String> roles) {
        this.roles = roles;
        updateRoleColumn();
    }

    private void updateRoleColumn() {
        this.role = String.join(",", this.roles);
    }

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private String createdAt = LocalDateTime.now().toString();

    private String updatedAt;

    // Combine PrePersist and PreUpdate logic into one method
    @PrePersist
    @PreUpdate
    public void onSaveOrUpdate() {
        updateRoleColumn();            // sync roles
        this.updatedAt = LocalDateTime.now().toString(); // update timestamp
    }

    // Required by Spring Security for username
    public String getUsername() {
        return email;
    }
}
