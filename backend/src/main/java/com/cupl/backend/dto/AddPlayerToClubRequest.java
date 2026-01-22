package com.cupl.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class AddPlayerToClubRequest {
    @NotNull
    private UUID playerId;

    public UUID getPlayerId() {
        return playerId;
    }

    public void setPlayerId(UUID playerId) {
        this.playerId = playerId;
    }
}
