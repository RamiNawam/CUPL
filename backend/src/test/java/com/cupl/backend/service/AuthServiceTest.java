package com.cupl.backend.service;

import com.cupl.backend.BaseTest;
import com.cupl.backend.dto.AuthResponse;
import com.cupl.backend.dto.LoginRequest;
import com.cupl.backend.model.User;
import com.cupl.backend.model.User.UserRole;
import com.cupl.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Auth Service Tests")
public class AuthServiceTest extends BaseTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Test successful login")
    void testSuccessfulLogin() {
        // Create test user
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(UserRole.USER);
        userRepository.save(user);

        // Perform login
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("test@example.com", response.getEmail());
        assertEquals("USER", response.getRole()); // Role is returned as String in JSON
        assertNotNull(response.getToken());
    }

    @Test
    @DisplayName("Test login with invalid email")
    void testLoginWithInvalidEmail() {
        LoginRequest request = new LoginRequest();
        request.setEmail("nonexistent@example.com");
        request.setPassword("password123");

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> authService.login(request)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }

    @Test
    @DisplayName("Test login with invalid password")
    void testLoginWithInvalidPassword() {
        // Create test user
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword(passwordEncoder.encode("correctpassword"));
        user.setRole(UserRole.USER);
        userRepository.save(user);

        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("wrongpassword");

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> authService.login(request)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }

    @Test
    @DisplayName("Test login is case-insensitive for email")
    void testLoginCaseInsensitiveEmail() {
        // Create test user with lowercase email
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(UserRole.USER);
        userRepository.save(user);

        // Try login with uppercase email
        LoginRequest request = new LoginRequest();
        request.setEmail("TEST@EXAMPLE.COM");
        request.setPassword("password123");

        AuthResponse response = authService.login(request);
        assertNotNull(response);
        assertEquals("test@example.com", response.getEmail());
    }
}
