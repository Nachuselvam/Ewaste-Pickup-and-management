package com.ewaste.service;

import com.ewaste.model.User;
import com.ewaste.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoginRequest implements UserDetailsService {
    private final UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User u = userRepo.findByEmail(email).orElseThrow(
                () -> new UsernameNotFoundException("User not found")
        );
        return new org.springframework.security.core.userdetails.User(
                u.getEmail(), u.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole()))
        );
    }
}
