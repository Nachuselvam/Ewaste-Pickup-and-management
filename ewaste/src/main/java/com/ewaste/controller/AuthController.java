package com.ewaste.controller;

import com.ewaste.model.User;
import com.ewaste.model.dto.LoginRequest;
import com.ewaste.model.dto.RegisterRequest;
import com.ewaste.model.dto.MessageResponse;
import com.ewaste.service.EmailService;
import com.ewaste.service.UserService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private EmailService emailService;

    // ==================== REGISTER ====================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if (userService.existsByEmail(request.getEmail().trim())) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("❌ Email already registered!"));
        }

        String role = request.getRole() != null ? request.getRole() : "USER";

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRole(role);

        userService.save(user);

        // Send welcome email asynchronously
        sendWelcomeEmailAsync(user, request.getPassword());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "✅ Registration successful! Check your email for credentials.");
        response.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole()
        ));

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Async
    public void sendWelcomeEmailAsync(User user, String rawPassword) {
        try {
            emailService.sendTemplateEmail(
                    user.getEmail(),
                    "Welcome to Ewaste System",
                    "welcome",
                    Map.of(
                            "name", user.getName(),
                            "email", user.getEmail(),
                            "password", rawPassword
                    )
            );
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    // ==================== LOGIN ====================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail().trim(), request.getPassword())
            );

            User user = userService.findByEmail(request.getEmail().trim())
                    .orElseThrow(() -> new RuntimeException(
                            "❌ User not found with email: " + request.getEmail()
                    ));

            Map<String, Object> response = new HashMap<>();
            response.put("message", "✅ Login successful!");
            response.put("user", Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "role", user.getRole()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("❌ Login failed: Invalid email or password"));
        }
    }
}
