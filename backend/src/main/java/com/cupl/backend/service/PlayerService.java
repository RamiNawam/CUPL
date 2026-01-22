package com.cupl.backend.service;

import com.cupl.backend.dto.PlayerRequest;
import com.cupl.backend.model.Club;
import com.cupl.backend.model.Player;
import com.cupl.backend.model.User;
import com.cupl.backend.model.User.UserRole;
import com.cupl.backend.repository.ClubRepository;
import com.cupl.backend.repository.PlayerRepository;
import com.cupl.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class PlayerService {
    private final PlayerRepository playerRepository;
    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final PasswordEncoder passwordEncoder;

    public PlayerService(PlayerRepository playerRepository, UserRepository userRepository, ClubRepository clubRepository, PasswordEncoder passwordEncoder) {
        this.playerRepository = playerRepository;
        this.userRepository = userRepository;
        this.clubRepository = clubRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Player createPlayer(PlayerRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        if (playerRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        Player player = new Player();
        player.setFullName(request.getFullName());
        player.setGender(request.getGender());
        player.setDateOfBirth(request.getDateOfBirth());
        player.setUniversity(request.getUniversity());
        player.setTeamLevel(request.getTeamLevel());
        player.setEmail(email);
        player.setPassword(passwordEncoder.encode(request.getPassword()));
        player.setPhone(request.getPhone());
        player.setMedicalConditions(request.getMedicalConditions());
        player.setComments(request.getComments());

        // Automatically assign player to club based on university
        // Try to find a club that matches the university name
        String university = request.getUniversity();
        Optional<Club> clubOpt = clubRepository.findFirstByNameContainingIgnoreCase(university);
        if (clubOpt.isEmpty()) {
            String normalized = university.toLowerCase().replace("padel", "").replace("club", "").trim();
            if (!normalized.isBlank()) {
                clubOpt = clubRepository.findFirstByNameContainingIgnoreCase(normalized);
            }
        }
        clubOpt.ifPresent(club -> player.setClubId(club.getId()));

        Player savedPlayer = playerRepository.save(player);

        // Also create a User account for login
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.USER);
        userRepository.save(user);

        return savedPlayer;
    }
}
