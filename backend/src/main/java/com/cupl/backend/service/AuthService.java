package com.cupl.backend.service;

import com.cupl.backend.config.JwtUtil;
import com.cupl.backend.dto.AuthResponse;
import com.cupl.backend.dto.ErrorResponse;
import com.cupl.backend.dto.LoginRequest;
import com.cupl.backend.model.User;
import com.cupl.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail().toLowerCase().trim());
        
        // Always return the same error message regardless of whether email exists or password is wrong
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, 
                ErrorResponse.INVALID_CREDENTIALS
            );
        }

        User user = userOpt.get();

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        
        return new AuthResponse(user, token);
    }

    public void processForgotPassword(String email) {
        // Always process the request but don't reveal if email exists
        // In a real implementation, you would:
        // 1. Check if user exists
        // 2. Generate reset token
        // 3. Send email with reset link
        // 4. Store reset token with expiration
        
        // For now, we just log it (in production, implement actual email sending)
        String normalizedEmail = email.toLowerCase().trim();
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);
        
        if (userOpt.isPresent()) {
            // User exists - in production, send reset email here
            // For now, we just silently process it
        }
        // If user doesn't exist, we still return success to prevent email enumeration
    }
}
