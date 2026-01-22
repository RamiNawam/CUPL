package com.cupl.backend.repository;

import com.cupl.backend.model.PlayerTeam;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlayerTeamRepository extends JpaRepository<PlayerTeam, UUID> {
    List<PlayerTeam> findByTeamId(UUID teamId);
    List<PlayerTeam> findByPlayerId(UUID playerId);
    List<PlayerTeam> findByPlayerIdAndTeamId(UUID playerId, UUID teamId);
    void deleteByPlayerIdAndTeamId(UUID playerId, UUID teamId);
}
