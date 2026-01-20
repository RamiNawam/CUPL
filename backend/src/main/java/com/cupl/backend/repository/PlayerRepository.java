package com.cupl.backend.repository;

import com.cupl.backend.model.Player;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlayerRepository extends JpaRepository<Player, UUID> {
    boolean existsByEmail(String email);
}
