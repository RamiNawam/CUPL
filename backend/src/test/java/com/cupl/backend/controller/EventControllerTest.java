package com.cupl.backend.controller;

import com.cupl.backend.BaseTest;
import com.cupl.backend.model.Event;
import com.cupl.backend.repository.EventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Event Controller Tests")
public class EventControllerTest extends BaseTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private EventRepository eventRepository;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();
        eventRepository.deleteAll();
    }

    @Test
    @DisplayName("Test create event successfully")
    @WithMockUser(roles = "ADMIN")
    void testCreateEvent() throws Exception {
        String eventJson = objectMapper.writeValueAsString(new EventRequest(
            "Test Event",
            "March 15, 2024",
            "Montreal, QC",
            "This is a test event description",
            null
        ));

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Event"))
                .andExpect(jsonPath("$.date").value("March 15, 2024"))
                .andExpect(jsonPath("$.location").value("Montreal, QC"))
                .andExpect(jsonPath("$.description").value("This is a test event description"));

        assertEquals(1, eventRepository.count());
    }

    @Test
    @DisplayName("Test create event with image")
    @WithMockUser(roles = "ADMIN")
    void testCreateEventWithImage() throws Exception {
        // Create a simple base64 image (1x1 red pixel PNG)
        String base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

        String eventJson = objectMapper.writeValueAsString(new EventRequest(
            "Event with Image",
            "March 20, 2024",
            "Toronto, ON",
            "Event description",
            base64Image
        ));

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Event with Image"))
                .andExpect(jsonPath("$.image").exists());
    }

    @Test
    @DisplayName("Test get all events")
    void testGetAllEvents() throws Exception {
        // Create test events
        Event event1 = new Event();
        event1.setTitle("Event 1");
        event1.setDate("March 1, 2024");
        event1.setLocation("Location 1");
        event1.setDescription("Description 1");
        eventRepository.save(event1);

        Event event2 = new Event();
        event2.setTitle("Event 2");
        event2.setDate("March 2, 2024");
        event2.setLocation("Location 2");
        event2.setDescription("Description 2");
        eventRepository.save(event2);

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").exists())
                .andExpect(jsonPath("$[1].title").exists());
    }

    @Test
    @DisplayName("Test create event with missing required fields")
    @WithMockUser(roles = "ADMIN")
    void testCreateEventWithMissingFields() throws Exception {
        String eventJson = objectMapper.writeValueAsString(new EventRequest(
            "", // Empty title
            "March 15, 2024",
            "Montreal, QC",
            "Description",
            null
        ));

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isBadRequest());
    }

    // Helper class for event request
    private static class EventRequest {
        public String title;
        public String date;
        public String location;
        public String description;
        public String image;

        public EventRequest(String title, String date, String location, String description, String image) {
            this.title = title;
            this.date = date;
            this.location = location;
            this.description = description;
            this.image = image;
        }
    }
}
