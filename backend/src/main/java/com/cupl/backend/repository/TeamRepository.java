package com.cupl.backend.repository;

import com.cupl.backend.model.Team;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, UUID> {
    List<Team> findByClubId(UUID clubId);
}
