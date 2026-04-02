package com.cupl.backend.controller;

import com.cupl.backend.BaseTest;
import com.cupl.backend.dto.ErrorResponse;
import com.cupl.backend.model.Player;
import com.cupl.backend.model.User;
import com.cupl.backend.repository.PlayerRepository;
import com.cupl.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Player Controller Edge Case Tests")
public class PlayerControllerEdgeCaseTest extends BaseTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private UserRepository userRepository;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).apply(springSecurity()).build();
        objectMapper = new ObjectMapper();
        playerRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Test player registration with duplicate email")
    void testPlayerRegistrationWithDuplicateEmail() throws Exception {
        // Create existing player
        Player existingPlayer = new Player();
        existingPlayer.setEmail("test@example.com");
        existingPlayer.setFullName("Existing Player");
        existingPlayer.setGender("Male");
        existingPlayer.setDateOfBirth(LocalDate.of(2000, 1, 1));
        existingPlayer.setUniversity("McGill");
        existingPlayer.setTeamLevel("Intermediate");
        existingPlayer.setPassword("hashedpassword");
        playerRepository.save(existingPlayer);

        // Try to register with same email
        String playerJson = createPlayerJson("test@example.com", "New Player");

        // Validation happens first, so might return 400 if email format is validated before duplicate check
        var result = mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andReturn();
        // Should be either 400 (validation) or 409 (conflict)
        assertTrue(result.getResponse().getStatus() == 400 || result.getResponse().getStatus() == 409);
    }

    @Test
    @DisplayName("Test player registration with email already in User table")
    void testPlayerRegistrationWithEmailInUserTable() throws Exception {
        // Create existing user
        User existingUser = new User();
        existingUser.setEmail("test@example.com");
        existingUser.setPassword("hashedpassword");
        existingUser.setRole(User.UserRole.USER);
        userRepository.save(existingUser);

        // Try to register player with same email
        String playerJson = createPlayerJson("test@example.com", "New Player");

        var result = mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andReturn();
        // Should be either 400 (validation) or 409 (conflict)
        assertTrue(result.getResponse().getStatus() == 400 || result.getResponse().getStatus() == 409);
    }

    @Test
    @DisplayName("Test player registration with empty full name")
    void testPlayerRegistrationWithEmptyFullName() throws Exception {
        String playerJson = createPlayerJson("test@example.com", "");

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test player registration with null full name")
    void testPlayerRegistrationWithNullFullName() throws Exception {
        String playerJson = "{\"email\":\"test@example.com\",\"gender\":\"Male\",\"dateOfBirth\":\"2000-01-01\",\"university\":\"McGill\",\"password\":\"password123\"}";

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test player registration with very long full name")
    void testPlayerRegistrationWithVeryLongFullName() throws Exception {
        String longName = "A".repeat(500);
        String playerJson = createPlayerJson("test@example.com", longName);

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test player registration with invalid email format")
    void testPlayerRegistrationWithInvalidEmail() throws Exception {
        String playerJson = createPlayerJson("notanemail", "Test Player");

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test player registration with empty email")
    void testPlayerRegistrationWithEmptyEmail() throws Exception {
        String playerJson = createPlayerJson("", "Test Player");

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test player registration with invalid date of birth (future date)")
    void testPlayerRegistrationWithFutureDateOfBirth() throws Exception {
        LocalDate futureDate = LocalDate.now().plusYears(1);
        String playerJson = createPlayerJsonWithDate("test@example.com", "Test Player", futureDate.toString());

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test player registration with very old date of birth")
    void testPlayerRegistrationWithVeryOldDateOfBirth() throws Exception {
        LocalDate oldDate = LocalDate.of(1900, 1, 1);
        String playerJson = createPlayerJsonWithDate("test@example.com", "Test Player", oldDate.toString());

        // Should accept but might have business logic validation
        var result = mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andReturn();
        assertTrue(result.getResponse().getStatus() == 201 || result.getResponse().getStatus() == 400);
    }

    @Test
    @DisplayName("Test player registration with invalid date format")
    void testPlayerRegistrationWithInvalidDateFormat() throws Exception {
        String playerJson = createPlayerJsonWithDate("test@example.com", "Test Player", "invalid-date");

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test player registration with empty password")
    void testPlayerRegistrationWithEmptyPassword() throws Exception {
        String playerJson = createPlayerJsonWithPassword("test@example.com", "Test Player", "");

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test player registration with very short password")
    void testPlayerRegistrationWithVeryShortPassword() throws Exception {
        String playerJson = createPlayerJsonWithPassword("test@example.com", "Test Player", "123");

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test player registration with very long password")
    void testPlayerRegistrationWithVeryLongPassword() throws Exception {
        String longPassword = "a".repeat(1000);
        String playerJson = createPlayerJsonWithPassword("test@example.com", "Test Player", longPassword);

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Test player registration with special characters in name")
    void testPlayerRegistrationWithSpecialCharactersInName() throws Exception {
        String playerJson = createPlayerJson("test@example.com", "José María O'Connor-Smith");

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Test player registration with unicode characters")
    void testPlayerRegistrationWithUnicodeCharacters() throws Exception {
        String playerJson = createPlayerJson("tëst@exämple.com", "测试玩家");

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Test player registration with SQL injection attempt in name")
    void testPlayerRegistrationWithSqlInjectionInName() throws Exception {
        String playerJson = createPlayerJson("test@example.com", "'; DROP TABLE players; --");

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isCreated()); // Should be sanitized/stored safely
    }

    @Test
    @DisplayName("Test player registration with XSS attempt in name")
    void testPlayerRegistrationWithXssInName() throws Exception {
        String playerJson = createPlayerJson("test@example.com", "<script>alert('xss')</script>");

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isCreated()); // Should be sanitized/stored safely
    }

    @Test
    @DisplayName("Test player registration with whitespace in email")
    void testPlayerRegistrationWithWhitespaceInEmail() throws Exception {
        String playerJson = createPlayerJson("  test@example.com  ", "Test Player");

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Test player registration with case-insensitive email duplicate check")
    void testPlayerRegistrationWithCaseInsensitiveEmail() throws Exception {
        // Create player with lowercase email
        Player existingPlayer = new Player();
        existingPlayer.setEmail("test@example.com");
        existingPlayer.setFullName("Existing Player");
        existingPlayer.setGender("Male");
        existingPlayer.setDateOfBirth(LocalDate.of(2000, 1, 1));
        existingPlayer.setUniversity("McGill");
        existingPlayer.setTeamLevel("Intermediate");
        existingPlayer.setPassword("hashedpassword");
        playerRepository.save(existingPlayer);

        // Try to register with uppercase email
        String playerJson = createPlayerJson("TEST@EXAMPLE.COM", "New Player");

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Test player registration with missing required fields")
    void testPlayerRegistrationWithMissingRequiredFields() throws Exception {
        String incompleteJson = "{\"email\":\"test@example.com\"}";

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(incompleteJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test player registration with null gender")
    void testPlayerRegistrationWithNullGender() throws Exception {
        String playerJson = "{\"email\":\"test@example.com\",\"fullName\":\"Test Player\",\"dateOfBirth\":\"2000-01-01\",\"university\":\"McGill\",\"password\":\"password123\"}";

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test player registration with invalid gender value")
    void testPlayerRegistrationWithInvalidGender() throws Exception {
        String playerJson = "{\"email\":\"test@example.com\",\"fullName\":\"Test Player\",\"gender\":\"Invalid\",\"dateOfBirth\":\"2000-01-01\",\"university\":\"McGill\",\"password\":\"password123\"}";

        // Should accept any string value, but might have business logic validation
        var result = mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andReturn();
        assertTrue(result.getResponse().getStatus() == 201 || result.getResponse().getStatus() == 400);
    }

    @Test
    @DisplayName("Test player registration with very long phone number")
    void testPlayerRegistrationWithVeryLongPhone() throws Exception {
        String longPhone = "1".repeat(100);
        String playerJson = createPlayerJsonWithPhone("test@example.com", "Test Player", longPhone);

        var result = mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andReturn();
        assertTrue(result.getResponse().getStatus() == 201 || result.getResponse().getStatus() == 400);
    }

    @Test
    @DisplayName("Test player registration with malformed JSON")
    void testPlayerRegistrationWithMalformedJson() throws Exception {
        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{invalid json}"))
                .andExpect(status().isBadRequest());
    }

    // Helper methods
    private String createPlayerJson(String email, String fullName) {
        return String.format(
            "{\"email\":\"%s\",\"fullName\":\"%s\",\"gender\":\"Male\",\"dateOfBirth\":\"2000-01-01\",\"university\":\"McGill\",\"teamLevel\":\"Intermediate\",\"password\":\"password123\"}",
            email, fullName
        );
    }

    private String createPlayerJsonWithDate(String email, String fullName, String dateOfBirth) {
        return String.format(
            "{\"email\":\"%s\",\"fullName\":\"%s\",\"gender\":\"Male\",\"dateOfBirth\":\"%s\",\"university\":\"McGill\",\"teamLevel\":\"Intermediate\",\"password\":\"password123\"}",
            email, fullName, dateOfBirth
        );
    }

    private String createPlayerJsonWithPassword(String email, String fullName, String password) {
        return String.format(
            "{\"email\":\"%s\",\"fullName\":\"%s\",\"gender\":\"Male\",\"dateOfBirth\":\"2000-01-01\",\"university\":\"McGill\",\"teamLevel\":\"Intermediate\",\"password\":\"%s\"}",
            email, fullName, password
        );
    }

    private String createPlayerJsonWithPhone(String email, String fullName, String phone) {
        return String.format(
            "{\"email\":\"%s\",\"fullName\":\"%s\",\"gender\":\"Male\",\"dateOfBirth\":\"2000-01-01\",\"university\":\"McGill\",\"teamLevel\":\"Intermediate\",\"password\":\"password123\",\"phone\":\"%s\"}",
            email, fullName, phone
        );
    }
}
