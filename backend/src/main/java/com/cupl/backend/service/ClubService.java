package com.cupl.backend.service;

import com.cupl.backend.dto.AddPlayerToClubRequest;
import com.cupl.backend.dto.AddPlayerToTeamRequest;
import com.cupl.backend.dto.CreateClubRequest;
import com.cupl.backend.model.Club;
import com.cupl.backend.model.Player;
import com.cupl.backend.model.Team;
import com.cupl.backend.model.User;
import com.cupl.backend.model.User.UserRole;
import com.cupl.backend.repository.ClubRepository;
import com.cupl.backend.repository.PlayerRepository;
import com.cupl.backend.repository.PlayerTeamRepository;
import com.cupl.backend.repository.TeamRepository;
import com.cupl.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Service
public class ClubService {
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final PlayerTeamRepository playerTeamRepository;
    private final PasswordEncoder passwordEncoder;

    public ClubService(
            ClubRepository clubRepository,
            UserRepository userRepository,
            PlayerRepository playerRepository,
            TeamRepository teamRepository,
            PlayerTeamRepository playerTeamRepository,
            PasswordEncoder passwordEncoder) {
        this.clubRepository = clubRepository;
        this.userRepository = userRepository;
        this.playerRepository = playerRepository;
        this.teamRepository = teamRepository;
        this.playerTeamRepository = playerTeamRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Club createClub(CreateClubRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        if (clubRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Club email already exists");
        }

        // Create Club
        Club club = new Club();
        club.setName(request.getName());
        club.setEmail(request.getEmail().toLowerCase().trim());
        Club savedClub = clubRepository.save(club);

        // Create User account for the club
        User user = new User();
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.CLUB);
        userRepository.save(user);

        // Create default teams: 3 men's teams and 1 women's team
        for (int i = 1; i <= 3; i++) {
            Team menTeam = new Team();
            menTeam.setClubId(savedClub.getId());
            menTeam.setType(Team.TeamType.MEN);
            menTeam.setTeamNumber(i);
            teamRepository.save(menTeam);
        }

        Team womenTeam = new Team();
        womenTeam.setClubId(savedClub.getId());
        womenTeam.setType(Team.TeamType.WOMEN);
        womenTeam.setTeamNumber(1);
        teamRepository.save(womenTeam);

        return savedClub;
    }

    public Club getClubByEmail(String email) {
        return clubRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Club not found"));
    }

    public Page<Player> getClubPlayers(UUID clubId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return playerRepository.findByClubId(clubId, pageable);
    }
    
    public long getClubPlayersCount(UUID clubId) {
        return playerRepository.countByClubId(clubId);
    }

    public List<Player> searchPlayers(String searchTerm) {
        return playerRepository.searchPlayers(searchTerm);
    }

    @Transactional
    public void addPlayerToClub(UUID clubId, AddPlayerToClubRequest request) {
        UUID safeClubId = Objects.requireNonNull(clubId, "clubId is required");
        UUID playerId = Objects.requireNonNull(request.getPlayerId(), "playerId is required");
        // Verify club exists
        if (!clubRepository.existsById(safeClubId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Club not found");
        }

        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found"));

        player.setClubId(safeClubId);
        playerRepository.save(player);
    }

    public List<Team> getClubTeams(UUID clubId) {
        return teamRepository.findByClubId(clubId);
    }

    @Transactional
    public void addPlayerToTeam(UUID clubId, AddPlayerToTeamRequest request) {
        UUID safeClubId = Objects.requireNonNull(clubId, "clubId is required");
        UUID playerId = Objects.requireNonNull(request.getPlayerId(), "playerId is required");
        UUID teamId = Objects.requireNonNull(request.getTeamId(), "teamId is required");
        // Verify team belongs to club
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));

        if (!team.getClubId().equals(safeClubId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Team does not belong to this club");
        }

        // Verify player belongs to club
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found"));

        UUID playerClubId = player.getClubId();
        if (playerClubId == null || !playerClubId.equals(safeClubId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Player does not belong to this club");
        }

        // Check if player is already in this team
        List<com.cupl.backend.model.PlayerTeam> existing = playerTeamRepository.findByPlayerIdAndTeamId(
                playerId,
                teamId
        );
        if (!existing.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Player is already in this team");
        }

        // Add player to team
        com.cupl.backend.model.PlayerTeam playerTeam = new com.cupl.backend.model.PlayerTeam();
        playerTeam.setPlayerId(playerId);
        playerTeam.setTeamId(teamId);
        playerTeamRepository.save(playerTeam);
    }

    @Transactional
    public void removePlayerFromTeam(UUID clubId, UUID playerId, UUID teamId) {
        UUID safeClubId = Objects.requireNonNull(clubId, "clubId is required");
        UUID safePlayerId = Objects.requireNonNull(playerId, "playerId is required");
        UUID safeTeamId = Objects.requireNonNull(teamId, "teamId is required");
        // Verify team belongs to club
        Team team = teamRepository.findById(safeTeamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));

        if (!team.getClubId().equals(safeClubId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Team does not belong to this club");
        }
        
        // Verify player belongs to club
        Optional<Player> playerOpt = playerRepository.findById(safePlayerId);
        if (playerOpt.isEmpty() || !safeClubId.equals(playerOpt.get().getClubId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Player does not belong to this club");
        }

        playerTeamRepository.deleteByPlayerIdAndTeamId(safePlayerId, safeTeamId);
    }
    
    public List<Player> getTeamPlayers(UUID teamId) {
        return playerRepository.findByTeamId(teamId);
    }
}
