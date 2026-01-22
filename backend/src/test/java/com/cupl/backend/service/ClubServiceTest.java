package com.cupl.backend.service;

import com.cupl.backend.BaseTest;
import com.cupl.backend.dto.CreateClubRequest;
import com.cupl.backend.model.Club;
import com.cupl.backend.model.Player;
import com.cupl.backend.model.Team;
import com.cupl.backend.repository.ClubRepository;
import com.cupl.backend.repository.PlayerRepository;
import com.cupl.backend.repository.TeamRepository;
import com.cupl.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Club Service Tests")
public class ClubServiceTest extends BaseTest {

    @Autowired
    private ClubService clubService;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private TeamRepository teamRepository;

    @BeforeEach
    void setUp() {
        clubRepository.deleteAll();
        userRepository.deleteAll();
        playerRepository.deleteAll();
        teamRepository.deleteAll();
    }

    @Test
    @DisplayName("Test create club successfully")
    void testCreateClub() {
        CreateClubRequest request = new CreateClubRequest();
        request.setName("Test Club");
        request.setEmail("test@club.com");
        request.setPassword("password123");

        Club club = clubService.createClub(request);

        assertNotNull(club);
        assertEquals("Test Club", club.getName());
        assertEquals("test@club.com", club.getEmail());

        // Verify user was created
        assertTrue(userRepository.findByEmail("test@club.com").isPresent());

        // Verify teams were created (3 men's + 1 women's)
        List<Team> teams = teamRepository.findByClubId(club.getId());
        assertEquals(4, teams.size());
        
        long mensTeams = teams.stream().filter(t -> t.getType() == Team.TeamType.MEN).count();
        long womensTeams = teams.stream().filter(t -> t.getType() == Team.TeamType.WOMEN).count();
        assertEquals(3, mensTeams);
        assertEquals(1, womensTeams);
    }

    @Test
    @DisplayName("Test create club with duplicate email")
    void testCreateClubWithDuplicateEmail() {
        CreateClubRequest request1 = new CreateClubRequest();
        request1.setName("Club 1");
        request1.setEmail("test@club.com");
        request1.setPassword("password123");
        clubService.createClub(request1);

        CreateClubRequest request2 = new CreateClubRequest();
        request2.setName("Club 2");
        request2.setEmail("test@club.com"); // Duplicate
        request2.setPassword("password456");

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> clubService.createClub(request2)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    @DisplayName("Test get club players with pagination")
    void testGetClubPlayers() {
        // Create club
        CreateClubRequest clubRequest = new CreateClubRequest();
        clubRequest.setName("Test Club");
        clubRequest.setEmail("test@club.com");
        clubRequest.setPassword("password123");
        Club club = clubService.createClub(clubRequest);

        // Create players
        for (int i = 0; i < 15; i++) {
            Player player = new Player();
            player.setFullName("Player " + i);
            player.setGender("Male");
            player.setDateOfBirth(LocalDate.of(2000, 1, 1));
            player.setUniversity("Test University");
            player.setTeamLevel("Intermediate");
            player.setEmail("player" + i + "@test.com");
            player.setPassword("encoded");
            player.setClubId(club.getId());
            playerRepository.save(player);
        }

        // Test pagination
        Page<Player> page1 = clubService.getClubPlayers(club.getId(), 0, 10);
        assertEquals(10, page1.getContent().size());

        Page<Player> page2 = clubService.getClubPlayers(club.getId(), 1, 10);
        assertEquals(5, page2.getContent().size());

        long total = clubService.getClubPlayersCount(club.getId());
        assertEquals(15, total);
    }
}
