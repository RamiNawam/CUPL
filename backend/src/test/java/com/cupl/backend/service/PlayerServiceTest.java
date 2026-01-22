package com.cupl.backend.service;

import com.cupl.backend.BaseTest;
import com.cupl.backend.dto.PlayerRequest;
import com.cupl.backend.model.Club;
import com.cupl.backend.model.Player;
import com.cupl.backend.repository.ClubRepository;
import com.cupl.backend.repository.PlayerRepository;
import com.cupl.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Player Service Tests")
public class PlayerServiceTest extends BaseTest {

    @Autowired
    private PlayerService playerService;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClubRepository clubRepository;

    @BeforeEach
    void setUp() {
        playerRepository.deleteAll();
        userRepository.deleteAll();
        clubRepository.deleteAll();
    }

    @Test
    @DisplayName("Test create player successfully")
    void testCreatePlayer() {
        PlayerRequest request = new PlayerRequest();
        request.setFullName("John Doe");
        request.setGender("Male");
        request.setDateOfBirth(LocalDate.of(2000, 1, 1));
        request.setUniversity("McGill");
        request.setTeamLevel("Intermediate");
        request.setEmail("john@example.com");
        request.setPassword("password123");

        Player player = playerService.createPlayer(request);

        assertNotNull(player);
        assertEquals("John Doe", player.getFullName());
        assertEquals("john@example.com", player.getEmail());
        assertEquals("McGill", player.getUniversity());

        // Verify user was created
        assertTrue(userRepository.findByEmail("john@example.com").isPresent());
    }

    @Test
    @DisplayName("Test create player with duplicate email")
    void testCreatePlayerWithDuplicateEmail() {
        PlayerRequest request1 = new PlayerRequest();
        request1.setFullName("John Doe");
        request1.setGender("Male");
        request1.setDateOfBirth(LocalDate.of(2000, 1, 1));
        request1.setUniversity("McGill");
        request1.setTeamLevel("Intermediate");
        request1.setEmail("john@example.com");
        request1.setPassword("password123");
        playerService.createPlayer(request1);

        PlayerRequest request2 = new PlayerRequest();
        request2.setFullName("Jane Doe");
        request2.setGender("Female");
        request2.setDateOfBirth(LocalDate.of(2001, 1, 1));
        request2.setUniversity("McGill");
        request2.setTeamLevel("Beginner");
        request2.setEmail("john@example.com"); // Duplicate email
        request2.setPassword("password456");

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> playerService.createPlayer(request2)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    @DisplayName("Test player auto-assignment to club")
    void testPlayerAutoAssignmentToClub() {
        // Create a club with unique name (avoid conflict with DataInitializer)
        Club club = new Club();
        club.setName("Test University Padel Club");
        club.setEmail("testuniversity@test.com");
        club = clubRepository.save(club);

        // Create player with matching university
        PlayerRequest request = new PlayerRequest();
        request.setFullName("John Doe");
        request.setGender("Male");
        request.setDateOfBirth(LocalDate.of(2000, 1, 1));
        request.setUniversity("Test University");
        request.setTeamLevel("Intermediate");
        request.setEmail("john@example.com");
        request.setPassword("password123");

        Player player = playerService.createPlayer(request);

        // Player should be auto-assigned to club if university matches
        // The matching logic checks if club name contains university or vice versa
        assertNotNull(player.getClubId());
        assertEquals(club.getId(), player.getClubId());
    }
}
