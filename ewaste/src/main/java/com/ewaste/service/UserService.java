package com.ewaste.service;

import com.ewaste.model.User;
import com.ewaste.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    // ------------------- SAVE USER -------------------
    public User save(User user) {
        if (user.getRole() != null && !user.getRole().isEmpty()) {
            user.setRole(user.getRole().toUpperCase());
        }

        User savedUser = userRepository.save(user);

        // Update the users.role column to reflect combined roles from user_roles table
        String combinedRoles = String.join(",", savedUser.getRoles());
        savedUser.setRole(combinedRoles);  // Sync the column

        return userRepository.save(savedUser);  // Save again with updated role column
    }

    // ------------------- REGISTER USER (with explicit role) -------------------
    public User registerUser(String name, String email, String phone, String password, String address, String role, String city) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(password);  // Should be encoded before calling this method
        user.setAddress(address);
        user.setRole(role);  // Set role explicitly
        user.setCity(city);  // ✅ Store city
        return userRepository.save(user);
    }

    // ------------------- GET ALL USERS -------------------
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ------------------- GET USER BY ID -------------------
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // ------------------- DELETE USER BY ID -------------------
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    // ------------------- CHECK IF EMAIL EXISTS -------------------
    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    // ------------------- FIND USER BY EMAIL -------------------
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // ------------------- GET PICKUP PERSONNEL (ALL CITIES) -------------------
    public List<User> getPickupPersonnel() {
        return userRepository.findByRole("PICKUP");
    }

    // ------------------- GET PICKUP PERSONNEL (BY CITY) -------------------
    public List<User> getPickupPersonnelsByAddress(String address) {
        return userRepository.findPickupPersonnelsByAddress(address);
    }


    // ------------------- SPRING SECURITY AUTH -------------------
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        String role = user.getRole() != null ? user.getRole().toUpperCase() : "USER";
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(authority)
        );
    }
}
