package com.cupl.backend.repository;

import com.cupl.backend.model.Club;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ClubRepository extends JpaRepository<Club, UUID> {
    @Query("SELECT c FROM Club c WHERE LOWER(c.email) = LOWER(?1)")
    Optional<Club> findByEmail(String email);

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN TRUE ELSE FALSE END FROM Club c WHERE LOWER(c.email) = LOWER(?1)")
    boolean existsByEmail(String email);

    Optional<Club> findFirstByNameContainingIgnoreCase(String name);
}
