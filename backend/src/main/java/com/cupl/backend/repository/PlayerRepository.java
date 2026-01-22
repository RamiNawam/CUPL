package com.cupl.backend.repository;

import com.cupl.backend.model.Player;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PlayerRepository extends JpaRepository<Player, UUID> {
    boolean existsByEmail(String email);
    
    List<Player> findByUniversity(String university);
 
    Page<Player> findByClubId(UUID clubId, Pageable pageable);

    long countByClubId(UUID clubId);
 
    @Query("SELECT p FROM Player p JOIN PlayerTeam pt ON p.id = pt.playerId WHERE pt.teamId = ?1")
    List<Player> findByTeamId(UUID teamId);
    
    @Query("SELECT p FROM Player p WHERE LOWER(p.university) LIKE LOWER(CONCAT('%', ?1, '%')) OR LOWER(p.fullName) LIKE LOWER(CONCAT('%', ?1, '%')) OR LOWER(p.email) LIKE LOWER(CONCAT('%', ?1, '%'))")
    List<Player> searchPlayers(String searchTerm);
}
