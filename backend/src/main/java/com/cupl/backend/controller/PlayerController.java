package com.cupl.backend.controller;

import com.cupl.backend.dto.PlayerRequest;
import com.cupl.backend.model.Player;
import com.cupl.backend.service.PlayerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/players")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class PlayerController {
    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @PostMapping
    public ResponseEntity<Player> createPlayer(@Valid @RequestBody PlayerRequest request) {
        Player saved = playerService.createPlayer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
