package com.cupl.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "test_connection")
public class TestConnection {
    
    @Id
    private String id;
    
    private String message;
    
    private Instant createdAt;
    
    public TestConnection() {
    }
    
    public TestConnection(String id, String message) {
        this.id = id;
        this.message = message;
        this.createdAt = Instant.now();
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Instant getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
