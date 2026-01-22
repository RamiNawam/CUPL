package com.cupl.backend.repository;

import com.cupl.backend.model.Event;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EventRepository extends JpaRepository<Event, UUID> {
    @Query("SELECT e FROM Event e ORDER BY e.createdAt DESC")
    List<Event> findAllOrderByCreatedAtDesc();
}
