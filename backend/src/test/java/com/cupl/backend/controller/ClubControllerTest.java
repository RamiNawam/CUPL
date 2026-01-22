package com.cupl.backend.controller;

import com.cupl.backend.BaseTest;
import com.cupl.backend.model.Club;
import com.cupl.backend.model.Player;
import com.cupl.backend.model.Team;
import com.cupl.backend.model.User;
import com.cupl.backend.model.User.UserRole;
import com.cupl.backend.repository.ClubRepository;
import com.cupl.backend.repository.PlayerRepository;
import com.cupl.backend.repository.TeamRepository;
import com.cupl.backend.repository.UserRepository;
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

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Club Controller Tests")
public class ClubControllerTest extends BaseTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private TeamRepository teamRepository;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private Club testClub;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();
        clubRepository.deleteAll();
        userRepository.deleteAll();
        playerRepository.deleteAll();
        teamRepository.deleteAll();

        // Create test club
        testClub = new Club();
        testClub.setName("Test Club");
        testClub.setEmail("club@test.com");
        testClub = clubRepository.save(testClub);

        User clubUser = new User();
        clubUser.setEmail("club@test.com");
        clubUser.setPassword("encoded");
        clubUser.setRole(UserRole.CLUB);
        userRepository.save(clubUser);
    }

    @Test
    @DisplayName("Test create club successfully")
    @WithMockUser(roles = "ADMIN")
    void testCreateClub() throws Exception {
        String clubJson = objectMapper.writeValueAsString(new CreateClubRequest(
            "New Club",
            "newclub@test.com",
            "password123"
        ));

        mockMvc.perform(post("/api/clubs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(clubJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Club"))
                .andExpect(jsonPath("$.email").value("newclub@test.com"));

        // Verify teams were created (3 men's + 1 women's)
        Club createdClub = clubRepository.findByEmail("newclub@test.com").orElse(null);
        assertNotNull(createdClub);
        assertEquals(4, teamRepository.findByClubId(createdClub.getId()).size());
    }

    @Test
    @DisplayName("Test get club by email")
    @WithMockUser(roles = "CLUB")
    void testGetClubByEmail() throws Exception {
        mockMvc.perform(get("/api/clubs/by-email")
                .param("email", "club@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Club"))
                .andExpect(jsonPath("$.email").value("club@test.com"));
    }

    @Test
    @DisplayName("Test get club players with pagination")
    @WithMockUser(roles = "CLUB")
    void testGetClubPlayers() throws Exception {
        // Create test players
        for (int i = 0; i < 15; i++) {
            Player player = new Player();
            player.setFullName("Player " + i);
            player.setGender(i % 2 == 0 ? "Male" : "Female");
            player.setDateOfBirth(LocalDate.of(2000, 1, 1));
            player.setUniversity("Test University");
            player.setTeamLevel("Intermediate");
            player.setEmail("player" + i + "@test.com");
            player.setPassword("encoded");
            player.setClubId(testClub.getId());
            playerRepository.save(player);
        }

        // Test first page
        mockMvc.perform(get("/api/clubs/{clubId}/players", testClub.getId())
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(10))
                .andExpect(jsonPath("$.totalElements").value(15))
                .andExpect(jsonPath("$.totalPages").value(2));

        // Test second page
        mockMvc.perform(get("/api/clubs/{clubId}/players", testClub.getId())
                .param("page", "1")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(5));
    }

    @Test
    @DisplayName("Test get club teams")
    @WithMockUser(roles = "CLUB")
    void testGetClubTeams() throws Exception {
        mockMvc.perform(get("/api/clubs/{clubId}/teams", testClub.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Test add player to team")
    @WithMockUser(roles = "CLUB")
    void testAddPlayerToTeam() throws Exception {
        // Create a team
        Team team = new Team();
        team.setClubId(testClub.getId());
        team.setType(Team.TeamType.MEN);
        team.setTeamNumber(1);
        team = teamRepository.save(team);

        // Create a player
        Player player = new Player();
        player.setFullName("Test Player");
        player.setGender("Male");
        player.setDateOfBirth(LocalDate.of(2000, 1, 1));
        player.setUniversity("Test University");
        player.setTeamLevel("Intermediate");
        player.setEmail("testplayer@test.com");
        player.setPassword("encoded");
        player.setClubId(testClub.getId());
        player = playerRepository.save(player);

        String requestJson = objectMapper.writeValueAsString(new AddPlayerToTeamRequest(
            player.getId().toString(),
            team.getId().toString()
        ));

        mockMvc.perform(post("/api/clubs/{clubId}/teams/players", testClub.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk());
    }

    // Helper classes
    private static class CreateClubRequest {
        public String name;
        public String email;
        public String password;

        public CreateClubRequest(String name, String email, String password) {
            this.name = name;
            this.email = email;
            this.password = password;
        }
    }

    private static class AddPlayerToTeamRequest {
        public String playerId;
        public String teamId;

        public AddPlayerToTeamRequest(String playerId, String teamId) {
            this.playerId = playerId;
            this.teamId = teamId;
        }
    }
}
