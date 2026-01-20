package com.cupl.backend.service;

import com.cupl.backend.dto.PlayerRequest;
import com.cupl.backend.model.Player;
import com.cupl.backend.model.User;
import com.cupl.backend.model.User.UserRole;
import com.cupl.backend.repository.PlayerRepository;
import com.cupl.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PlayerService {
    private final PlayerRepository playerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PlayerService(PlayerRepository playerRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.playerRepository = playerRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Player createPlayer(PlayerRequest request) {
        if (playerRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        Player player = new Player();
        player.setFullName(request.getFullName());
        player.setGender(request.getGender());
        player.setDateOfBirth(request.getDateOfBirth());
        player.setUniversity(request.getUniversity());
        player.setTeamLevel(request.getTeamLevel());
        player.setEmail(request.getEmail());
        player.setPassword(passwordEncoder.encode(request.getPassword()));
        player.setPhone(request.getPhone());
        player.setMedicalConditions(request.getMedicalConditions());
        player.setComments(request.getComments());

        Player savedPlayer = playerRepository.save(player);

        // Also create a User account for login
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.USER);
        userRepository.save(user);

        return savedPlayer;
    }
}
