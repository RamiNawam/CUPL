package com.cupl.backend.service;

import com.cupl.backend.dto.PlayerRequest;
import com.cupl.backend.model.Player;
import com.cupl.backend.repository.PlayerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PlayerService {
    private final PlayerRepository playerRepository;

    public PlayerService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    public Player createPlayer(PlayerRequest request) {
        if (playerRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        Player player = new Player();
        player.setFullName(request.getFullName());
        player.setGender(request.getGender());
        player.setDateOfBirth(request.getDateOfBirth());
        player.setUniversity(request.getUniversity());
        player.setTeamLevel(request.getTeamLevel());
        player.setEmail(request.getEmail());
        player.setPhone(request.getPhone());
        player.setMedicalConditions(request.getMedicalConditions());
        player.setComments(request.getComments());

        return playerRepository.save(player);
    }
}
