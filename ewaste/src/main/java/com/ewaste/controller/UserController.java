package com.ewaste.controller;

import com.ewaste.model.Transaction;
import com.ewaste.model.User;
import com.ewaste.model.Wallet;
import com.ewaste.model.dto.MessageResponse;
import com.ewaste.repository.TransactionRepository;
import com.ewaste.repository.WalletRepository;
import com.ewaste.service.EmailService;
import com.ewaste.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private TransactionRepository transactionRepo;

    @Autowired
    private WalletRepository walletRepo;
    // ================== ADMIN: ADD OR UPDATE PICKUP PERSONNEL ==================
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/pickup-personnels")
    public ResponseEntity<MessageResponse> addOrUpdatePickupPersonnel(@RequestBody User user) {
        if (user.getEmail() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("❌ Email and password are required!"));
        }

        Optional<User> existingUserOpt = userService.findByEmail(user.getEmail());

        try {
            if (existingUserOpt.isPresent()) {
                // Update existing user's role to PICKUP
                User existingUser = existingUserOpt.get();
                existingUser.setRole("PICKUP");
                if (!user.getPassword().isEmpty()) {
                    existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
                }
                if (user.getAddress() != null) existingUser.setAddress(user.getAddress());
                if (user.getCity() != null) existingUser.setCity(user.getCity());
                userService.save(existingUser);

                // Send email with updated credentials
                emailService.sendTemplateEmail(
                        existingUser.getEmail(),
                        "Pickup Personnel Account Updated",
                        "credentials", // Thymeleaf template name
                        Map.of(
                                "name", existingUser.getName(),
                                "email", existingUser.getEmail(),
                                "password", user.getPassword() // original raw password
                        )
                );

                return ResponseEntity.ok(new MessageResponse("✅ Existing user role updated to PICKUP! Email sent."));
            }

            // Create new PICKUP user
            String rawPassword = user.getPassword(); // store original password for email
            user.setRole("PICKUP");
            user.setPassword(passwordEncoder.encode(rawPassword));
            userService.save(user);

            // Send welcome email with credentials
            emailService.sendTemplateEmail(
                    user.getEmail(),
                    "Welcome to Ewaste System",
                    "credentials", // Thymeleaf template name
                    Map.of(
                            "name", user.getName(),
                            "email", user.getEmail(),
                            "password", rawPassword
                    )
            );

            return ResponseEntity.ok(new MessageResponse(
                    "✅ Pickup Personnel added successfully! Email sent."
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new MessageResponse("User saved, but failed to send email."));
        }
    }

    // ================== GET PICKUP PERSONNELS BY ADDRESS ==================
    @GetMapping("/pickup-personnels")
    public ResponseEntity<List<User>> getPickupPersonnelsByAddress(@RequestParam(required = false) String address) {
        List<User> pickupUsers;
        if (address != null && !address.isEmpty()) {
            pickupUsers = userService.getPickupPersonnelsByAddress(address);
        } else {
            pickupUsers = userService.getAllUsers().stream()
                    .filter(u -> u.getRole().equalsIgnoreCase("PICKUP"))
                    .toList();
        }

        return ResponseEntity.ok(pickupUsers);
    }

    // ================== GET ALL USERS ==================
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ================== GET USER BY ID ==================
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(new MessageResponse("❌ User not found")));
    }

    // ================== DELETE USER ==================
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/users/{id}")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Long id) {
        if (userService.getUserById(id).isEmpty()) {
            return ResponseEntity.status(404).body(new MessageResponse("❌ User not found"));
        }
        userService.deleteUser(id);
        return ResponseEntity.ok(new MessageResponse("✅ User deleted successfully!"));
    }

    // ================== UPDATE USER ==================
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{id}")
    public ResponseEntity<MessageResponse> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        Optional<User> existingUserOpt = userService.getUserById(id);
        if (existingUserOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new MessageResponse("❌ User not found"));
        }

        User existingUser = existingUserOpt.get();

        if (updatedUser.getName() != null) existingUser.setName(updatedUser.getName());
        if (updatedUser.getEmail() != null) existingUser.setEmail(updatedUser.getEmail());
        if (updatedUser.getPhone() != null) existingUser.setPhone(updatedUser.getPhone());
        if (updatedUser.getAddress() != null) existingUser.setAddress(updatedUser.getAddress());
        if (updatedUser.getCity() != null) existingUser.setCity(updatedUser.getCity());
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        if (updatedUser.getRole() != null && !updatedUser.getRole().isEmpty()) {
            existingUser.setRole(updatedUser.getRole().toUpperCase());
        }

        userService.save(existingUser);
        return ResponseEntity.ok(new MessageResponse("✅ User updated successfully!"));
    }

    @GetMapping("/users/{userId}/wallet")
    public ResponseEntity<Map<String, Object>> getUserWallet(@PathVariable Integer userId) {
        Optional<Wallet> wallet = walletRepo.findByUserId(userId);

        // If no wallet exists, return balance 0
        double balance = (wallet.isPresent()) ? wallet.get().getBalance() : 0.0;

        Map<String, Object> response = new HashMap<>();
        response.put("balance", balance);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{userId}/transactions")
    public ResponseEntity<List<Transaction>> getUserTransactions(@PathVariable Integer userId) {
        List<Transaction> txns = transactionRepo.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(txns);
    }
}
