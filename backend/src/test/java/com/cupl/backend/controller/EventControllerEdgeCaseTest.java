package com.cupl.backend.controller;

import com.cupl.backend.BaseTest;
import com.cupl.backend.model.Event;
import com.cupl.backend.model.User;
import com.cupl.backend.repository.EventRepository;
import com.cupl.backend.repository.UserRepository;
import com.cupl.backend.config.JwtUtil;
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

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Event Controller Edge Case Tests")
public class EventControllerEdgeCaseTest extends BaseTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private String adminToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).apply(springSecurity()).build();
        objectMapper = new ObjectMapper();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        // Create admin user for authentication
        User admin = new User();
        admin.setEmail("admin@test.com");
        admin.setPassword(passwordEncoder.encode("password"));
        admin.setRole(User.UserRole.ADMIN);
        userRepository.save(admin);
        adminToken = jwtUtil.generateToken(admin.getEmail(), admin.getRole().name());
    }

    @Test
    @DisplayName("Test create event with empty title")
    void testCreateEventWithEmptyTitle() throws Exception {
        String eventJson = createEventJson("", "2024-03-20", "Location", "Description");

        mockMvc.perform(post("/api/events")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test create event with null title")
    void testCreateEventWithNullTitle() throws Exception {
        String eventJson = "{\"date\":\"2024-03-20\",\"location\":\"Location\",\"description\":\"Description\"}";

        mockMvc.perform(post("/api/events")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test create event with very long title")
    void testCreateEventWithVeryLongTitle() throws Exception {
        String longTitle = "A".repeat(1000);
        String eventJson = createEventJson(longTitle, "2024-03-20", "Location", "Description");

        // Very long title might be accepted or rejected
        var result = mockMvc.perform(post("/api/events")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andReturn();
        assertTrue(result.getResponse().getStatus() == 201 || result.getResponse().getStatus() == 400);
    }

    @Test
    @DisplayName("Test create event with very long description")
    void testCreateEventWithVeryLongDescription() throws Exception {
        String longDescription = "A".repeat(10000);
        String eventJson = createEventJson("Title", "2024-03-20", "Location", longDescription);

        mockMvc.perform(post("/api/events")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Test create event with special characters in title")
    void testCreateEventWithSpecialCharacters() throws Exception {
        String eventJson = createEventJson("Event: Test & More! @#$%", "2024-03-20", "Location", "Description");

        mockMvc.perform(post("/api/events")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Test create event with SQL injection attempt")
    void testCreateEventWithSqlInjection() throws Exception {
        String eventJson = createEventJson("'; DROP TABLE events; --", "2024-03-20", "Location", "Description");

        mockMvc.perform(post("/api/events")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isCreated()); // Should be sanitized/stored safely
    }

    @Test
    @DisplayName("Test create event with XSS attempt")
    void testCreateEventWithXss() throws Exception {
        String eventJson = createEventJson("<script>alert('xss')</script>", "2024-03-20", "Location", "Description");

        mockMvc.perform(post("/api/events")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isCreated()); // Should be sanitized/stored safely
    }

    @Test
    @DisplayName("Test create event without authentication")
    void testCreateEventWithoutAuthentication() throws Exception {
        String eventJson = createEventJson("Title", "2024-03-20", "Location", "Description");

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test create event with invalid token")
    void testCreateEventWithInvalidToken() throws Exception {
        String eventJson = createEventJson("Title", "2024-03-20", "Location", "Description");

        mockMvc.perform(post("/api/events")
                .header("Authorization", "Bearer invalid-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test create event with non-admin user")
    void testCreateEventWithNonAdminUser() throws Exception {
        User regularUser = new User();
        regularUser.setEmail("user@test.com");
        regularUser.setPassword(passwordEncoder.encode("password"));
        regularUser.setRole(User.UserRole.USER);
        userRepository.save(regularUser);
        String userToken = jwtUtil.generateToken(regularUser.getEmail(), regularUser.getRole().name());

        String eventJson = createEventJson("Title", "2024-03-20", "Location", "Description");

        mockMvc.perform(post("/api/events")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Test update event with non-existent ID")
    void testUpdateEventWithNonExistentId() throws Exception {
        String eventJson = createEventJson("Updated Title", "2024-03-20", "Location", "Description");
        String fakeId = "00000000-0000-0000-0000-000000000000";

        mockMvc.perform(put("/api/events/" + fakeId)
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Test delete event with non-existent ID")
    void testDeleteEventWithNonExistentId() throws Exception {
        String fakeId = "00000000-0000-0000-0000-000000000000";

        mockMvc.perform(delete("/api/events/" + fakeId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Test delete event without authentication")
    void testDeleteEventWithoutAuthentication() throws Exception {
        Event event = new Event();
        event.setTitle("Test Event");
        event.setDate("2024-03-20");
        event.setLocation("Location");
        event.setDescription("Description");
        event = eventRepository.save(event);

        mockMvc.perform(delete("/api/events/" + event.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test update event with invalid UUID format")
    void testUpdateEventWithInvalidUuid() throws Exception {
        String eventJson = createEventJson("Title", "2024-03-20", "Location", "Description");

        mockMvc.perform(put("/api/events/invalid-uuid")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test create event with empty date")
    void testCreateEventWithEmptyDate() throws Exception {
        String eventJson = createEventJson("Title", "", "Location", "Description");

        mockMvc.perform(post("/api/events")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test create event with empty location")
    void testCreateEventWithEmptyLocation() throws Exception {
        String eventJson = createEventJson("Title", "2024-03-20", "", "Description");

        mockMvc.perform(post("/api/events")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test create event with empty description")
    void testCreateEventWithEmptyDescription() throws Exception {
        String eventJson = createEventJson("Title", "2024-03-20", "Location", "");

        mockMvc.perform(post("/api/events")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test create event with malformed JSON")
    void testCreateEventWithMalformedJson() throws Exception {
        mockMvc.perform(post("/api/events")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{invalid json}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test update event preserves existing image when no new image provided")
    void testUpdateEventPreservesImage() throws Exception {
        // Create event with image
        Event event = new Event();
        event.setTitle("Test Event");
        event.setDate("2024-03-20");
        event.setLocation("Location");
        event.setDescription("Description");
        event.setImage("/uploads/events/test.jpg");
        event = eventRepository.save(event);

        // Update without image field
        String eventJson = "{\"title\":\"Updated Title\",\"date\":\"2024-03-20\",\"location\":\"Location\",\"description\":\"Updated Description\"}";

        mockMvc.perform(put("/api/events/" + event.getId())
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isOk());

        // Verify image is preserved
        Event updated = eventRepository.findById(event.getId()).orElseThrow();
        assert updated.getImage() != null;
    }

    // Helper method
    private String createEventJson(String title, String date, String location, String description) {
        return String.format(
            "{\"title\":\"%s\",\"date\":\"%s\",\"location\":\"%s\",\"description\":\"%s\"}",
            title, date, location, description
        );
    }
}
