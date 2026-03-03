package com.ewaste.repository;

import com.ewaste.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Find by email (for login/auth)
    Optional<User> findByEmail(String email);

    // Check if email exists
    boolean existsByEmail(String email);

    // -------------------------------
    // Fetch all users with a specific role (e.g., "PICKUP")
    // -------------------------------
    @Query("SELECT u FROM User u JOIN u.roles r WHERE UPPER(r) = UPPER(:role)")
    List<User> findByRole(@Param("role") String role);

    // -------------------------------
    // ✅ Fetch all users with a specific role AND city
    // Example: find pickup personnel in "Coimbatore"
    // -------------------------------
    @Query("SELECT u FROM User u JOIN u.roles r " +
            "WHERE UPPER(r) = 'PICKUP' AND LOWER(u.address) LIKE LOWER(CONCAT('%', :address, '%'))")
    List<User> findPickupPersonnelsByAddress(@Param("address") String address);

}
