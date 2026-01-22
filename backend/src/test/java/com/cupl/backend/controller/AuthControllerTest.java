package com.cupl.backend.controller;

import com.cupl.backend.BaseTest;
import com.cupl.backend.model.User;
import com.cupl.backend.model.User.UserRole;
import com.cupl.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Authentication Controller Tests")
public class AuthControllerTest extends BaseTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Test successful login with valid credentials")
    void testSuccessfulLogin() throws Exception {
        // Create test user
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(UserRole.USER);
        userRepository.save(user);

        // Perform login
        String loginJson = objectMapper.writeValueAsString(
            new LoginRequest("test@example.com", "password123")
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    @DisplayName("Test login with invalid email")
    void testLoginWithInvalidEmail() throws Exception {
        String loginJson = objectMapper.writeValueAsString(
            new LoginRequest("nonexistent@example.com", "password123")
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test login with invalid password")
    void testLoginWithInvalidPassword() throws Exception {
        // Create test user
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword(passwordEncoder.encode("correctpassword"));
        user.setRole(UserRole.USER);
        userRepository.save(user);

        String loginJson = objectMapper.writeValueAsString(
            new LoginRequest("test@example.com", "wrongpassword")
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test login with different user roles")
    void testLoginWithDifferentRoles() throws Exception {
        // Test ADMIN role
        User admin = new User();
        admin.setEmail("admin@example.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(UserRole.ADMIN);
        userRepository.save(admin);

        String adminLoginJson = objectMapper.writeValueAsString(
            new LoginRequest("admin@example.com", "admin123")
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(adminLoginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));

        // Test CLUB role
        User club = new User();
        club.setEmail("club@example.com");
        club.setPassword(passwordEncoder.encode("club123"));
        club.setRole(UserRole.CLUB);
        userRepository.save(club);

        String clubLoginJson = objectMapper.writeValueAsString(
            new LoginRequest("club@example.com", "club123")
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(clubLoginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("CLUB"));
    }

    // Helper class for login request
    private static class LoginRequest {
        public String email;
        public String password;

        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }
    }
}
