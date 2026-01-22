package com.cupl.backend.controller;

import com.cupl.backend.BaseTest;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Player Controller Tests")
public class PlayerControllerTest extends BaseTest {

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
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules(); // Enable Java 8 date/time support
        playerRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Test create player successfully")
    void testCreatePlayer() throws Exception {
        String playerJson = objectMapper.writeValueAsString(new PlayerRequest(
            "John Doe",
            "Male",
            LocalDate.of(2000, 1, 1),
            "McGill",
            "Intermediate",
            "john@example.com",
            "password123",
            "123-456-7890",
            null,
            null
        ));

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fullName").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.university").value("McGill"));

        assertEquals(1, playerRepository.count());
        assertEquals(1, userRepository.count());
        
        // Verify user was created
        assertTrue(userRepository.findByEmail("john@example.com").isPresent());
    }

    @Test
    @DisplayName("Test create player with duplicate email")
    void testCreatePlayerWithDuplicateEmail() throws Exception {
        // Create first player
        String playerJson1 = objectMapper.writeValueAsString(new PlayerRequest(
            "John Doe",
            "Male",
            LocalDate.of(2000, 1, 1),
            "McGill",
            "Intermediate",
            "john@example.com",
            "password123",
            null,
            null,
            null
        ));

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson1))
                .andExpect(status().isCreated());

        // Try to create duplicate
        String playerJson2 = objectMapper.writeValueAsString(new PlayerRequest(
            "Jane Doe",
            "Female",
            LocalDate.of(2001, 1, 1),
            "McGill",
            "Beginner",
            "john@example.com", // Same email
            "password456",
            null,
            null,
            null
        ));

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson2))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Test create player with missing required fields")
    void testCreatePlayerWithMissingFields() throws Exception {
        String playerJson = objectMapper.writeValueAsString(new PlayerRequest(
            "", // Empty name
            "Male",
            LocalDate.of(2000, 1, 1),
            "McGill",
            "Intermediate",
            "john@example.com",
            "password123",
            null,
            null,
            null
        ));

        mockMvc.perform(post("/api/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(playerJson))
                .andExpect(status().isBadRequest());
    }

    // Helper class for player request
    private static class PlayerRequest {
        public String fullName;
        public String gender;
        public LocalDate dateOfBirth;
        public String university;
        public String teamLevel;
        public String email;
        public String password;
        public String phone;
        public String medicalConditions;
        public String comments;

        public PlayerRequest(String fullName, String gender, LocalDate dateOfBirth, String university,
                           String teamLevel, String email, String password, String phone,
                           String medicalConditions, String comments) {
            this.fullName = fullName;
            this.gender = gender;
            this.dateOfBirth = dateOfBirth;
            this.university = university;
            this.teamLevel = teamLevel;
            this.email = email;
            this.password = password;
            this.phone = phone;
            this.medicalConditions = medicalConditions;
            this.comments = comments;
        }
    }
}
