package com.cupl.backend.controller;

import com.cupl.backend.dto.AddPlayerToTeamRequest;
import com.cupl.backend.dto.CreateClubRequest;
import com.cupl.backend.dto.PlayerResponse;
import com.cupl.backend.dto.PlayersPageResponse;
import com.cupl.backend.model.Club;
import com.cupl.backend.model.Player;
import com.cupl.backend.model.Team;
import com.cupl.backend.service.ClubService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clubs")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class ClubController {
    private final ClubService clubService;

    public ClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    @PostMapping
    public ResponseEntity<Club> createClub(@Valid @RequestBody CreateClubRequest request) {
        Club saved = clubService.createClub(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/by-email")
    public ResponseEntity<Club> getClubByEmail(@RequestParam String email) {
        Club club = clubService.getClubByEmail(email);
        return ResponseEntity.ok(club);
    }

    @GetMapping("/{clubId}/players")
    public ResponseEntity<PlayersPageResponse> getClubPlayers(
            @PathVariable UUID clubId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (page < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page index must not be less than zero");
        }

        int safeSize = size < 1 ? 10 : size;
        org.springframework.data.domain.Page<Player> playerPage = clubService.getClubPlayers(clubId, page, safeSize);
        List<PlayerResponse> content = playerPage.getContent().stream()
                .map(PlayerResponse::from)
                .toList();

        PlayersPageResponse response = new PlayersPageResponse(
                content,
                playerPage.getTotalElements(),
                playerPage.getTotalPages(),
                playerPage.getNumber(),
                playerPage.getSize()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{clubId}/teams")
    public ResponseEntity<List<Team>> getClubTeams(@PathVariable UUID clubId) {
        List<Team> teams = clubService.getClubTeams(clubId);
        return ResponseEntity.ok(teams);
    }

    @PostMapping("/{clubId}/teams/players")
    public ResponseEntity<Void> addPlayerToTeam(
            @PathVariable UUID clubId,
            @Valid @RequestBody AddPlayerToTeamRequest request) {
        clubService.addPlayerToTeam(clubId, request);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/teams/{teamId}/players")
    public ResponseEntity<List<PlayerResponse>> getTeamPlayers(@PathVariable UUID teamId) {
        List<PlayerResponse> players = clubService.getTeamPlayers(teamId).stream()
                .map(PlayerResponse::from)
                .toList();
        return ResponseEntity.ok(players);
    }
    
    @DeleteMapping("/{clubId}/teams/{teamId}/players/{playerId}")
    public ResponseEntity<Void> removePlayerFromTeam(
            @PathVariable UUID clubId,
            @PathVariable UUID teamId,
            @PathVariable UUID playerId) {
        clubService.removePlayerFromTeam(clubId, playerId, teamId);
        return ResponseEntity.ok().build();
    }
}
