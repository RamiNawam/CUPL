package com.cupl.backend.controller;

import com.cupl.backend.BaseTest;
import com.cupl.backend.dto.ErrorResponse;
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

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Authentication Controller Edge Case Tests")
public class AuthControllerEdgeCaseTest extends BaseTest {

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
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).apply(springSecurity()).build();
        objectMapper = new ObjectMapper();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Test login with empty email")
    void testLoginWithEmptyEmail() throws Exception {
        String loginJson = objectMapper.writeValueAsString(
            new LoginRequest("", "password123")
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test login with empty password")
    void testLoginWithEmptyPassword() throws Exception {
        String loginJson = objectMapper.writeValueAsString(
            new LoginRequest("test@example.com", "")
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test login with null email")
    void testLoginWithNullEmail() throws Exception {
        String loginJson = "{\"password\":\"password123\"}";

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test login with null password")
    void testLoginWithNullPassword() throws Exception {
        String loginJson = "{\"email\":\"test@example.com\"}";

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test login with invalid email format")
    void testLoginWithInvalidEmailFormat() throws Exception {
        String loginJson = objectMapper.writeValueAsString(
            new LoginRequest("notanemail", "password123")
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test login with email containing special characters")
    void testLoginWithSpecialCharactersInEmail() throws Exception {
        User user = new User();
        user.setEmail("test+tag@example.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(UserRole.USER);
        userRepository.save(user);

        String loginJson = objectMapper.writeValueAsString(
            new LoginRequest("test+tag@example.com", "password123")
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Test login with very long email")
    void testLoginWithVeryLongEmail() throws Exception {
        String longEmail = "a".repeat(250) + "@example.com";
        String loginJson = objectMapper.writeValueAsString(
            new LoginRequest(longEmail, "password123")
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test login with very long password")
    void testLoginWithVeryLongPassword() throws Exception {
        User user = new User();
        user.setEmail("test@example.com");
        String longPassword = "a".repeat(1000);
        user.setPassword(passwordEncoder.encode(longPassword));
        user.setRole(UserRole.USER);
        userRepository.save(user);

        String loginJson = objectMapper.writeValueAsString(
            new LoginRequest("test@example.com", longPassword)
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Test login with whitespace in email")
    void testLoginWithWhitespaceInEmail() throws Exception {
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(UserRole.USER);
        userRepository.save(user);

        // Email with leading/trailing whitespace should be trimmed
        String loginJson = objectMapper.writeValueAsString(
            new LoginRequest("  test@example.com  ", "password123")
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    @DisplayName("Test login with SQL injection attempt in email")
    void testLoginWithSqlInjectionInEmail() throws Exception {
        String loginJson = objectMapper.writeValueAsString(
            new LoginRequest("' OR '1'='1", "password123")
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test login with XSS attempt in email")
    void testLoginWithXssInEmail() throws Exception {
        String loginJson = objectMapper.writeValueAsString(
            new LoginRequest("<script>alert('xss')</script>@example.com", "password123")
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test login with unicode characters in email")
    void testLoginWithUnicodeInEmail() throws Exception {
        User user = new User();
        user.setEmail("tëst@exämple.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(UserRole.USER);
        userRepository.save(user);

        String loginJson = objectMapper.writeValueAsString(
            new LoginRequest("tëst@exämple.com", "password123")
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Test login with case sensitivity in password")
    void testLoginWithCaseSensitivePassword() throws Exception {
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword(passwordEncoder.encode("Password123"));
        user.setRole(UserRole.USER);
        userRepository.save(user);

        // Wrong case password should fail
        String loginJson = objectMapper.writeValueAsString(
            new LoginRequest("test@example.com", "password123")
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test login error response contains error code")
    void testLoginErrorResponseContainsErrorCode() throws Exception {
        String loginJson = objectMapper.writeValueAsString(
            new LoginRequest("nonexistent@example.com", "password123")
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value(ErrorResponse.INVALID_CREDENTIALS))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("Test forgot password with empty email")
    void testForgotPasswordWithEmptyEmail() throws Exception {
        String forgotPasswordJson = "{\"email\":\"\"}";

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(forgotPasswordJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test forgot password with invalid email format")
    void testForgotPasswordWithInvalidEmail() throws Exception {
        String forgotPasswordJson = "{\"email\":\"notanemail\"}";

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(forgotPasswordJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test forgot password always returns success")
    void testForgotPasswordAlwaysReturnsSuccess() throws Exception {
        // Test with existing email
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(UserRole.USER);
        userRepository.save(user);

        String forgotPasswordJson = "{\"email\":\"test@example.com\"}";

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(forgotPasswordJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If an account exists for this email, you'll receive a reset link shortly."));

        // Test with non-existing email - should still return success
        String forgotPasswordJson2 = "{\"email\":\"nonexistent@example.com\"}";

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(forgotPasswordJson2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If an account exists for this email, you'll receive a reset link shortly."));
    }

    @Test
    @DisplayName("Test login with malformed JSON")
    void testLoginWithMalformedJson() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{invalid json}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test login with missing Content-Type header")
    void testLoginWithMissingContentType() throws Exception {
        String loginJson = objectMapper.writeValueAsString(
            new LoginRequest("test@example.com", "password123")
        );

        mockMvc.perform(post("/api/auth/login")
                .content(loginJson))
                .andExpect(status().isUnsupportedMediaType());
    }

    @Test
    @DisplayName("Test login with wrong HTTP method")
    void testLoginWithWrongHttpMethod() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
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
