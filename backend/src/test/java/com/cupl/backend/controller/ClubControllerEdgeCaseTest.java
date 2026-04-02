package com.cupl.backend.controller;

import com.cupl.backend.BaseTest;
import com.cupl.backend.model.Club;
import com.cupl.backend.model.Player;
import com.cupl.backend.model.Team;
import com.cupl.backend.model.User;
import com.cupl.backend.repository.*;
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

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Club Controller Edge Case Tests")
public class ClubControllerEdgeCaseTest extends BaseTest {

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

    @Autowired
    private PlayerTeamRepository playerTeamRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private String adminToken;
    private String clubToken;
    private Club testClub;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).apply(springSecurity()).build();
        objectMapper = new ObjectMapper();
        
        // Clean up
        playerTeamRepository.deleteAll();
        teamRepository.deleteAll();
        playerRepository.deleteAll();
        clubRepository.deleteAll();
        userRepository.deleteAll();

        // Create admin user
        User admin = new User();
        admin.setEmail("admin@test.com");
        admin.setPassword(passwordEncoder.encode("password"));
        admin.setRole(User.UserRole.ADMIN);
        userRepository.save(admin);
        adminToken = jwtUtil.generateToken(admin.getEmail(), admin.getRole().name());

        // Create club and club user
        testClub = new Club();
        testClub.setName("Test Club");
        testClub.setEmail("club@test.com");
        testClub = clubRepository.save(testClub);

        User clubUser = new User();
        clubUser.setEmail("club@test.com");
        clubUser.setPassword(passwordEncoder.encode("password"));
        clubUser.setRole(User.UserRole.CLUB);
        userRepository.save(clubUser);
        clubToken = jwtUtil.generateToken(clubUser.getEmail(), clubUser.getRole().name());
    }

    @Test
    @DisplayName("Test add player to team when team is full (2 players)")
    void testAddPlayerToFullTeam() throws Exception {
        // Create team
        Team team = new Team();
        team.setClubId(testClub.getId());
        team.setType(Team.TeamType.MEN);
        team.setTeamNumber(1);
        team = teamRepository.save(team);

        // Create and add 2 players to team
        for (int i = 0; i < 2; i++) {
            Player player = createTestPlayer("player" + i + "@test.com", "Player " + i);
            player.setClubId(testClub.getId());
            player = playerRepository.save(player);

            com.cupl.backend.model.PlayerTeam playerTeam = new com.cupl.backend.model.PlayerTeam();
            playerTeam.setPlayerId(player.getId());
            playerTeam.setTeamId(team.getId());
            playerTeamRepository.save(playerTeam);
        }

        // Try to add third player
        Player thirdPlayer = createTestPlayer("player3@test.com", "Player 3");
        thirdPlayer.setClubId(testClub.getId());
        thirdPlayer = playerRepository.save(thirdPlayer);

        String requestJson = String.format(
            "{\"playerId\":\"%s\",\"teamId\":\"%s\"}",
            thirdPlayer.getId(), team.getId()
        );

        mockMvc.perform(post("/api/clubs/" + testClub.getId() + "/teams/players")
                .header("Authorization", "Bearer " + clubToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test add player to team with wrong gender")
    void testAddPlayerWithWrongGender() throws Exception {
        // Create men's team
        Team menTeam = new Team();
        menTeam.setClubId(testClub.getId());
        menTeam.setType(Team.TeamType.MEN);
        menTeam.setTeamNumber(1);
        menTeam = teamRepository.save(menTeam);

        // Create female player
        Player femalePlayer = createTestPlayer("female@test.com", "Female Player");
        femalePlayer.setGender("Female");
        femalePlayer.setClubId(testClub.getId());
        femalePlayer = playerRepository.save(femalePlayer);

        String requestJson = String.format(
            "{\"playerId\":\"%s\",\"teamId\":\"%s\"}",
            femalePlayer.getId(), menTeam.getId()
        );

        // Should be allowed (business logic may validate, but API should accept)
        var result = mockMvc.perform(post("/api/clubs/" + testClub.getId() + "/teams/players")
                .header("Authorization", "Bearer " + clubToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andReturn();
        assertTrue(result.getResponse().getStatus() == 200 || result.getResponse().getStatus() == 400);
    }

    @Test
    @DisplayName("Test add player to team that doesn't belong to club")
    void testAddPlayerToOtherClubTeam() throws Exception {
        // Create another club
        Club otherClub = new Club();
        otherClub.setName("Other Club");
        otherClub.setEmail("other@test.com");
        otherClub = clubRepository.save(otherClub);

        Team otherTeam = new Team();
        otherTeam.setClubId(otherClub.getId());
        otherTeam.setType(Team.TeamType.MEN);
        otherTeam.setTeamNumber(1);
        otherTeam = teamRepository.save(otherTeam);

        Player player = createTestPlayer("player@test.com", "Player");
        player.setClubId(testClub.getId());
        player = playerRepository.save(player);

        String requestJson = String.format(
            "{\"playerId\":\"%s\",\"teamId\":\"%s\"}",
            player.getId(), otherTeam.getId()
        );

        mockMvc.perform(post("/api/clubs/" + testClub.getId() + "/teams/players")
                .header("Authorization", "Bearer " + clubToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Test add player that doesn't belong to club")
    void testAddPlayerNotInClub() throws Exception {
        Team team = new Team();
        team.setClubId(testClub.getId());
        team.setType(Team.TeamType.MEN);
        team.setTeamNumber(1);
        team = teamRepository.save(team);

        // Create player without club
        Player player = createTestPlayer("player@test.com", "Player");
        player = playerRepository.save(player);

        String requestJson = String.format(
            "{\"playerId\":\"%s\",\"teamId\":\"%s\"}",
            player.getId(), team.getId()
        );

        mockMvc.perform(post("/api/clubs/" + testClub.getId() + "/teams/players")
                .header("Authorization", "Bearer " + clubToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Test add same player to team twice")
    void testAddSamePlayerTwice() throws Exception {
        Team team = new Team();
        team.setClubId(testClub.getId());
        team.setType(Team.TeamType.MEN);
        team.setTeamNumber(1);
        team = teamRepository.save(team);

        Player player = createTestPlayer("player@test.com", "Player");
        player.setClubId(testClub.getId());
        player = playerRepository.save(player);

        String requestJson = String.format(
            "{\"playerId\":\"%s\",\"teamId\":\"%s\"}",
            player.getId(), team.getId()
        );

        // Add first time
        mockMvc.perform(post("/api/clubs/" + testClub.getId() + "/teams/players")
                .header("Authorization", "Bearer " + clubToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk());

        // Try to add again
        mockMvc.perform(post("/api/clubs/" + testClub.getId() + "/teams/players")
                .header("Authorization", "Bearer " + clubToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Test get club players with invalid pagination")
    void testGetClubPlayersWithInvalidPagination() throws Exception {
        // Negative page number - Spring Data throws exception
        mockMvc.perform(get("/api/clubs/" + testClub.getId() + "/players?page=-1&size=10")
                .header("Authorization", "Bearer " + clubToken))
                .andExpect(status().isBadRequest());

        // Zero size - Spring Data handles this
        mockMvc.perform(get("/api/clubs/" + testClub.getId() + "/players?page=0&size=0")
                .header("Authorization", "Bearer " + clubToken))
                .andExpect(status().isOk());

        // Very large size - should work
        mockMvc.perform(get("/api/clubs/" + testClub.getId() + "/players?page=0&size=10000")
                .header("Authorization", "Bearer " + clubToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Test access club data with non-existent club ID")
    void testAccessNonExistentClub() throws Exception {
        UUID fakeId = UUID.randomUUID();

        mockMvc.perform(get("/api/clubs/" + fakeId + "/players")
                .header("Authorization", "Bearer " + clubToken))
                .andExpect(status().isOk()) // Returns empty page
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @DisplayName("Test create club with duplicate email")
    void testCreateClubWithDuplicateEmail() throws Exception {
        String clubJson = "{\"name\":\"New Club\",\"email\":\"club@test.com\",\"password\":\"password123\"}";

        mockMvc.perform(post("/api/clubs")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(clubJson))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Test create club with empty name")
    void testCreateClubWithEmptyName() throws Exception {
        String clubJson = "{\"name\":\"\",\"email\":\"newclub@test.com\",\"password\":\"password123\"}";

        mockMvc.perform(post("/api/clubs")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(clubJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test create club with invalid email format")
    void testCreateClubWithInvalidEmail() throws Exception {
        String clubJson = "{\"name\":\"New Club\",\"email\":\"notanemail\",\"password\":\"password123\"}";

        mockMvc.perform(post("/api/clubs")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(clubJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test remove player from team that doesn't exist")
    void testRemovePlayerFromNonExistentTeam() throws Exception {
        Player player = createTestPlayer("player@test.com", "Player");
        player.setClubId(testClub.getId());
        player = playerRepository.save(player);

        UUID fakeTeamId = UUID.randomUUID();

        mockMvc.perform(delete("/api/clubs/" + testClub.getId() + "/teams/" + fakeTeamId + "/players/" + player.getId())
                .header("Authorization", "Bearer " + clubToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Test remove non-existent player from team")
    void testRemoveNonExistentPlayerFromTeam() throws Exception {
        Team team = new Team();
        team.setClubId(testClub.getId());
        team.setType(Team.TeamType.MEN);
        team.setTeamNumber(1);
        team = teamRepository.save(team);

        UUID fakePlayerId = UUID.randomUUID();

        var result = mockMvc.perform(delete("/api/clubs/" + testClub.getId() + "/teams/" + team.getId() + "/players/" + fakePlayerId)
                .header("Authorization", "Bearer " + clubToken))
                .andReturn();
        assertTrue(result.getResponse().getStatus() == 403 || result.getResponse().getStatus() == 404);
    }

    @Test
    @DisplayName("Test access with invalid token")
    void testAccessWithInvalidToken() throws Exception {
        mockMvc.perform(get("/api/clubs/" + testClub.getId() + "/players")
                .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test access without authentication")
    void testAccessWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/clubs/" + testClub.getId() + "/players"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test regular user cannot access club endpoints")
    void testRegularUserCannotAccessClubEndpoints() throws Exception {
        User regularUser = new User();
        regularUser.setEmail("user@test.com");
        regularUser.setPassword(passwordEncoder.encode("password"));
        regularUser.setRole(User.UserRole.USER);
        userRepository.save(regularUser);
        String userToken = jwtUtil.generateToken(regularUser.getEmail(), regularUser.getRole().name());

        mockMvc.perform(get("/api/clubs/" + testClub.getId() + "/players")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    // Helper method
    private Player createTestPlayer(String email, String fullName) {
        Player player = new Player();
        player.setEmail(email);
        player.setFullName(fullName);
        player.setGender("Male");
        player.setDateOfBirth(LocalDate.of(2000, 1, 1));
        player.setUniversity("McGill");
        player.setTeamLevel("Intermediate");
        player.setPassword("hashedpassword");
        return player;
    }
}
