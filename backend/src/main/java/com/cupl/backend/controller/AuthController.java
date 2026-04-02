package com.cupl.backend.controller;

import com.cupl.backend.dto.AuthResponse;
import com.cupl.backend.dto.ForgotPasswordRequest;
import com.cupl.backend.dto.LoginRequest;
import com.cupl.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        // Always return success message regardless of whether email exists
        // This prevents email enumeration attacks
        authService.processForgotPassword(request.getEmail());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "If an account exists for this email, you'll receive a reset link shortly.");
        return ResponseEntity.ok(response);
    }
}
