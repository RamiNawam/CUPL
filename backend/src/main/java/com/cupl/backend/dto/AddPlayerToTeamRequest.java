package com.cupl.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class AddPlayerToTeamRequest {
    @NotNull
    private UUID playerId;

    @NotNull
    private UUID teamId;

    public UUID getPlayerId() {
        return playerId;
    }

    public void setPlayerId(UUID playerId) {
        this.playerId = playerId;
    }

    public UUID getTeamId() {
        return teamId;
    }

    public void setTeamId(UUID teamId) {
        this.teamId = teamId;
    }
}
